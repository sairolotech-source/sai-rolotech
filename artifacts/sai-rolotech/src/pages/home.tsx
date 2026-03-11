import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Post, MarketPrice, Banner, Dealer } from "@shared/schema";
import { Heart, Share2, ChevronRight, Factory, Wrench, Calculator, Phone, CalendarCheck, Building2, Headphones, Shield, FileSpreadsheet, ClipboardCheck, FolderOpen, TrendingUp, TrendingDown, Minus, Activity, Scale, MapPin, Sun, IndianRupee, Eye, UserPlus, CheckCircle2, Store, Star, Gauge, BookOpen, Flag, Camera, Send, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / (duration * 1000);
      if (elapsed >= 1) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(end * elapsed));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value, duration, inView]);

  return <span ref={ref}>{count.toLocaleString("en-IN")}</span>;
}

function ScrollReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function HeroSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <GlassCard className="relative overflow-hidden mx-4 mt-4 mb-6 border-0">
      <div
        className="relative py-10 px-5"
        style={{
          background: "linear-gradient(-45deg, #4338ca, #6366f1, #7c3aed, #3b82f6)",
          backgroundSize: "300% 300%",
          animation: "mesh-shift 12s ease infinite",
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(167,139,250,0.8) 0%, transparent 70%)", animation: "blob-morph 8s ease-in-out infinite" }}
          />
          <div
            className="absolute -bottom-5 -left-5 w-32 h-32 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, rgba(96,165,250,0.8) 0%, transparent 70%)", animation: "blob-morph 10s ease-in-out infinite reverse" }}
          />
        </div>
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-semibold text-indigo-200 uppercase tracking-widest mb-2"
            data-testid="text-hero-label"
          >
            Industrial Ecosystem
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2"
            data-testid="text-hero-title"
          >
            Sai Rolotech
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-sm text-white/80 mb-5 max-w-sm"
            data-testid="text-hero-subtitle"
          >
            Roll Forming Machines, Shutter Patti, POP Channel & More
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-2 items-center"
          >
            <Button size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white shadow-lg" onClick={() => onNavigate("/catalog")} data-testid="button-explore-catalog">
              Explore Machines
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button size="sm" variant="outline" className="backdrop-blur-sm bg-white/10 border-white/20 text-white" onClick={() => onNavigate("/contact")} data-testid="button-contact">
              <Phone className="w-4 h-4 mr-1" />
              Contact Us
            </Button>
          </motion.div>
        </div>
      </div>
    </GlassCard>
  );
}

function QuickActions({ onNavigate }: { onNavigate: (path: string) => void }) {
  const actions = [
    { icon: Factory, label: "Machines", path: "/catalog", color: "bg-primary/10 text-primary" },
    { icon: Building2, label: "Suppliers", path: "/suppliers", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
    { icon: Headphones, label: "Support", path: "/support", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
    { icon: Shield, label: "AMC", path: "/amc", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    { icon: CalendarCheck, label: "Visit", path: "/visit", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
    { icon: Wrench, label: "Service", path: "/service", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { icon: FileSpreadsheet, label: "Quotation", path: "/quotation", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
    { icon: Calculator, label: "ROI Calc", path: "/roi", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { icon: FolderOpen, label: "Documents", path: "/documents", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
    { icon: ClipboardCheck, label: "QC Check", path: "/inspection", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
    { icon: TrendingUp, label: "Market", path: "/coil-rate", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
    { icon: Activity, label: "Health", path: "/machine-health", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
    { icon: Scale, label: "Compare", path: "/quote-compare", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    { icon: BookOpen, label: "Training", path: "/training", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
  ];

  return (
    <div className="flex gap-3 px-4 mb-6 overflow-x-auto scrollbar-hide">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          onClick={() => onNavigate(action.path)}
          className="flex flex-col items-center gap-2 p-3 rounded-2xl glass-card transition-all min-w-[72px] shrink-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03, type: "spring", stiffness: 300 }}
          whileTap={{ scale: 0.93 }}
          data-testid={`button-quick-${action.label.toLowerCase().replace(" ", "-")}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
            <action.icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-foreground">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

function BannerCarousel({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { data: bannerList } = useQuery<Banner[]>({ queryKey: ["/api/banners"] });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!bannerList || bannerList.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % bannerList.length), 4000);
    return () => clearInterval(timer);
  }, [bannerList]);

  if (!bannerList || bannerList.length === 0) return null;

  const banner = bannerList[current];

  const gradientMap: Record<string, string> = {
    "from-blue-600 to-cyan-600": "bg-gradient-to-r from-blue-600 to-cyan-600",
    "from-emerald-600 to-teal-600": "bg-gradient-to-r from-emerald-600 to-teal-600",
    "from-indigo-600 to-purple-600": "bg-gradient-to-r from-indigo-600 to-purple-600",
    "from-orange-500 to-red-500": "bg-gradient-to-r from-orange-500 to-red-500",
    "from-slate-700 to-slate-900": "bg-gradient-to-r from-slate-700 to-slate-900",
    "from-amber-600 to-orange-700": "bg-gradient-to-r from-amber-600 to-orange-700",
    "from-zinc-700 to-neutral-900": "bg-gradient-to-r from-zinc-700 to-neutral-900",
    "from-teal-600 to-cyan-700": "bg-gradient-to-r from-teal-600 to-cyan-700",
    "from-violet-600 to-purple-800": "bg-gradient-to-r from-violet-600 to-purple-800",
    "from-rose-600 to-pink-800": "bg-gradient-to-r from-rose-600 to-pink-800",
    "from-sky-600 to-blue-800": "bg-gradient-to-r from-sky-600 to-blue-800",
    "from-red-600 to-rose-800": "bg-gradient-to-r from-red-600 to-rose-800",
  };
  const bgClass = gradientMap[banner.bgColor || ""] || "bg-gradient-to-r from-indigo-600 to-purple-600";

  return (
    <div className="px-4 mb-4" data-testid="banner-carousel">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`${bgClass} rounded-lg p-4 text-white relative`}>
            <h3 className="text-sm font-bold mb-1 pr-8" data-testid={`text-banner-title-${current}`}>{banner.title}</h3>
            {banner.subtitle && <p className="text-xs text-white/80 mb-2">{banner.subtitle}</p>}
            <p className="text-xs text-white/90 font-medium mb-3 flex items-center gap-1" data-testid={`text-banner-phone-${current}`}>
              <Phone className="w-3 h-3" /> +91 9090-486-262
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                {banner.buttonText && banner.buttonLink && (
                  <Button size="sm" variant="secondary" className="text-xs" onClick={() => onNavigate(banner.buttonLink!)} data-testid={`button-banner-cta-${current}`}>
                    {banner.buttonText}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
                <Button size="sm" variant="secondary" className="text-xs bg-green-500 text-white border-0" onClick={() => window.open("tel:+919090486262")} data-testid={`button-banner-call-${current}`}>
                  <Phone className="w-3 h-3 mr-1" /> Call Now
                </Button>
              </div>
              <div className="flex gap-1">
                {bannerList.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-white w-4" : "bg-white/40"}`} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DealerRateGauge({ rate, maxRate = 120 }: { rate: number; maxRate?: number }) {
  const pct = Math.min((rate / maxRate) * 100, 100);
  const angle = -90 + (pct / 100) * 180;
  const color = rate <= 55 ? "#22c55e" : rate <= 70 ? "#f59e0b" : rate <= 85 ? "#f97316" : "#ef4444";
  const label = rate <= 55 ? "LOW" : rate <= 70 ? "MID" : rate <= 85 ? "HIGH" : "PEAK";

  return (
    <div className="flex flex-col items-center">
      <svg width="80" height="50" viewBox="0 0 100 55">
        <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="currentColor" className="text-muted/15" strokeWidth="8" strokeLinecap="round" />
        <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round"
          strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * 0.25)} opacity="0.3" />
        <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round"
          strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * 0.5)} opacity="0.2" />
        <line x1="50" y1="50" x2="50" y2="15" stroke={color} strokeWidth="2.5" strokeLinecap="round"
          transform={`rotate(${angle} 50 50)`} style={{ transition: "transform 0.8s ease" }} />
        <circle cx="50" cy="50" r="4" fill={color} />
      </svg>
      <div className="text-center -mt-1">
        <span className="text-lg font-bold" style={{ color }}>₹{rate}</span>
        <span className="text-[9px] text-muted-foreground">/kg</span>
      </div>
      <Badge className="text-[8px] px-1.5 py-0 mt-0.5" style={{ backgroundColor: color, border: "none", color: "#fff" }}>
        {label}
      </Badge>
    </div>
  );
}

function GPCoilDealerBanner() {
  const { data: dealers } = useQuery<Dealer[]>({ queryKey: ["/api/dealers"] });
  const { data: prices } = useQuery<MarketPrice[]>({ queryKey: ["/api/market-prices"] });
  const [current, setCurrent] = useState(0);

  const gpDealers = (dealers || []).filter(d => d.isActive && d.dailyRate && Number(d.dailyRate) > 0);
  const gpCoilPrice = prices?.find(p => p.material === "gp_coil");

  useEffect(() => {
    if (gpDealers.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % gpDealers.length), 5000);
    return () => clearInterval(timer);
  }, [gpDealers.length]);

  if (gpDealers.length === 0) return null;

  const dealer = gpDealers[current];
  const rate = Number(dealer.dailyRate);
  const gaugeLabel = (dealer.rateGauge && !dealer.rateGauge.includes("mm")) ? dealer.rateGauge : (rate <= 55 ? "Best Rate" : rate <= 70 ? "Market Rate" : "Premium Rate");

  return (
    <div className="px-4 mb-4" data-testid="gp-dealer-banner">
      <AnimatePresence mode="wait">
        <motion.div
          key={`dealer-${current}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 text-white border-0 shadow-lg relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">GP Coil Dealer</h4>
                    <Badge className="text-[8px] bg-amber-500/20 text-amber-300 border-amber-500/30 px-1.5 py-0">VERIFIED</Badge>
                  </div>
                  <p className="text-[9px] text-zinc-400">Today's Rate with Premium Gauge</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-bold mb-0.5 truncate" data-testid={`text-dealer-name-${current}`}>
                    {dealer.companyName || dealer.name}
                  </h3>
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <MapPin className="w-2.5 h-2.5 text-zinc-500" />
                      <span className="text-[10px] truncate">{dealer.city || dealer.location}, {dealer.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Phone className="w-2.5 h-2.5 text-zinc-500" />
                      <span className="text-[10px]">{dealer.phone}</span>
                    </div>
                    {dealer.gstNo && (
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Shield className="w-2.5 h-2.5 text-zinc-500" />
                        <span className="text-[10px]">GST: {dealer.gstNo}</span>
                        {dealer.isGstVerified && <CheckCircle2 className="w-2.5 h-2.5 text-green-400" />}
                      </div>
                    )}
                  </div>
                  {dealer.rating && (
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-2.5 h-2.5 ${i <= Math.round(Number(dealer.rating)) ? "text-amber-400 fill-amber-400" : "text-zinc-600"}`} />
                      ))}
                      <span className="text-[9px] text-zinc-400 ml-1">{Number(dealer.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <DealerRateGauge rate={rate} />
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10">
                <div className="flex gap-1.5">
                  <Button size="sm" className="text-[10px] h-7 bg-green-600 hover:bg-green-700 border-0 px-3"
                    onClick={() => window.open(`tel:${dealer.phone}`)} data-testid={`button-dealer-call-${current}`}>
                    <Phone className="w-2.5 h-2.5 mr-1" /> Call
                  </Button>
                  <Button size="sm" variant="outline" className="text-[10px] h-7 bg-transparent border-white/20 text-white hover:bg-white/10 px-3"
                    onClick={() => window.open(`https://wa.me/91${dealer.phone.replace(/\D/g, "").slice(-10)}`)} data-testid={`button-dealer-whatsapp-${current}`}>
                    WhatsApp
                  </Button>
                </div>
                <div className="flex gap-1 items-center">
                  {gpDealers.length > 1 && gpDealers.map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-amber-400 w-4" : "bg-white/20"}`} />
                  ))}
                </div>
              </div>

              {gpCoilPrice && (
                <div className="mt-2 bg-white/5 rounded-md px-2.5 py-1.5 flex items-center justify-between">
                  <span className="text-[9px] text-zinc-400">Market Reference (Mundka)</span>
                  <span className="text-[10px] font-bold text-amber-300">₹{Number(gpCoilPrice.price).toFixed(1)}/kg</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DailyRateTracker() {
  const { data: prices, isLoading } = useQuery<MarketPrice[]>({
    queryKey: ["/api/market-prices"],
  });
  if (isLoading) {
    return (
      <div className="px-4 mb-4">
        <Card className="p-4">
          <Skeleton className="h-6 w-48 mb-3" />
          <div className="flex gap-4">
            <Skeleton className="h-20 flex-1" />
            <Skeleton className="h-20 flex-1" />
          </div>
        </Card>
      </div>
    );
  }

  if (!prices || prices.length === 0) {
    return (
      <div className="px-4 mb-4">
        <Card className="p-4" data-testid="gauge-market-price">
          <p className="text-sm text-muted-foreground text-center">No market data yet</p>
        </Card>
      </div>
    );
  }

  const gpCoil = prices.find((p) => p.material === "gp_coil");
  const crCoil = prices.find((p) => p.material === "cr_coil");
  const steel = prices.find((p) => p.material === "steel");
  const lastDate = gpCoil?.date || crCoil?.date || "";

  function PriceCard({ label, data, testId }: { label: string; data: MarketPrice | undefined; testId: string }) {
    if (!data) return null;
    const price = Number(data.price);
    const prev = data.previousPrice ? Number(data.previousPrice) : null;
    const diff = prev ? price - prev : 0;
    const pct = prev ? ((diff / prev) * 100).toFixed(1) : "0";
    const isUp = data.trend === "up";
    const isDown = data.trend === "down";

    return (
      <div className="glass-card rounded-xl p-3">
        <div className="flex items-center justify-between gap-1 mb-2">
          <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
          {isUp && <Badge className="text-[9px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 gap-0.5 px-1.5"><TrendingUp className="w-2.5 h-2.5" />UP</Badge>}
          {isDown && <Badge className="text-[9px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 gap-0.5 px-1.5"><TrendingDown className="w-2.5 h-2.5" />DOWN</Badge>}
          {!isUp && !isDown && <Badge className="text-[9px] bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-0 px-1.5">STABLE</Badge>}
        </div>
        <div className="flex items-baseline gap-1">
          <IndianRupee className="w-3.5 h-3.5 text-foreground" />
          <span className="text-2xl font-bold tracking-tight" data-testid={testId}>{price.toFixed(1)}</span>
          <span className="text-[10px] text-muted-foreground">/kg</span>
        </div>
        {prev && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] text-muted-foreground">Kal: ₹{prev.toFixed(1)}</span>
            <span className={`text-[10px] font-medium ${diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-muted-foreground"}`}>
              ({diff > 0 ? "+" : ""}{diff.toFixed(1)}, {diff > 0 ? "+" : ""}{pct}%)
            </span>
          </div>
        )}
      </div>
    );
  }

  const gpPrediction = gpCoil?.prediction;

  return (
    <div className="px-4 mb-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GlassCard className="p-4" data-testid="gauge-market-price">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold">Aaj Ka Rate</h3>
            </div>
            <Badge variant="secondary" className="text-[9px] gap-1">
              <MapPin className="w-2.5 h-2.5" />
              Delhi-Mundka
            </Badge>
          </div>

          <p className="text-[10px] text-muted-foreground mb-3">
            {lastDate} - Din me 2 bar update (9AM & 6PM)
          </p>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <PriceCard label="GP Coil" data={gpCoil} testId="text-gp-price" />
            <PriceCard label="CR Coil" data={crCoil} testId="text-cr-price" />
          </div>

          {steel && (
            <div className="flex items-center justify-between bg-accent/50 rounded-md px-3 py-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">Steel</span>
                <span data-testid="text-steel-trend">
                  {steel.trend === "up" ? <TrendingUp className="w-3 h-3 text-green-500" /> : steel.trend === "down" ? <TrendingDown className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3 text-muted-foreground" />}
                </span>
              </div>
              <span className="text-sm font-bold">₹{Number(steel.price).toFixed(1)}/kg</span>
            </div>
          )}

          {(gpCoil?.upChance !== null || gpCoil?.downChance !== null || gpPrediction) && (
            <div className="bg-primary/5 border border-primary/20 rounded-md p-3" data-testid="prediction-section">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold text-primary">Rate Prediction</span>
                <Badge variant="outline" className="text-[8px] gap-1">
                  {gpCoil?.updateSlot === "evening" ? "Evening Update" : "Morning Update"}
                </Badge>
              </div>

              {(gpCoil?.upChance !== null && gpCoil?.upChance !== undefined) && (
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-[10px] font-medium">Badhne ke Chance</span>
                    </div>
                    <span className="text-xs font-bold text-green-600" data-testid="text-up-chance">{gpCoil.upChance}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${gpCoil.upChance}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}

              {(gpCoil?.downChance !== null && gpCoil?.downChance !== undefined) && (
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="w-3 h-3 text-red-500" />
                      <span className="text-[10px] font-medium">Girne ke Chance</span>
                    </div>
                    <span className="text-xs font-bold text-red-600" data-testid="text-down-chance">{gpCoil.downChance}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-red-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${gpCoil.downChance}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}

              {gpCoil?.upChance !== null && gpCoil?.downChance !== null && gpCoil?.upChance !== undefined && gpCoil?.downChance !== undefined && (
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Minus className="w-3 h-3 text-zinc-400" />
                      <span className="text-[10px] font-medium">Stable Chance</span>
                    </div>
                    <span className="text-xs font-bold text-zinc-500">{Math.max(0, 100 - gpCoil.upChance - gpCoil.downChance)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-zinc-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, 100 - gpCoil.upChance - gpCoil.downChance)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}

              <p className="text-[9px] text-muted-foreground mt-2">Din me 2 bar update hota hai — Morning (9AM) & Evening (6PM)</p>

              {gpPrediction && (
                <p className="text-[10px] text-muted-foreground mt-1.5 italic border-t border-primary/10 pt-1.5" data-testid="text-prediction">
                  {gpPrediction}
                </p>
              )}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function YouTubeEmbed({ url }: { url: string }) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return (
    <div className="relative w-full aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    </div>
  );
}

function CreatePostCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [caption, setCaption] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("caption", caption);
      if (youtubeUrl) formData.append("youtubeUrl", youtubeUrl);
      if (imageFile) formData.append("image", imageFile);
      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create post");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setCaption("");
      setYoutubeUrl("");
      setImageFile(null);
      setImagePreview(null);
      setExpanded(false);
      toast({ title: "Post created!" });
    },
    onError: (err: any) => {
      toast({ title: err.message || "Failed to create post", variant: "destructive" });
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Only image files are allowed", variant: "destructive" });
        return;
      }
      setImageFile(file);
      setYoutubeUrl("");
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const ytId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null;

  if (!user) return null;
  if (user.machineSpecialization === "roll_forming") {
    return (
      <Card className="mx-4 mb-4 p-4">
        <div className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="w-4 h-4" />
          <p className="text-xs">Roll forming machine users cannot create posts.</p>
        </div>
      </Card>
    );
  }
  if (user.isFrozen) {
    return (
      <Card className="mx-4 mb-4 p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <p className="text-xs">Your account is frozen. You cannot create posts.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-4 mb-4 overflow-hidden" data-testid="create-post-card">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 text-left bg-accent/50 rounded-full px-4 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
            data-testid="button-create-post-expand"
          >
            What's on your mind?
          </button>
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share your work, tips, or updates..."
              className="w-full min-h-[80px] p-3 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              data-testid="input-post-caption"
            />

            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            )}

            {ytId && (
              <div className="rounded-lg overflow-hidden border">
                <YouTubeEmbed url={youtubeUrl} />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Input
                value={youtubeUrl}
                onChange={(e) => {
                  setYoutubeUrl(e.target.value);
                  if (e.target.value) { setImageFile(null); setImagePreview(null); }
                }}
                placeholder="YouTube link (paste video URL)"
                className="flex-1 h-8 text-xs"
                data-testid="input-youtube-url"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} data-testid="input-post-image" />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-accent transition-colors">
                    <Camera className="w-4 h-4" />
                    Photo
                  </div>
                </label>
              </div>
              <Button
                size="sm"
                disabled={!caption.trim() || (!imageFile && !youtubeUrl) || createMutation.isPending}
                onClick={() => createMutation.mutate()}
                className="text-xs"
                data-testid="button-submit-post"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                {createMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}

function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [reported, setReported] = useState(false);

  const likeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/posts/${post.id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/posts/${post.id}/report`);
      return res.json();
    },
    onSuccess: (data: any) => {
      setReported(true);
      if (data.deleted) {
        queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
        toast({ title: "Post removed due to reports" });
      } else {
        toast({ title: "Report submitted. Thank you!" });
      }
    },
    onError: (err: any) => {
      if (err.message?.includes("already reported")) {
        setReported(true);
        toast({ title: "You have already reported this post" });
      } else {
        toast({ title: err.message || "Failed to report", variant: "destructive" });
      }
    },
  });

  const images = post.images || [];
  const timeAgo = post.createdAt
    ? formatTimeAgo(new Date(post.createdAt))
    : "Recently";

  return (
    <Card className="mx-4 mb-4 overflow-hidden">
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
          {post.author?.charAt(0)?.toUpperCase() || "S"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold truncate" data-testid={`text-post-author-${post.id}`}>
              {post.author}
            </p>
            {post.author.includes("Official") && (
              <svg className="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </div>
          <p className="text-xs text-muted-foreground" data-testid={`text-post-time-${post.id}`}>{timeAgo}</p>
        </div>
      </div>

      {post.youtubeUrl ? (
        <YouTubeEmbed url={post.youtubeUrl} />
      ) : images.length > 0 ? (
        <div className="relative">
          <img
            src={images[currentImage]}
            alt={post.caption}
            className="w-full aspect-[4/3] object-cover"
            data-testid={`img-post-${post.id}`}
          />
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImage ? "bg-white w-4" : "bg-white/50"}`}
                  data-testid={`button-image-dot-${i}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (!liked) {
                  setLiked(true);
                  likeMutation.mutate();
                }
              }}
              className="flex items-center gap-1.5 text-sm"
              data-testid={`button-like-${post.id}`}
            >
              <Heart
                className={`w-5 h-5 transition-all ${liked ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground"}`}
              />
              <span className={`font-medium ${liked ? "text-red-500" : "text-muted-foreground"}`}>
                {(post.likes || 0) + (liked ? 1 : 0)}
              </span>
            </button>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground" data-testid={`button-share-${post.id}`}>
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          {user && !reported && (
            <button
              onClick={() => reportMutation.mutate()}
              disabled={reportMutation.isPending}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              data-testid={`button-report-${post.id}`}
            >
              <Flag className="w-3.5 h-3.5" />
              Report
            </button>
          )}
          {reported && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <Flag className="w-3.5 h-3.5 fill-red-400" />
              Reported
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed" data-testid={`text-post-caption-${post.id}`}>
          {post.caption}
        </p>
      </div>
    </Card>
  );
}

function PostSkeleton() {
  return (
    <Card className="mx-4 mb-4 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Skeleton className="w-9 h-9 rounded-md" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="w-full aspect-[4/3]" />
      <div className="p-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </Card>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

function VisitorCounter() {
  const { data } = useQuery<{ total_visits: number; today_visits: number }>({
    queryKey: ["/api/visitor-count"],
    staleTime: 60000,
  });

  if (!data) return null;

  return (
    <ScrollReveal>
      <div className="mx-4 mb-4" data-testid="visitor-counter">
        <GlassCard className="p-0">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Visitors</p>
                <p className="text-lg font-bold gradient-text" data-testid="text-total-visitors">
                  <AnimatedCounter value={data.total_visits || 0} />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-sm font-semibold" data-testid="text-today-visitors">
                  <AnimatedCounter value={data.today_visits || 0} duration={1} />
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </ScrollReveal>
  );
}

const MACHINE_TYPES = [
  "Shutter Patti Machine", "POP Channel Machine", "Gypsum Channel Machine",
  "T-Grid Machine", "Door Frame Machine", "Z/C Purlin Machine",
  "Roofing Sheet Machine", "Guard Rail Machine", "Ridge Cap Machine", "Other"
];

const STATES = [
  "Delhi", "Uttar Pradesh", "Haryana", "Rajasthan", "Punjab", "Madhya Pradesh",
  "Bihar", "Maharashtra", "Gujarat", "West Bengal", "Other"
];

function OperatorRegistration() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", aadhaarNo: "", experience: "",
    machineType: "", previousSalary: "", expectedSalary: "",
    address: "", city: "", state: "", pincode: "",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/operators", data);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setExpanded(false);
      toast({ title: "Registration successful!" });
    },
    onError: () => toast({ title: "Registration failed", variant: "destructive" }),
  });

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.experience) {
      toast({ title: "Naam, phone aur experience bharna zaroori hai", variant: "destructive" });
      return;
    }
    if (form.phone.length < 10) {
      toast({ title: "Phone number 10 digit ka hona chahiye", variant: "destructive" });
      return;
    }
    submitMutation.mutate(form);
  };

  if (submitted) {
    return (
      <div className="px-4 mb-6">
        <Card className="p-5 border-green-500/20 bg-green-50/50 dark:bg-green-950/20 rounded-2xl">
          <div className="text-center" data-testid="operator-success">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold mb-1">Registration Successful!</h3>
            <p className="text-xs text-muted-foreground mb-3">Aapka registration ho gaya hai. Hum jaldi contact karenge.</p>
            <Button size="sm" variant="outline" className="text-xs" onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", aadhaarNo: "", experience: "", machineType: "", previousSalary: "", expectedSalary: "", address: "", city: "", state: "", pincode: "" }); }} data-testid="button-new-operator-reg">
              Naya Registration
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 mb-6">
      <Card className="overflow-hidden rounded-2xl" data-testid="card-operator-registration">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold">Machine Operator Registration</h3>
              <p className="text-[10px] text-muted-foreground">Operator ki detail yahan bharein</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px]">Naam (Name) *</Label>
                    <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-8 text-xs" placeholder="Operator ka naam" data-testid="input-op-name" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Phone *</Label>
                    <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="h-8 text-xs" placeholder="9876543210" maxLength={10} data-testid="input-op-phone" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px]">Aadhaar Card No.</Label>
                    <Input value={form.aadhaarNo} onChange={e => setForm({...form, aadhaarNo: e.target.value.replace(/\D/g, "")})} className="h-8 text-xs" placeholder="1234 5678 9012" maxLength={12} data-testid="input-op-aadhaar" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Experience *</Label>
                    <select value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} className="w-full h-8 rounded-xl border border-input/50 bg-background/50 backdrop-blur-sm px-2 text-xs" data-testid="select-op-experience">
                      <option value="">Select</option>
                      <option value="Fresher">Fresher</option>
                      <option value="1 Year">1 Year</option>
                      <option value="2 Years">2 Years</option>
                      <option value="3 Years">3 Years</option>
                      <option value="5+ Years">5+ Years</option>
                      <option value="10+ Years">10+ Years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label className="text-[10px]">Machine Type</Label>
                  <select value={form.machineType} onChange={e => setForm({...form, machineType: e.target.value})} className="w-full h-8 rounded-xl border border-input/50 bg-background/50 backdrop-blur-sm px-2 text-xs" data-testid="select-op-machine">
                    <option value="">Machine select karein</option>
                    {MACHINE_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px]">Pichli Salary (₹/month)</Label>
                    <Input value={form.previousSalary} onChange={e => setForm({...form, previousSalary: e.target.value})} className="h-8 text-xs" placeholder="₹15,000" data-testid="input-op-prev-salary" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Expected Salary (₹/month)</Label>
                    <Input value={form.expectedSalary} onChange={e => setForm({...form, expectedSalary: e.target.value})} className="h-8 text-xs" placeholder="₹20,000" data-testid="input-op-exp-salary" />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px]">Full Address</Label>
                  <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="h-8 text-xs" placeholder="Makan no., gali, mohalla..." data-testid="input-op-address" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px]">City</Label>
                    <Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="h-8 text-xs" placeholder="City" data-testid="input-op-city" />
                  </div>
                  <div>
                    <Label className="text-[10px]">State</Label>
                    <select value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="w-full h-8 rounded-xl border border-input/50 bg-background/50 backdrop-blur-sm px-2 text-[10px]" data-testid="select-op-state">
                      <option value="">State</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px]">Pincode</Label>
                    <Input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} className="h-8 text-xs" placeholder="110041" maxLength={6} data-testid="input-op-pincode" />
                  </div>
                </div>

                <Button className="w-full text-xs" onClick={handleSubmit} disabled={submitMutation.isPending} data-testid="button-submit-operator">
                  <UserPlus className="w-3.5 h-3.5 mr-2" />
                  {submitMutation.isPending ? "Submitting..." : "Register Operator"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

export default function Home({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  return (
    <div className="pb-24">
      <HeroSection onNavigate={onNavigate} />
      <ScrollReveal delay={0.05}>
        <BannerCarousel onNavigate={onNavigate} />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <GPCoilDealerBanner />
      </ScrollReveal>
      <QuickActions onNavigate={onNavigate} />
      <ScrollReveal delay={0.05}>
        <DailyRateTracker />
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <OperatorRegistration />
      </ScrollReveal>
      <VisitorCounter />

      <ScrollReveal>
        <div className="px-4 mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold" data-testid="text-feed-title">Latest Updates</h2>
          <Badge variant="secondary" className="text-xs rounded-full" data-testid="badge-post-count">
            {posts?.length || 0} posts
          </Badge>
        </div>
      </ScrollReveal>

      {user && <ScrollReveal><CreatePostCard /></ScrollReveal>}

      {isLoading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : posts && posts.length > 0 ? (
        posts.map((post, i) => (
          <ScrollReveal key={post.id} delay={i * 0.05}>
            <PostCard post={post} />
          </ScrollReveal>
        ))
      ) : (
        <ScrollReveal>
          <div className="text-center py-12 px-4">
            <Factory className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No updates yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon for the latest from Sai Rolotech</p>
          </div>
        </ScrollReveal>
      )}

      <div className="px-4 py-6 mt-4 border-t border-white/10 text-center">
        <p className="text-[10px] text-muted-foreground mb-1.5">M/S Sai Rolotech - Roll Forming Machines</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => onNavigate("/terms")} className="text-[10px] text-primary underline" data-testid="link-footer-terms">Terms</button>
          <button onClick={() => onNavigate("/privacy")} className="text-[10px] text-primary underline" data-testid="link-footer-privacy">Privacy</button>
          <button onClick={() => onNavigate("/contact")} className="text-[10px] text-primary underline" data-testid="link-footer-contact">Contact</button>
        </div>
      </div>
    </div>
  );
}
