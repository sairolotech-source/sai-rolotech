import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BarChart3, Mail, Shield, ExternalLink, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { onAnalyticsConsentGranted, onAnalyticsConsentRevoked } from "@/lib/google-analytics";

const CONSENT_VERSION = "1.0";
const CONSENT_STORAGE_KEY = "consent_shown_v";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface ConsentCategory {
  id: string;
  label: string;
  labelHi: string;
  description: string;
  descriptionHi: string;
  icon: typeof Bell;
  enabled: boolean;
}

export default function ConsentPopup() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ConsentCategory[]>([
    {
      id: "push_notifications",
      label: "Push Notifications",
      labelHi: "पुश सूचनाएं",
      description: "Receive order updates, reminders, and promotional offers via push notifications.",
      descriptionHi: "ऑर्डर अपडेट, रिमाइंडर और प्रमोशनल ऑफर पुश नोटिफिकेशन से प्राप्त करें।",
      icon: Bell,
      enabled: true,
    },
    {
      id: "marketing",
      label: "Marketing & Promotions",
      labelHi: "मार्केटिंग और प्रमोशन",
      description: "Receive promotional messages about new machines, offers, and industry updates.",
      descriptionHi: "नई मशीनों, ऑफर और इंडस्ट्री अपडेट के बारे में प्रमोशनल संदेश प्राप्त करें।",
      icon: Mail,
      enabled: true,
    },
    {
      id: "analytics",
      label: "Analytics & Personalization",
      labelHi: "एनालिटिक्स और पर्सनलाइज़ेशन",
      description: "Allow us to analyze app usage to improve your experience and show relevant content.",
      descriptionHi: "हमें ऐप उपयोग का विश्लेषण करने दें ताकि आपका अनुभव बेहतर हो सके।",
      icon: BarChart3,
      enabled: true,
    },
  ]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const storageKey = `${CONSENT_STORAGE_KEY}${CONSENT_VERSION}_${user.id}`;
    const alreadyShown = localStorage.getItem(storageKey);
    if (alreadyShown) return;

    const checkConsents = async () => {
      try {
        const res = await fetch("/api/consent", { credentials: "include" });
        if (res.ok) {
          const consents = await res.json();
          const requiredCategories = ["push_notifications", "marketing", "analytics"];
          const addressedCategories = consents.filter(
            (c: any) => c.consentVersion === CONSENT_VERSION && (c.status === "accepted" || c.status === "declined")
          ).map((c: any) => c.category);
          const allAddressed = requiredCategories.every(cat => addressedCategories.includes(cat));
          if (!allAddressed) {
            setVisible(true);
          } else {
            localStorage.setItem(storageKey, "1");
          }
        }
      } catch {
        setVisible(true);
      }
    };

    const timer = setTimeout(checkConsents, 1500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  const toggleCategory = (id: string) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleSubmit = async (acceptAll: boolean) => {
    setLoading(true);
    try {
      const consents = categories.map(c => ({
        category: c.id,
        status: acceptAll ? "accepted" : c.enabled ? "accepted" : "declined",
        consentVersion: CONSENT_VERSION,
      }));

      await apiRequest("POST", "/api/consent", { consents });

      const analyticsAccepted = consents.find(c => c.category === "analytics" && c.status === "accepted");
      if (analyticsAccepted) {
        onAnalyticsConsentGranted();
      } else {
        onAnalyticsConsentRevoked();
      }

      const pushAccepted = consents.find(c => c.category === "push_notifications" && c.status === "accepted");
      if (pushAccepted && "serviceWorker" in navigator && "PushManager" in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const settingsRes = await fetch("/api/settings", { credentials: "include" });
            const settings = settingsRes.ok ? await settingsRes.json() : {};
            const vapidKey = settings?.vapidPublicKey;
            if (vapidKey) {
              const registration = await navigator.serviceWorker.ready;
              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
              });
              const subJson = subscription.toJSON();
              if (subJson.endpoint && subJson.keys) {
                await apiRequest("POST", "/api/push-subscribe", {
                  endpoint: subJson.endpoint,
                  p256dh: subJson.keys.p256dh,
                  auth: subJson.keys.auth,
                });
              }
            }
          }
        } catch (pushErr) {
          console.log("Push subscription not available:", pushErr);
        }
      }

      const storageKey = `${CONSENT_STORAGE_KEY}${CONSENT_VERSION}_${user!.id}`;
      localStorage.setItem(storageKey, "1");
      setVisible(false);
      toast({ title: "Preferences saved / प्राथमिकताएं सहेजी गईं" });
    } catch (err: any) {
      toast({ title: "Error saving preferences", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineAll = async () => {
    setLoading(true);
    try {
      const consents = categories.map(c => ({
        category: c.id,
        status: "declined",
        consentVersion: CONSENT_VERSION,
      }));
      await apiRequest("POST", "/api/consent", { consents });
      onAnalyticsConsentRevoked();
      const storageKey = `${CONSENT_STORAGE_KEY}${CONSENT_VERSION}_${user!.id}`;
      localStorage.setItem(storageKey, "1");
      setVisible(false);
      toast({ title: "Preferences saved" });
    } catch {
      toast({ title: "Error saving preferences", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-3"
        data-testid="consent-popup-overlay"
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl glass-card shadow-2xl"
          data-testid="consent-popup"
        >
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold" data-testid="consent-title">Data & Notification Consent</h2>
                <p className="text-[10px] text-muted-foreground">डेटा और सूचना सहमति</p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mb-4 space-y-2">
              <p>
                Sai Rolotech collects and processes your data as described below. Under the
                <strong> Digital Personal Data Protection Act (DPDPA) 2023</strong>, you have the right to
                accept or decline each category and withdraw consent at any time.
              </p>
              <p className="text-[11px]">
                साई रोलोटेक नीचे बताए अनुसार आपका डेटा एकत्र और प्रोसेस करता है। <strong>डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट (DPDPA) 2023</strong> के तहत,
                आपको हर श्रेणी को स्वीकार या अस्वीकार करने और किसी भी समय सहमति वापस लेने का अधिकार है।
              </p>
            </div>

            <div className="space-y-3 mb-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-accent/20"
                  data-testid={`consent-category-${cat.id}`}
                >
                  <div className="mt-0.5">
                    <cat.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold">{cat.label}</p>
                        <p className="text-[10px] text-muted-foreground">{cat.labelHi}</p>
                      </div>
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${
                          cat.enabled ? "bg-primary" : "bg-muted"
                        }`}
                        data-testid={`toggle-${cat.id}`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            cat.enabled ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{cat.description}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{cat.descriptionHi}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/privacy"
              className="flex items-center gap-1.5 text-[10px] text-primary hover:underline mb-4"
              data-testid="link-privacy-notice"
            >
              <ExternalLink className="w-3 h-3" />
              Read full Privacy Notice / पूरी गोपनीयता सूचना पढ़ें
            </a>

            <div className="space-y-2">
              <Button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="w-full"
                data-testid="button-accept-all"
              >
                {loading ? "Saving..." : "Accept All / सभी स्वीकार करें"}
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                variant="outline"
                className="w-full"
                data-testid="button-save-preferences"
              >
                Save My Preferences / मेरी प्राथमिकताएं सहेजें
              </Button>
              <button
                onClick={handleDeclineAll}
                disabled={loading}
                className="w-full text-[10px] text-muted-foreground hover:text-foreground py-2 transition-colors"
                data-testid="button-decline-all"
              >
                Decline All / सभी अस्वीकार करें
              </button>
            </div>

            <p className="text-[9px] text-muted-foreground text-center mt-3">
              You can change these preferences anytime from Settings &gt; Notification Preferences.
              <br />
              आप इन प्राथमिकताओं को कभी भी सेटिंग्स से बदल सकते हैं।
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
