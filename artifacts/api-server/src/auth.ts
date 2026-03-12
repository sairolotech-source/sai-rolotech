import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import { storage } from "./storage.js";
import { firebaseAuth } from "@workspace/db";
import type { User } from "@workspace/db/schema";
import { sendOTPEmail, sendSuspiciousLoginAlert } from "./email.js";

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

function getClientIp(req: any): string {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
}

function isUnusualHour(): boolean {
  const hour = new Date().getHours();
  return hour >= 23 || hour < 5;
}

async function logAuditEvent(eventType: string, opts: { userId?: string; username?: string; ip?: string; deviceFingerprint?: string; metadata?: any }) {
  try {
    await storage.createAuditLog({
      eventType,
      userId: opts.userId || null,
      username: opts.username || null,
      ip: opts.ip || null,
      deviceFingerprint: opts.deviceFingerprint || null,
      metadata: opts.metadata || null,
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      password: string;
      email: string | null;
      name: string;
      phone: string;
      role: string;
      companyName: string | null;
      gstNo: string | null;
      location: string | null;
      state: string | null;
      machineSpecialization: string | null;
      isVerified: boolean | null;
      isApproved: boolean | null;
      isEmailVerified: boolean | null;
      twoFactorEnabled: boolean | null;
      twoFactorSecret: string | null;
      allowedDevices: string[] | null;
      lastDeviceFingerprint: string | null;
      warningCount: number | null;
      isFrozen: boolean | null;
      failedLoginAttempts: number | null;
      accountLockedUntil: Date | null;
      lastLoginAt: Date | null;
      createdAt: Date | null;
    }
    interface Request {
      user?: User;
    }
  }
}

async function verifyFirebaseToken(req: Request): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split("Bearer ")[1];
  if (!token) return null;
  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function setupAuth(app: Express) {
  app.use(async (req: Request, _res: Response, next: NextFunction) => {
    const firebaseUid = await verifyFirebaseToken(req);
    if (firebaseUid) {
      try {
        let user = await storage.getUserById(firebaseUid);
        if (!user) {
          try {
            const fbUser = await firebaseAuth.getUser(firebaseUid);
            if (fbUser.email) {
              user = await storage.getUserByEmail(fbUser.email);
            }
          } catch {}
        }
        if (user) {
          req.user = user;
        }
      } catch {}
    }
    next();
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, name, phone, email, role, companyName, gstNo, location, state, firebaseToken } = req.body;
      if (!username || !password || !name || !phone) {
        return res.status(400).json({ message: "Username, password, name, and phone are required" });
      }
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      let userId: string | undefined;

      if (firebaseToken) {
        try {
          const decoded = await firebaseAuth.verifyIdToken(firebaseToken);
          userId = decoded.uid;
        } catch {
          return res.status(401).json({ message: "Invalid Firebase token" });
        }
      }

      if (!userId) {
        try {
          const firebaseUser = await firebaseAuth.createUser({
            email: email || undefined,
            password,
            displayName: name,
            phoneNumber: phone.startsWith("+") ? phone : undefined,
          });
          userId = firebaseUser.uid;
        } catch (fbErr: any) {
          if (fbErr.code === "auth/email-already-exists") {
            return res.status(400).json({ message: "Email already exists in Firebase Auth" });
          }
          return res.status(500).json({ message: "Failed to create Firebase Auth account: " + (fbErr.message || "Unknown error") });
        }
      }

      const hashedPassword = await hashPassword(password);
      const privilegedRoles = ["admin", "sub_admin", "assembly_head"];
      const safeRole = privilegedRoles.includes(role) ? "buyer" : (role || "buyer");
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email: email || null,
        name,
        phone,
        role: safeRole,
        companyName: companyName || null,
        gstNo: gstNo || null,
        location: location || null,
        state: state || null,
        machineSpecialization: null,
        isVerified: false,
        isApproved: true,
        isEmailVerified: !email,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        allowedDevices: null,
        lastDeviceFingerprint: null,
        warningCount: 0,
        isFrozen: false,
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      }, userId);

      if (email) {
        const code = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await storage.createOtpCode({ userId: user.id, email, code, purpose: "email_verify", expiresAt });
        console.log(`[OTP] Email verify code for ${email}: ${code}`);
        return res.status(201).json({
          message: "Account created! Please verify your email.",
          userId: user.id,
          requiresEmailVerification: true,
          email,
        });
      }

      await logAuditEvent("user_registered", {
        userId: user.id,
        username: user.username,
        ip: getClientIp(req),
      });

      return res.status(201).json({
        message: "Account created! You can now login.",
        userId: user.id,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, firebaseToken, deviceFingerprint } = req.body;
      const clientIp = getClientIp(req);
      const fp = deviceFingerprint || req.headers["user-agent"] || "unknown";

      let user: Awaited<ReturnType<typeof storage.getUserById>> | null = null;

      if (firebaseToken) {
        let decoded;
        try {
          decoded = await firebaseAuth.verifyIdToken(firebaseToken);
        } catch {
          return res.status(401).json({ message: "Invalid Firebase token" });
        }
        user = await storage.getUserById(decoded.uid) || null;
        if (!user && decoded.email) {
          user = await storage.getUserByEmail(decoded.email) || null;
        }
        if (!user) {
          return res.status(404).json({ message: "No account found for this Firebase user. Please register first." });
        }
      } else {
        if (!username || !password) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        user = await storage.getUserByUsername(username) || null;
        if (!user) {
          await logAuditEvent("login_failed", {
            username,
            ip: clientIp,
            deviceFingerprint: fp,
            metadata: { reason: "user_not_found" },
          });
          return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.accountLockedUntil && new Date(user.accountLockedUntil) > new Date()) {
          const minutesLeft = Math.ceil((new Date(user.accountLockedUntil).getTime() - Date.now()) / 60000);
          await logAuditEvent("login_blocked", {
            userId: user.id,
            username: user.username,
            ip: clientIp,
            metadata: { reason: "account_locked", minutesLeft },
          });
          return res.status(401).json({ message: `Account locked. Try again in ${minutesLeft} minute(s).` });
        }

        const valid = await comparePasswords(password, user.password);
        if (!valid) {
          const updated = await storage.incrementFailedLogin(user.id);
          const attempts = updated?.failedLoginAttempts || 0;

          await logAuditEvent("login_failed", {
            userId: user.id,
            username: user.username,
            ip: clientIp,
            deviceFingerprint: fp,
            metadata: { reason: "invalid_password", attempts },
          });

          if (attempts >= 5) {
            await storage.lockAccount(user.id, 15);
            await logAuditEvent("account_locked", {
              userId: user.id,
              username: user.username,
              ip: clientIp,
              metadata: { reason: "brute_force_protection" },
            });
            return res.status(401).json({ message: "Account locked for 15 minutes due to too many failed attempts." });
          }
          return res.status(401).json({ message: "Invalid credentials" });
        }

        await storage.resetFailedLogin(user.id);
      }

      if (user.isFrozen) return res.status(401).json({ message: "Your account is frozen due to community violations. Contact support." });
      if (!user.isApproved && user.role !== "admin") {
        return res.status(403).json({ message: "Your account is pending admin approval.", requiresApproval: true });
      }

      if (user.twoFactorEnabled && user.email) {
        const code = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await storage.createOtpCode({ userId: user.id, email: user.email, code, purpose: "2fa", expiresAt });

        await logAuditEvent("otp_sent", {
          userId: user.id,
          username: user.username,
          ip: clientIp,
          metadata: { email: user.email },
        });

        sendOTPEmail(user.email, code, user.username || user.name || "User").catch(() => {});
        if (process.env.NODE_ENV === "development") {
          console.log(`[OTP] 2FA code for ${user.email}: ${code}`);
        }

        return res.json({ requires2FA: true, email: user.email });
      }

      let suspicious = false;
      if (user.lastDeviceFingerprint && user.lastDeviceFingerprint !== fp) {
        suspicious = true;
        await logAuditEvent("suspicious_login", {
          userId: user.id,
          username: user.username,
          ip: clientIp,
          deviceFingerprint: fp,
          metadata: { reason: "new_device", previousDevice: user.lastDeviceFingerprint },
        });
        if (user.email) {
          sendSuspiciousLoginAlert(user.email, user.username, {
            ip: clientIp,
            reason: "new_device",
            timestamp: new Date().toLocaleString("en-IN"),
          }).catch(() => {});
        }
      }
      if (isUnusualHour()) {
        suspicious = true;
        await logAuditEvent("suspicious_login", {
          userId: user.id,
          username: user.username,
          ip: clientIp,
          metadata: { reason: "unusual_hour", hour: new Date().getHours() },
        });
        if (user.email) {
          sendSuspiciousLoginAlert(user.email, user.username, {
            ip: clientIp,
            reason: "unusual_hour",
            timestamp: new Date().toLocaleString("en-IN"),
          }).catch(() => {});
        }
      }

      await storage.updateUser(user.id, { lastDeviceFingerprint: fp, lastLoginAt: new Date() });

      try {
        await storage.createActiveSession({
          sid: user.id + "_" + Date.now(),
          userId: user.id,
          username: user.username,
          ip: clientIp,
          deviceFingerprint: fp,
        });
      } catch (e) {
        console.error("Failed to track session:", e);
      }

      await logAuditEvent("login_success", {
        userId: user.id,
        username: user.username,
        ip: clientIp,
        deviceFingerprint: fp,
        metadata: suspicious ? { suspicious: true } : undefined,
      });

      const customToken = await firebaseAuth.createCustomToken(user.id);

      const { password: _, twoFactorSecret: _s, ...safeUser } = user;
      return res.json({ ...safeUser, customToken });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Login failed" });
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) return res.status(400).json({ message: "Email and code are required" });

      const otp = await storage.getValidOtpCode(email, code, "email_verify");
      if (!otp) return res.status(400).json({ message: "Invalid or expired OTP code" });

      await storage.markOtpUsed(otp.id);

      const user = await storage.getUserByEmail(email);
      if (user) {
        await storage.updateUser(user.id, { isEmailVerified: true });
      }

      return res.json({ message: "Email verified successfully" });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Verification failed" });
    }
  });

  app.post("/api/auth/verify-2fa", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) return res.status(400).json({ message: "Email and code are required" });

      const clientIp = getClientIp(req);
      const deviceFingerprint = req.body.deviceFingerprint || req.headers["user-agent"] || "unknown";

      const otp = await storage.getValidOtpCode(email, code, "2fa");
      if (!otp) {
        await logAuditEvent("otp_failed", {
          ip: clientIp,
          metadata: { reason: "invalid_or_expired", email },
        });
        return res.status(400).json({ message: "Invalid or expired 2FA code" });
      }

      await storage.markOtpUsed(otp.id);

      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.isFrozen) return res.status(401).json({ message: "Your account is frozen." });

      await storage.updateUser(user.id, {
        lastDeviceFingerprint: deviceFingerprint,
        lastLoginAt: new Date(),
      });

      try {
        await storage.createActiveSession({
          sid: user.id + "_" + Date.now(),
          userId: user.id,
          username: user.username,
          ip: clientIp,
          deviceFingerprint,
        });
      } catch (e) {
        console.error("Failed to track session:", e);
      }

      await logAuditEvent("otp_verified", {
        userId: user.id,
        username: user.username,
        ip: clientIp,
      });

      await logAuditEvent("login_success", {
        userId: user.id,
        username: user.username,
        ip: clientIp,
        deviceFingerprint,
        metadata: { via: "2fa" },
      });

      let customToken: string | undefined;
      try {
        customToken = await firebaseAuth.createCustomToken(user.id);
      } catch {}

      const { password: _, twoFactorSecret: _s, ...safeUser } = user;
      return res.json({ ...safeUser, customToken });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "2FA verification failed" });
    }
  });

  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { email, purpose } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const otpPurpose = purpose || "email_verify";
      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const user = await storage.getUserByEmail(email);
      await storage.createOtpCode({
        userId: user?.id || null,
        email,
        code,
        purpose: otpPurpose,
        expiresAt,
      });

      sendOTPEmail(email, code, user?.username || user?.name || "User").catch(() => {});
      console.log(`[OTP] Code for ${email} (${otpPurpose}): ${code}`);

      return res.json({ message: "OTP sent successfully" });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Failed to send OTP" });
    }
  });

  app.post("/api/auth/toggle-2fa", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { enabled } = req.body;
      if (enabled && !user.email) {
        return res.status(400).json({ message: "Email is required to enable 2FA" });
      }
      await storage.updateUser(user.id, { twoFactorEnabled: !!enabled });
      await logAuditEvent("2fa_toggled", {
        userId: user.id,
        username: user.username,
        ip: getClientIp(req),
        metadata: { enabled: !!enabled },
      });
      return res.json({ message: enabled ? "2FA enabled" : "2FA disabled", twoFactorEnabled: !!enabled });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/logout", (_req, res) => {
    if (_req.user) {
      logAuditEvent("logout", {
        userId: _req.user.id,
        username: _req.user.username,
        ip: getClientIp(_req),
      }).catch(() => {});
    }
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    const { password: _, twoFactorSecret: _s, ...safeUser } = req.user;
    res.json(safeUser);
  });

  app.get("/api/auth/my-sessions", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getUserActiveSessions(req.user!.id);
      return res.json(sessions);
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/auth/my-sessions/:id", requireAuth, async (req, res) => {
    try {
      const sessions = await storage.getUserActiveSessions(req.user!.id);
      const target = sessions.find(s => s.id === req.params.id);
      if (!target) return res.status(404).json({ message: "Session not found" });
      await storage.revokeSession(req.params.id);
      await logAuditEvent("session_revoked", {
        userId: req.user!.id,
        username: req.user!.username,
        ip: getClientIp(req),
        metadata: { revokedSessionId: req.params.id, selfRevoke: true },
      });
      return res.json({ message: "Session revoked" });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/approve-user", requireSuperAdmin, async (req, res) => {
    try {
      const { userId, approved } = req.body;
      if (!userId) return res.status(400).json({ message: "User ID required" });
      const user = await storage.updateUser(userId, { isApproved: approved !== false });
      if (!user) return res.status(404).json({ message: "User not found" });
      await logAuditEvent("user_approval_changed", {
        userId: req.user!.id,
        username: req.user!.username,
        ip: getClientIp(req),
        metadata: { targetUserId: userId, approved: approved !== false },
      });
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
      await logAuditEvent("2fa_toggled", {
        userId: req.user!.id,
        username: req.user!.username,
        ip: getClientIp(req),
        metadata: { targetUserId: userId, enabled: !!enabled },
      });
      return res.json({ message: enabled ? "2FA enabled" : "2FA disabled" });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  if (req.user.isFrozen) return res.status(403).json({ message: "Your account is frozen due to community violations." });
  next();
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  if (req.user.role !== "admin" && req.user.role !== "sub_admin") return res.status(403).json({ message: "Admin access required" });
  next();
};

export const requireSuperAdmin: RequestHandler = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Super admin access required" });
  next();
};

export const requireAssemblyHead: RequestHandler = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  if (req.user.role !== "assembly_head" && req.user.role !== "admin") return res.status(403).json({ message: "Assembly Head access required" });
  next();
};

export const requireEngineer: RequestHandler = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  if (req.user.role !== "engineer" && req.user.role !== "admin" && req.user.role !== "sub_admin") {
    return res.status(403).json({ message: "Engineer access required" });
  }
  next();
};
