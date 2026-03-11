import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { otpCodes } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { generateOTP, sendOTPEmail, sendApprovalNotification } from "./email";
import type { User } from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

declare global {
  namespace Express {
    interface User extends import("@shared/schema").User {}
  }
}

export function setupAuth(app: Express) {
  const PgStore = connectPgSimple(session);

  const sessionMiddleware = session({
    store: new PgStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  });

  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false, { message: "Invalid credentials" });
        const valid = await comparePasswords(password, user.password);
        if (!valid) return done(null, false, { message: "Invalid credentials" });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user || null);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, name, phone, email, role, companyName, gstNo, location, state } = req.body;
      if (!username || !password || !name || !phone || !email) {
        return res.status(400).json({ message: "Username, password, name, phone, and email are required" });
      }
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        name,
        phone,
        role: role || "buyer",
        companyName: companyName || null,
        gstNo: gstNo || null,
        location: location || null,
        state: state || null,
        isVerified: false,
        isApproved: false,
        isEmailVerified: false,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        allowedDevices: null,
        lastDeviceFingerprint: null,
      });

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await db.insert(otpCodes).values({
        userId: user.id,
        email,
        code: otp,
        purpose: "email_verify",
        expiresAt,
      });

      await sendOTPEmail(email, otp, "verify");

      return res.status(201).json({
        message: "Account created! Please verify your email with the OTP sent.",
        userId: user.id,
        email,
        requiresEmailVerification: true,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Registration failed" });
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { userId, email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ message: "Email and OTP code are required" });
      }

      const [otpRecord] = await db.select().from(otpCodes)
        .where(and(
          eq(otpCodes.email, email),
          eq(otpCodes.code, code),
          eq(otpCodes.purpose, "email_verify"),
          eq(otpCodes.isUsed, false),
          gt(otpCodes.expiresAt, new Date())
        ))
        .limit(1);

      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      if (userId && otpRecord.userId && userId !== otpRecord.userId) {
        return res.status(403).json({ message: "OTP does not match this account" });
      }

      await db.update(otpCodes).set({ isUsed: true }).where(eq(otpCodes.id, otpRecord.id));

      const targetUserId = otpRecord.userId || userId;
      if (targetUserId) {
        const targetUser = await storage.getUserById(targetUserId);
        if (targetUser && targetUser.email === email) {
          await storage.updateUser(targetUserId, { isEmailVerified: true });
        } else {
          return res.status(403).json({ message: "Email does not match account" });
        }
      }

      return res.json({
        message: "Email verified! Your account is pending admin approval.",
        requiresApproval: true,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  const otpRateLimiter = new Map<string, number>();
  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { email, purpose } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const lastSent = otpRateLimiter.get(email) || 0;
      if (Date.now() - lastSent < 60000) {
        return res.status(429).json({ message: "Please wait 60 seconds before requesting another OTP" });
      }

      if (purpose === "login_2fa") {
        return res.status(400).json({ message: "2FA codes are sent automatically during login" });
      }

      const users = await storage.getUsers();
      const userExists = users.some(u => u.email === email);
      if (!userExists) {
        return res.json({ message: "OTP sent to your email" });
      }

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await db.insert(otpCodes).values({
        email,
        code: otp,
        purpose: purpose || "email_verify",
        expiresAt,
      });

      otpRateLimiter.set(email, Date.now());
      await sendOTPEmail(email, otp, purpose || "verify");
      return res.json({ message: "OTP sent to your email" });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    const deviceFingerprint = req.body.deviceFingerprint || req.headers["user-agent"] || "unknown";

    passport.authenticate("local", async (err: any, user: User | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });

      if (!user.isEmailVerified) {
        return res.status(403).json({
          message: "Please verify your email first",
          requiresEmailVerification: true,
          email: user.email,
          userId: user.id,
        });
      }

      if (!user.isApproved && user.role !== "admin") {
        return res.status(403).json({
          message: "Your account is pending admin approval. You will be notified once approved.",
          requiresApproval: true,
        });
      }

      if (user.allowedDevices && user.allowedDevices.length > 0) {
        if (!user.allowedDevices.includes(deviceFingerprint)) {
          return res.status(403).json({
            message: "This device is not authorized. Please contact admin to add your device.",
            deviceRestricted: true,
            deviceFingerprint,
          });
        }
      }

      if (user.twoFactorEnabled && user.email) {
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await db.insert(otpCodes).values({
          userId: user.id,
          email: user.email,
          code: otp,
          purpose: "login_2fa",
          expiresAt,
        });
        await sendOTPEmail(user.email, otp, "login");

        return res.json({
          requires2FA: true,
          userId: user.id,
          message: "2FA code sent to your email",
        });
      }

      await storage.updateUser(user.id, {
        lastDeviceFingerprint: deviceFingerprint,
        lastLoginAt: new Date(),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const { password: _, twoFactorSecret: _s, ...safeUser } = user;
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/auth/verify-2fa", async (req, res) => {
    try {
      const { userId, code, deviceFingerprint } = req.body;
      if (!userId || !code) {
        return res.status(400).json({ message: "User ID and OTP code are required" });
      }

      const [otpRecord] = await db.select().from(otpCodes)
        .where(and(
          eq(otpCodes.userId, userId),
          eq(otpCodes.code, code),
          eq(otpCodes.purpose, "login_2fa"),
          eq(otpCodes.isUsed, false),
          gt(otpCodes.expiresAt, new Date())
        ))
        .limit(1);

      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired 2FA code" });
      }

      await db.update(otpCodes).set({ isUsed: true }).where(eq(otpCodes.id, otpRecord.id));

      const user = await storage.getUserById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.isEmailVerified) {
        return res.status(403).json({ message: "Email not verified" });
      }
      if (!user.isApproved && user.role !== "admin") {
        return res.status(403).json({ message: "Account not approved" });
      }

      const fp = deviceFingerprint || req.headers["user-agent"] || "unknown";

      if (user.allowedDevices && user.allowedDevices.length > 0) {
        if (!user.allowedDevices.includes(fp)) {
          return res.status(403).json({ message: "This device is not authorized", deviceRestricted: true });
        }
      }

      await storage.updateUser(user.id, {
        lastDeviceFingerprint: fp,
        lastLoginAt: new Date(),
      });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        const { password: _, twoFactorSecret: _s, ...safeUser } = user;
        return res.json(safeUser);
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const { password: _, twoFactorSecret: _s, ...safeUser } = req.user!;
    res.json(safeUser);
  });

  app.post("/api/admin/approve-user", requireSuperAdmin, async (req, res) => {
    try {
      const { userId, approved } = req.body;
      if (!userId) return res.status(400).json({ message: "User ID required" });

      const user = await storage.updateUser(userId, { isApproved: approved !== false });
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.email) {
        await sendApprovalNotification(user.email, approved !== false);
      }

      return res.json({ message: approved !== false ? "User approved" : "User approval revoked", user });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/toggle-2fa", requireSuperAdmin, async (req, res) => {
    try {
      const { userId, enabled } = req.body;
      if (!userId) return res.status(400).json({ message: "User ID required" });

      const user = await storage.updateUser(userId, { twoFactorEnabled: !!enabled });
      if (!user) return res.status(404).json({ message: "User not found" });

      return res.json({ message: enabled ? "2FA enabled" : "2FA disabled" });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/manage-device", requireSuperAdmin, async (req, res) => {
    try {
      const { userId, deviceFingerprint, action } = req.body;
      if (!userId || !deviceFingerprint) return res.status(400).json({ message: "User ID and device fingerprint required" });

      const user = await storage.getUserById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      let devices = user.allowedDevices || [];
      if (action === "add") {
        if (!devices.includes(deviceFingerprint)) {
          devices = [...devices, deviceFingerprint];
        }
      } else if (action === "remove") {
        devices = devices.filter(d => d !== deviceFingerprint);
      }

      await storage.updateUser(userId, { allowedDevices: devices });
      return res.json({ message: `Device ${action === "add" ? "added" : "removed"}`, devices });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/set-device-restriction", requireSuperAdmin, async (req, res) => {
    try {
      const { userId, enabled } = req.body;
      if (!userId) return res.status(400).json({ message: "User ID required" });

      const user = await storage.getUserById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (enabled) {
        const currentDevice = user.lastDeviceFingerprint;
        const devices = currentDevice ? [currentDevice] : [];
        await storage.updateUser(userId, { allowedDevices: devices });
        return res.json({ message: "Device restriction enabled. Current device added.", devices });
      } else {
        await storage.updateUser(userId, { allowedDevices: null });
        return res.json({ message: "Device restriction disabled" });
      }
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Authentication required" });
  next();
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Authentication required" });
  if (req.user!.role !== "admin" && req.user!.role !== "sub_admin") return res.status(403).json({ message: "Admin access required" });
  next();
};

export const requireSuperAdmin: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Authentication required" });
  if (req.user!.role !== "admin") return res.status(403).json({ message: "Super admin access required" });
  next();
};
