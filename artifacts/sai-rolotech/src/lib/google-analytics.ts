import { GOOGLE_CONFIG } from "./google-config";

let consentActive = false;

function isPlaceholder(id: string): boolean {
  return !id || id.startsWith("G-XXXX") || id.startsWith("GTM-XXXX") || id === "";
}

export function hasAnalyticsConsent(): boolean {
  try {
    const consentData = localStorage.getItem("analytics_consent_granted");
    return consentData === "true";
  } catch {
    return false;
  }
}

export function initializeGoogleServices(): void {
  if (hasAnalyticsConsent()) {
    grantGtagConsent();
  }
}

function grantGtagConsent(): void {
  if (isPlaceholder(GOOGLE_CONFIG.GA4_MEASUREMENT_ID)) return;
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("consent", "update", {
      analytics_storage: "granted",
    });
    (window as any).gtag("config", GOOGLE_CONFIG.GA4_MEASUREMENT_ID, {
      send_page_view: false,
    });
  }
  consentActive = true;
}

function denyGtagConsent(): void {
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("consent", "update", {
      analytics_storage: "denied",
    });
  }
  consentActive = false;
}

export function trackEvent(eventName: string, params?: Record<string, any>): void {
  if (!consentActive) return;
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, params);
  }
}

export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (!consentActive) return;
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "page_view", {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
}

export function trackChatbotOpen(): void {
  trackEvent("chatbot_open");
}

export function trackQuotationRequest(details?: Record<string, any>): void {
  trackEvent("quotation_request", details);
}

export function trackJobApply(jobTitle?: string): void {
  trackEvent("job_apply", { job_title: jobTitle });
}

export function trackWhatsAppClick(): void {
  trackEvent("whatsapp_click");
}

export function trackVideoCallBooking(): void {
  trackEvent("video_call_booking");
}

export function trackFormSubmission(formName: string): void {
  trackEvent("form_submission", { form_name: formName });
}

export function trackButtonClick(buttonName: string, section?: string): void {
  trackEvent("button_click", { button_name: buttonName, section });
}

export function onAnalyticsConsentGranted(): void {
  localStorage.setItem("analytics_consent_granted", "true");
  grantGtagConsent();
  import("./firebase-services").then((m) => m.initializeFirebaseAnalytics()).catch(() => {});
}

export function onAnalyticsConsentRevoked(): void {
  localStorage.setItem("analytics_consent_granted", "false");
  denyGtagConsent();
  import("./firebase-services").then((m) => m.disableFirebaseAnalytics()).catch(() => {});
}
