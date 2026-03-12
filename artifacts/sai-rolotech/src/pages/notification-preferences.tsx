import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Bell, Mail, BarChart3, Shield, Loader2 } from "lucide-react";
import { onAnalyticsConsentGranted, onAnalyticsConsentRevoked } from "@/lib/google-analytics";

const CONSENT_VERSION = "1.0";

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

const CATEGORIES = [
  {
    id: "push_notifications",
    label: "Push Notifications",
    labelHi: "पुश सूचनाएं",
    description: "Order updates, reminders, and promotional offers via push notifications.",
    descriptionHi: "पुश नोटिफिकेशन द्वारा ऑर्डर अपडेट, रिमाइंडर और प्रमोशनल ऑफर।",
    icon: Bell,
  },
  {
    id: "marketing",
    label: "Marketing & Promotions",
    labelHi: "मार्केटिंग और प्रमोशन",
    description: "Promotional messages about new machines, offers, and industry updates.",
    descriptionHi: "नई मशीनों, ऑफर और इंडस्ट्री अपडेट के बारे में प्रमोशनल संदेश।",
    icon: Mail,
  },
  {
    id: "analytics",
    label: "Analytics & Personalization",
    labelHi: "एनालिटिक्स और पर्सनलाइज़ेशन",
    description: "Analyze app usage to improve experience and show relevant content.",
    descriptionHi: "ऐप उपयोग का विश्लेषण करके अनुभव बेहतर बनाना और प्रासंगिक सामग्री दिखाना।",
    icon: BarChart3,
  },
];

export default function NotificationPreferences() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    push_notifications: false,
    marketing: false,
    analytics: false,
  });

  const { data: consents, isLoading } = useQuery<any[]>({
    queryKey: ["/api/consent"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (consents) {
      const prefs: Record<string, boolean> = {};
      for (const c of consents) {
        prefs[c.category] = c.status === "accepted";
      }
      setPreferences(prev => ({ ...prev, ...prefs }));
    }
  }, [consents]);

  const updateMutation = useMutation({
    mutationFn: async ({ category, status }: { category: string; status: string }) => {
      await apiRequest("PUT", "/api/consent", {
        category,
        status,
        consentVersion: CONSENT_VERSION,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consent"] });
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Notification Preferences</h1>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">Login Required</p>
            <p className="text-sm text-muted-foreground mt-1">Please login to manage your notification preferences.</p>
            <Button onClick={() => setLocation("/auth")} className="mt-4" data-testid="button-login">Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleToggle = async (categoryId: string) => {
    const newStatus = preferences[categoryId] ? "withdrawn" : "accepted";
    setPreferences(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));

    try {
      await updateMutation.mutateAsync({ category: categoryId, status: newStatus });

      if (categoryId === "analytics") {
        if (newStatus === "accepted") {
          onAnalyticsConsentGranted();
        } else {
          onAnalyticsConsentRevoked();
        }
      }

      if (categoryId === "push_notifications") {
        if ("serviceWorker" in navigator && "PushManager" in window) {
          try {
            if (newStatus === "accepted") {
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
            } else {
              const registration = await navigator.serviceWorker.ready;
              const existingSub = await registration.pushManager.getSubscription();
              if (existingSub) {
                await existingSub.unsubscribe();
              }
            }
          } catch (pushErr) {
            console.log("Push subscription change not available:", pushErr);
          }
        }
      }

      toast({
        title: newStatus === "accepted"
          ? `${CATEGORIES.find(c => c.id === categoryId)?.label} enabled`
          : `${CATEGORIES.find(c => c.id === categoryId)?.label} disabled`,
      });
    } catch {
      setPreferences(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
      toast({ title: "Failed to update preference", variant: "destructive" });
    }
  };

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold" data-testid="text-preferences-title">Notification Preferences</h1>
          <p className="text-xs text-muted-foreground">सूचना प्राथमिकताएं</p>
        </div>
      </div>

      <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Under the <strong>DPDPA 2023</strong>, you have the right to withdraw consent at any time.
              Changes take effect immediately.
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              <strong>DPDPA 2023</strong> के तहत, आपको किसी भी समय सहमति वापस लेने का अधिकार है। परिवर्तन तुरंत प्रभावी होते हैं।
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const consent = consents?.find((c: any) => c.category === cat.id);
            return (
              <Card key={cat.id} data-testid={`pref-card-${cat.id}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <cat.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{cat.label}</p>
                          <p className="text-[10px] text-muted-foreground">{cat.labelHi}</p>
                        </div>
                        <button
                          onClick={() => handleToggle(cat.id)}
                          className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                            preferences[cat.id] ? "bg-primary" : "bg-muted"
                          }`}
                          data-testid={`toggle-pref-${cat.id}`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                              preferences[cat.id] ? "translate-x-[22px]" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">{cat.description}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{cat.descriptionHi}</p>
                      {consent && (
                        <p className="text-[9px] text-muted-foreground mt-2">
                          Last updated: {new Date(consent.updatedAt).toLocaleDateString("en-IN")}
                          {consent.withdrawnAt && ` | Withdrawn: ${new Date(consent.withdrawnAt).toLocaleDateString("en-IN")}`}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <a
          href="/privacy"
          className="text-xs text-primary hover:underline"
          data-testid="link-privacy-notice"
        >
          Read Full Privacy Notice / पूरी गोपनीयता सूचना पढ़ें →
        </a>
      </div>
    </div>
  );
}
