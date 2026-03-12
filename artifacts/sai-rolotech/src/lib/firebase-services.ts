import app from "./firebase";
import { getPerformance, type FirebasePerformance } from "firebase/performance";
import { getRemoteConfig, fetchAndActivate, getValue, type RemoteConfig } from "firebase/remote-config";
import { getAnalytics, setAnalyticsCollectionEnabled, logEvent, type Analytics } from "firebase/analytics";
import { hasAnalyticsConsent } from "./google-analytics";

let performance: FirebasePerformance | null = null;
let remoteConfig: RemoteConfig | null = null;
let analytics: Analytics | null = null;

function isFirebaseConfigured(): boolean {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return !!apiKey && apiKey !== "placeholder" && !apiKey.startsWith("placeholder");
}

export function initializeFirebasePerformance(): void {
  if (!isFirebaseConfigured() || !hasAnalyticsConsent()) return;
  try {
    performance = getPerformance(app);
  } catch {
  }
}

export function initializeFirebaseAnalytics(): void {
  if (!isFirebaseConfigured() || !hasAnalyticsConsent()) return;
  try {
    if (!analytics) {
      analytics = getAnalytics(app);
    }
    setAnalyticsCollectionEnabled(analytics, true);
  } catch {
  }
}

export function disableFirebaseAnalytics(): void {
  if (!analytics) return;
  try {
    setAnalyticsCollectionEnabled(analytics, false);
  } catch {
  }
}

export function logFirebaseEvent(eventName: string, params?: Record<string, any>): void {
  if (!analytics || !hasAnalyticsConsent()) return;
  try {
    logEvent(analytics, eventName, params);
  } catch {
  }
}

export async function initializeRemoteConfig(): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    remoteConfig = getRemoteConfig(app);
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
    remoteConfig.defaultConfig = {
      maintenance_mode: false,
      promo_banner_text: "",
      promo_banner_enabled: false,
      min_app_version: "1.0.0",
    };
    await fetchAndActivate(remoteConfig);
  } catch {
  }
}

export function getRemoteConfigValue(key: string): string {
  if (!remoteConfig) return "";
  try {
    return getValue(remoteConfig, key).asString();
  } catch {
    return "";
  }
}

export function getRemoteConfigBoolean(key: string): boolean {
  if (!remoteConfig) return false;
  try {
    return getValue(remoteConfig, key).asBoolean();
  } catch {
    return false;
  }
}

export { performance, remoteConfig, analytics };
