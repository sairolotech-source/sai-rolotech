import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage.js";
import { db, pool } from "@workspace/db";
import { otpCodes } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";
import type { User } from "@workspace/db/schema";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

declare global {
  namespace Express {
    interface User extends import("@workspace/db/schema").User {}
  }
}

export function setupAuth(app: Express) {
  const PgStore = connectPgSimple(session);

  const sessionMiddleware = session({
    store: new PgStore({
      pool: pool as any,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "sai-rolotech-secret-2024",
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
        if (user.isFrozen) return done(null, false, { message: "Your account is frozen due to community violations. Contact support." });
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
      if (!username || !password || !name || !phone) {
        return res.status(400).json({ message: "Username, password, name, and phone are required" });
      }
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email: email || null,
        name,
        phone,
        role: role || "buyer",
        companyName: companyName || null,
        gstNo: gstNo || null,
        location: location || null,
        state: state || null,
        isVerified: false,
        isApproved: true,
        isEmailVerified: true,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        allowedDevices: null,
        lastDeviceFingerprint: null,
      });

      return res.status(201).json({
        message: "Account created! You can now login.",
        userId: user.id,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    const deviceFingerprint = req.body.deviceFingerprint || req.headers["user-agent"] || "unknown";

    passport.authenticate("local", async (err: any, user: User | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });

      if (!user.isApproved && user.role !== "admin") {
        return res.status(403).json({
          message: "Your account is pending admin approval.",
          requiresApproval: true,
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
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Authentication required" });
  if (req.user!.isFrozen) return res.status(403).json({ message: "Your account is frozen due to community violations." });
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
