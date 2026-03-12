import { Router } from "express";
import { storage as db } from "../storage.js";
import { requireSuperAdmin } from "../auth.js";

const router = Router();

router.get("/admin/security/audit-logs", requireSuperAdmin, async (req, res) => {
  try {
    const { eventType, userId, limit, offset } = req.query;
    const logs = await db.getAuditLogs({
      eventType: eventType as string | undefined,
      userId: userId as string | undefined,
      limit: limit ? parseInt(limit as string) : 100,
      offset: offset ? parseInt(offset as string) : 0,
    });
    return res.json(logs);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/security/failed-login-count", requireSuperAdmin, async (req, res) => {
  try {
    const count = await db.getFailedLoginCount24h();
    return res.json({ count });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/security/active-sessions", requireSuperAdmin, async (req, res) => {
  try {
    const sessions = await db.getActiveSessions();
    return res.json(sessions);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/security/sessions/:id", requireSuperAdmin, async (req, res) => {
  try {
    const session = (await db.getActiveSessions()).find(s => s.id === req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    await db.revokeSession(req.params.id);

    try {
      await db.createAuditLog({
        eventType: "session_revoked",
        userId: (req as any).user?.id,
        username: (req as any).user?.username,
        ip: req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.ip || "unknown",
        metadata: { revokedSessionId: req.params.id, revokedUserId: session.userId, adminRevoke: true },
      });
    } catch (e) {
      console.error("Failed to log audit:", e);
    }

    return res.json({ message: "Session revoked" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/security/locked-accounts", requireSuperAdmin, async (req, res) => {
  try {
    const accounts = await db.getLockedAccounts();
    const safe = accounts.map(({ password, twoFactorSecret, ...rest }) => rest);
    return res.json(safe);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.post("/admin/security/unlock-account/:userId", requireSuperAdmin, async (req, res) => {
  try {
    const user = await db.unlockAccount(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    try {
      await db.createAuditLog({
        eventType: "account_unlocked",
        userId: (req as any).user?.id,
        username: (req as any).user?.username,
        ip: req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.ip || "unknown",
        metadata: { unlockedUserId: req.params.userId, unlockedUsername: user.username },
      });
    } catch (e) {
      console.error("Failed to log audit:", e);
    }

    return res.json({ message: "Account unlocked", username: user.username });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/admin/security/summary", requireSuperAdmin, async (req, res) => {
  try {
    const [failedCount, lockedAccounts, activeSessions, recentLogs] = await Promise.all([
      db.getFailedLoginCount24h(),
      db.getLockedAccounts(),
      db.getActiveSessions(),
      db.getAuditLogs({ limit: 10 }),
    ]);
    return res.json({
      failedLogins24h: failedCount,
      lockedAccountsCount: lockedAccounts.length,
      activeSessionsCount: activeSessions.length,
      recentEvents: recentLogs,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
