import cron from "node-cron";
import pg from "pg";
import { storage } from "../storage.js";

interface CleanupStats {
  expiredOtpsRemoved: number;
  completedAt: string;
}

let lastCleanupStats: CleanupStats | null = null;

export function getLastCleanupStats(): CleanupStats | null {
  return lastCleanupStats;
}

async function ensurePostgresTables(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return;

  const client = new pg.Client({ connectionString });
  try {
    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR,
        email VARCHAR NOT NULL,
        code VARCHAR NOT NULL,
        purpose VARCHAR NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_consents (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        category VARCHAR NOT NULL,
        status VARCHAR NOT NULL,
        ip VARCHAR,
        consent_version VARCHAR NOT NULL,
        withdrawn_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notification_subscriptions (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        endpoint VARCHAR NOT NULL,
        p256dh VARCHAR NOT NULL,
        auth VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  } catch (err) {
    console.error("[Scheduler] Failed to ensure PostgreSQL tables:", err);
  } finally {
    await client.end().catch(() => {});
  }
}

async function deleteExpiredOtps(): Promise<number> {
  let removed = 0;

  try {
    removed = await storage.deleteExpiredOtps();
  } catch (err) {
    console.warn("[Scheduler] Firestore OTP cleanup unavailable, skipping:", (err as Error).message?.slice(0, 80));
  }

  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    const client = new pg.Client({ connectionString });
    try {
      await client.connect();
      const result = await client.query("DELETE FROM otp_codes WHERE expires_at < NOW()");
      removed += (result.rowCount ?? 0);
    } catch (err) {
      console.warn("[Scheduler] PostgreSQL OTP cleanup error:", (err as Error).message?.slice(0, 80));
    } finally {
      await client.end().catch(() => {});
    }
  }

  return removed;
}

async function runDailyCleanup(): Promise<void> {
  console.log("[Scheduler] Starting daily cleanup...");

  let expiredOtpsRemoved = 0;
  try {
    expiredOtpsRemoved = await deleteExpiredOtps();
  } catch (err) {
    console.error("[Scheduler] Failed to clean expired OTPs:", err);
  }

  lastCleanupStats = {
    expiredOtpsRemoved,
    completedAt: new Date().toISOString(),
  };

  console.log("[Scheduler] Cleanup complete:", lastCleanupStats);
}

export function startScheduler(): void {
  ensurePostgresTables().catch(err => {
    console.error("[Scheduler] Failed to create PostgreSQL tables:", err);
  });

  cron.schedule("0 2 * * *", () => {
    runDailyCleanup().catch((err) => {
      console.error("[Scheduler] Daily cleanup failed:", err);
    });
  });

  console.log("[Scheduler] Daily cleanup job scheduled (runs at 02:00 AM)");

  setTimeout(() => {
    runDailyCleanup().catch((err) => {
      console.error("[Scheduler] Initial cleanup failed:", err);
    });
  }, 10000);
}
