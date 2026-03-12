import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { AppSettings } from "@shared/schema";
import CinematicSplash from "@/components/CinematicSplash";
import { Home as HomeIcon, Compass, Factory, Gauge, Phone, User, Shield, MessageCircle, X, Send, Bot, AlertTriangle, Loader2, Bell, Clipboard, Wrench } from "lucide-react";
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import ConsentPopup from "@/components/ConsentPopup";
import { motion, AnimatePresence } from "framer-motion";
import RippleIcon from "@/components/RippleIcon";
import { trackChatbotOpen, trackWhatsAppClick, trackPageView } from "@/lib/google-analytics";

const Home = lazy(() => import("@/pages/home"));
const Catalog = lazy(() => import("@/pages/catalog"));
const Directory = lazy(() => import("@/pages/directory"));
const ROICalculator = lazy(() => import("@/pages/roi-calculator"));
const GSTCalculator = lazy(() => import("@/pages/gst-calculator"));
const Subsidies = lazy(() => import("@/pages/subsidies"));
const Service = lazy(() => import("@/pages/service"));
const Tools = lazy(() => import("@/pages/tools"));
const CoilRate = lazy(() => import("@/pages/coil-rate"));
const Contact = lazy(() => import("@/pages/contact"));
const Auth = lazy(() => import("@/pages/auth"));
const Admin = lazy(() => import("@/pages/admin"));
const VisitBooking = lazy(() => import("@/pages/visit-booking"));
const Suppliers = lazy(() => import("@/pages/suppliers"));
const SupplierProfilePage = lazy(() => import("@/pages/supplier-profile"));
const SupplierMePage = lazy(() => import("@/pages/supplier-me"));
const SupportTicketPage = lazy(() => import("@/pages/support-ticket"));
const AmcPlansPage = lazy(() => import("@/pages/amc-plans"));
const QuotationPage = lazy(() => import("@/pages/quotation"));
const EMICalculator = lazy(() => import("@/pages/emi-calculator"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));
const DocumentsPage = lazy(() => import("@/pages/documents"));
const InspectionPage = lazy(() => import("@/pages/inspection"));
const MachineHealthPage = lazy(() => import("@/pages/machine-health"));
const QuoteComparePage = lazy(() => import("@/pages/quote-compare"));
const OperatorTrainingPage = lazy(() => import("@/pages/operator-training"));
const CRMPage = lazy(() => import("@/pages/crm"));
const AssemblyPage = lazy(() => import("@/pages/assembly"));
const BusinessGuidePage = lazy(() => import("@/pages/business-guide"));
const RFCalculator = lazy(() => import("@/pages/rf-calculator"));
const IndustryMap = lazy(() => import("@/pages/industry-map"));
const NotificationPreferences = lazy(() => import("@/pages/notification-preferences"));
const OldMachines = lazy(() => import("@/pages/old-machines"));
const BroadcastFeed = lazy(() => import("@/pages/broadcast-feed"));
const SuperNavigation = lazy(() => import("@/pages/super-navigation"));
const VendorPortal = lazy(() => import("@/pages/vendor-portal"));
const MachineTroubleshootingPage = lazy(() => import("@/pages/machine-troubleshooting"));
const NearMePage = lazy(() => import("@/pages/near-me"));
const ManufacturerProfilePage = lazy(() => import("@/pages/manufacturer-profile"));
const EngineerDashboard = lazy(() => import("@/pages/engineer"));
const JobsPage = lazy(() => import("@/pages/jobs"));
const Explore = lazy(() => import("@/pages/explore"));
const CategoryDetail = lazy(() => import("@/pages/category-detail"));
const VideoCallBookingPage = lazy(() => import("@/pages/video-call-booking"));
const ReferEarn = lazy(() => import("@/pages/refer-earn"));
const IndustryDataPage = lazy(() => import("@/pages/industry-data"));
const ProductionShare = lazy(() => import("@/pages/production-share"));
const ManufacturerRankings = lazy(() => import("@/pages/manufacturer-rankings"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-primary" />
      </motion.div>
    </div>
  );
}

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
      style={{
        background: "linear-gradient(-45deg, #0055CC, #0077FF, #00D4FF, #7B2FFF, #0077FF)",
        backgroundSize: "400% 400%",
        animation: "mesh-shift 6s ease infinite",
      }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      onClick={onComplete}
      aria-label="Loading splash screen, tap to skip"
      data-testid="splash-screen"
    >
      <motion.div
        className="absolute w-[300px] h-[300px] opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(0,212,255,0.6) 0%, transparent 70%)",
          animation: "blob-morph 8s ease-in-out infinite",
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[250px] h-[250px] opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(123,47,255,0.6) 0%, transparent 70%)",
          animation: "blob-morph 10s ease-in-out infinite reverse",
        }}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 20, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-22 h-22 rounded-3xl flex items-center justify-center mb-6 relative"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 60px rgba(0,212,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
          border: "1px solid rgba(255,255,255,0.2)",
          width: 88,
          height: 88,
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{ boxShadow: "0 0 40px rgba(0,119,255,0.5)" }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-white relative z-10"
          style={{ textShadow: "0 0 20px rgba(255,255,255,0.5)" }}
        >
          S
        </motion.span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-2xl font-bold text-white mb-1"
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
      >
        Sai Rolotech
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="text-xs text-white/70 uppercase tracking-[0.3em] font-medium"
      >
        Industrial Ecosystem
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="mt-10 flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.6)", boxShadow: "0 0 8px rgba(255,255,255,0.4)" }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 text-[10px] text-white/40 uppercase tracking-widest"
      >
        Roll Forming Machines
      </motion.p>
    </motion.div>
  );
}

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Namaste! I'm Sai Rolotech's assistant. Ask me about our machines, pricing, delivery, or anything else!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    const updatedMessages: ChatMessage[] = [...messages, { role: "user", text: userMsg }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/client/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Sorry, I'm having trouble. Please call us at +91 9090-486-262." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-[88px] right-3 z-[60] w-[calc(100%-24px)] max-w-[340px] rounded-2xl shadow-xl overflow-hidden glass-card"
            data-testid="chatbot-window"
          >
            <div className="bg-gradient-to-r from-[#0077FF] to-[#00D4FF] text-white px-4 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <div>
                  <p className="text-sm font-semibold">Sai Rolotech</p>
                  <p className="text-[10px] opacity-80">Online | Quick Replies</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full" data-testid="button-close-chat">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-[300px] overflow-y-auto p-3 space-y-3 bg-accent/20">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-[#0077FF] to-[#00D4FF] text-white rounded-br-md"
                        : "glass-card rounded-bl-md"
                    }`}
                    data-testid={`chat-message-${i}`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="glass-card rounded-2xl rounded-bl-md px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center gap-2 p-2 border-t border-white/10">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Type your question..."
                disabled={isLoading}
                className="flex-1 h-8 px-3 text-xs rounded-full border border-white/10 bg-accent/30 outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm disabled:opacity-50"
                data-testid="input-chat-message"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0077FF] to-[#00D4FF] text-white flex items-center justify-center disabled:opacity-50"
                data-testid="button-send-chat"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-1.5 px-2 pb-2 overflow-x-auto scrollbar-hide">
              {["Prices", "Shutter Patti", "Gypsum", "False Ceiling", "Delivery", "Contact"].map(q => (
                <button
                  key={q}
                  disabled={isLoading}
                  onClick={() => {
                    if (isLoading) return;
                    const newMsgs: ChatMessage[] = [...messages, { role: "user", text: q }];
                    setMessages(newMsgs);
                    setIsLoading(true);
                    fetch("/api/client/chat", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ messages: newMsgs }),
                    })
                      .then(r => r.json())
                      .then(data => setMessages(prev => [...prev, { role: "bot", text: data.reply }]))
                      .catch(() => setMessages(prev => [...prev, { role: "bot", text: "Sorry, please call +91 9090-486-262." }]))
                      .finally(() => setIsLoading(false));
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-full glass-card whitespace-nowrap shrink-0 hover:bg-accent/50 transition-colors disabled:opacity-50"
                  data-testid={`button-quick-reply-${q.toLowerCase().replace(" ", "-")}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RippleIcon
        className="fixed bottom-[72px] right-3 z-[55] w-12 h-12 rounded-full shadow-lg flex items-center justify-center glossy-btn"
        onClick={() => {
          if (!isOpen) trackChatbotOpen();
          setIsOpen(!isOpen);
        }}
        data-testid="button-open-chat"
        style={{
          background: "linear-gradient(135deg, #0077FF, #00D4FF)",
          boxShadow: "0 4px 20px rgba(0,119,255,0.4)",
        }}
      >
        <motion.div
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.05 }}
          className="w-full h-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-5 h-5 text-white" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <MessageCircle className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </RippleIcon>
    </>
  );
}

function WhatsAppButton() {
  return (
    <RippleIcon
      as="a"
      href="https://wa.me/919090486262?text=Hi%20Sai%20Rolotech%2C%20I%27m%20interested%20in%20your%20machines"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick()}
      className="fixed bottom-[72px] left-3 z-[55] w-12 h-12 rounded-full shadow-lg flex items-center justify-center glossy-btn"
      data-testid="button-whatsapp"
      style={{
        background: "linear-gradient(135deg, #25D366, #128C7E)",
        boxShadow: "0 4px 20px rgba(37,211,102,0.35)",
      }}
    >
      <motion.div
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        className="w-full h-full flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.7 }}
      >
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </motion.div>
    </RippleIcon>
  );
}

function BottomNav() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isAdmin, isAssemblyHead, isEngineer } = useAuth();

  const tabs = [
    { icon: HomeIcon, label: "Home", path: "/" },
    { icon: Compass, label: "Explore", path: "/explore" },
    ...(isEngineer ? [{ icon: Wrench, label: "Engineer", path: "/engineer" }] : []),
    ...(isAdmin ? [{ icon: Shield, label: "CRM", path: "/crm" }] : isAssemblyHead ? [{ icon: Clipboard, label: "Assembly", path: "/assembly" }] : [{ icon: Phone, label: "Contact", path: "/contact" }]),
  ];

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 safe-area-bottom" data-testid="nav-bottom">
      <div className="max-w-lg mx-auto glass-nav rounded-2xl px-2 py-1.5">
        <div className="flex items-center justify-around gap-1">
          {tabs.map((tab) => {
            const isActive = tab.path === "/" ? location === "/" : location.startsWith(tab.path);
            return (
              <RippleIcon
                key={tab.path}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all relative ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setLocation(tab.path)}
                data-testid={`nav-${tab.label.toLowerCase()}`}
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="flex flex-col items-center gap-0.5"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(0,119,255,0.12), rgba(0,212,255,0.08))",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <tab.icon className={`w-5 h-5 relative z-10 ${isActive ? "stroke-[2.5px]" : ""}`} />
                  <span className="text-[10px] font-medium relative z-10">{tab.label}</span>
                </motion.div>
              </RippleIcon>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function AppHeader() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isAdmin, user } = useAuth();

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/broadcast-notifications/count"],
    enabled: !!user,
    refetchInterval: 30000,
  });

  if (location !== "/") return null;

  return (
    <header className="sticky top-0 z-40 glass-header aurora-shimmer border-b border-white/10 px-4 py-3 flex items-center justify-between gap-1" data-testid="header">
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white glossy-btn"
          style={{
            background: "linear-gradient(135deg, #0077FF, #00D4FF)",
            boxShadow: "0 2px 10px rgba(0,119,255,0.3)",
          }}
        >
          S
        </div>
        <div>
          <h1 className="text-sm font-bold leading-none gradient-text" data-testid="text-app-title">Sai Rolotech</h1>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Industrial Ecosystem</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {user && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setLocation("/broadcasts")}
            className="p-2 rounded-xl hover:bg-accent/50 text-muted-foreground transition-colors relative"
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5" />
            {(unreadCount?.count ?? 0) > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount!.count > 9 ? "9+" : unreadCount!.count}
              </span>
            )}
          </motion.button>
        )}
        {isAdmin && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setLocation("/admin")}
            className="p-2 rounded-xl hover:bg-accent/50 text-primary transition-colors"
            data-testid="button-admin"
          >
            <Shield className="w-5 h-5" />
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setLocation(isAuthenticated ? "/admin" : "/auth")}
          className="p-2 rounded-xl hover:bg-accent/50 text-muted-foreground transition-colors"
          data-testid="button-profile"
        >
          <User className="w-5 h-5" />
        </motion.button>
      </div>
    </header>
  );
}

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { type: "spring", stiffness: 300, damping: 30 },
};

function AppRouter() {
  const [location, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);

  useEffect(() => {
    trackPageView(location);
  }, [location]);

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location}
          initial={pageTransition.initial}
          animate={pageTransition.animate}
          exit={pageTransition.exit}
          transition={pageTransition.transition}
        >
          <Switch>
            <Route path="/" component={() => <Home onNavigate={navigate} />} />
            <Route path="/catalog" component={Catalog} />
            <Route path="/directory" component={Directory} />
            <Route path="/roi" component={ROICalculator} />
            <Route path="/gst" component={GSTCalculator} />
            <Route path="/subsidies" component={Subsidies} />
            <Route path="/service" component={Service} />
            <Route path="/tools" component={() => <Tools onNavigate={navigate} />} />
            <Route path="/explore" component={() => <Explore onNavigate={navigate} />} />
            <Route path="/category/:id" component={() => <CategoryDetail onNavigate={navigate} />} />
            <Route path="/coil-rate" component={CoilRate} />
            <Route path="/contact" component={Contact} />
            <Route path="/auth" component={Auth} />
            <Route path="/admin" component={Admin} />
            <Route path="/engineer" component={EngineerDashboard} />
            <Route path="/visit" component={VisitBooking} />
            <Route path="/suppliers" component={Suppliers} />
            <Route path="/supplier/me" component={SupplierMePage} />
            <Route path="/supplier/:id" component={SupplierProfilePage} />
            <Route path="/support" component={SupportTicketPage} />
            <Route path="/amc" component={AmcPlansPage} />
            <Route path="/quotation" component={QuotationPage} />
            <Route path="/emi" component={EMICalculator} />
            <Route path="/terms" component={Terms} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/documents" component={DocumentsPage} />
            <Route path="/inspection" component={InspectionPage} />
            <Route path="/machine-health" component={MachineHealthPage} />
            <Route path="/quote-compare" component={QuoteComparePage} />
            <Route path="/training" component={OperatorTrainingPage} />
            <Route path="/crm" component={CRMPage} />
            <Route path="/assembly" component={AssemblyPage} />
            <Route path="/business-guide" component={BusinessGuidePage} />
            <Route path="/rf-calculator" component={RFCalculator} />
            <Route path="/industry-map" component={IndustryMap} />
            <Route path="/settings/notifications" component={NotificationPreferences} />
            <Route path="/old-machines" component={() => <OldMachines onNavigate={navigate} />} />
            <Route path="/broadcasts" component={BroadcastFeed} />
            <Route path="/super-navigation" component={SuperNavigation} />
            <Route path="/vendor-portal" component={VendorPortal} />
            <Route path="/machine-troubleshooting" component={MachineTroubleshootingPage} />
            <Route path="/near-me" component={NearMePage} />
            <Route path="/manufacturer/:id" component={ManufacturerProfilePage} />
            <Route path="/jobs" component={JobsPage} />
            <Route path="/video-call" component={VideoCallBookingPage} />
            <Route path="/refer-earn" component={ReferEarn} />
            <Route path="/industry-data" component={IndustryDataPage} />
            <Route path="/production-share" component={ProductionShare} />
            <Route path="/manufacturer-rankings" component={ManufacturerRankings} />
            <Route component={NotFound} />
          </Switch>
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
}

function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center mesh-gradient-bg p-6 text-center">
      <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
      <h1 className="text-xl font-bold mb-2">Under Maintenance</h1>
      <p className="text-sm text-muted-foreground mb-4">We are upgrading our systems. Please check back shortly.</p>
      <p className="text-xs text-muted-foreground">Sai Rolotech | +91 9090-486-262</p>
    </div>
  );
}

function AnnouncementBar({ text }: { text: string }) {
  return (
    <div
      className="text-white px-4 py-1.5 text-center text-[11px] font-medium"
      style={{ background: "linear-gradient(90deg, #0077FF, #00D4FF, #0077FF)" }}
      data-testid="announcement-bar"
    >
      {text}
    </div>
  );
}

function AppContent() {
  const { data: settings } = useQuery<AppSettings>({ queryKey: ["/api/settings"] });
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return typeof window !== "undefined"
        ? sessionStorage.getItem("splash_played") !== "1"
        : true;
    } catch {
      return true;
    }
  });

  const chatbotOn = settings?.chatbotEnabled !== false;
  const whatsappOn = settings?.whatsappButtonEnabled !== false;
  const splashOn = settings?.splashScreenEnabled !== false;
  const maintenanceOn = settings?.maintenanceMode === true;
  const announcementOn = settings?.announcementEnabled === true && settings?.announcementText;

  const handleSplashComplete = useCallback(() => {
    try { sessionStorage.setItem("splash_played", "1"); } catch {}
    setShowSplash(false);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (maintenanceOn) return <MaintenancePage />;

  return (
    <>
      <AnimatePresence>
        {showSplash && splashOn && <CinematicSplash onComplete={handleSplashComplete} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: (showSplash && splashOn) ? 0 : 1 }}
        className="flex flex-col min-h-screen pb-20 mesh-gradient-bg"
      >
        {announcementOn && <AnnouncementBar text={settings!.announcementText!} />}
        <AppHeader />
        <main className="flex-1">
          <AppRouter />
        </main>
        <BottomNav />
        {chatbotOn && <ChatBot />}
        {whatsappOn && <WhatsAppButton />}
        <ConsentPopup />
      </motion.div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
