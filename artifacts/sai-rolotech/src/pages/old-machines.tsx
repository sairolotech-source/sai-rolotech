import { Card } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Lock, Clock, Bell, Phone, User,
  Factory, Layers, Cog, Zap, Wrench, Box, Settings2, Ruler
} from "lucide-react";

const MACHINE_CATEGORIES = [
  { name: "Roll Forming Machine", icon: Factory, gradient: "from-blue-600 to-cyan-700" },
  { name: "C Purlin Machine", icon: Cog, gradient: "from-purple-600 to-blue-700" },
  { name: "Z Purlin Machine", icon: Settings2, gradient: "from-indigo-600 to-purple-700" },
  { name: "Roof Panel Machine", icon: Layers, gradient: "from-slate-700 to-zinc-800" },
  { name: "Press Brake", icon: Ruler, gradient: "from-amber-600 to-orange-700" },
  { name: "Shearing Machine", icon: Zap, gradient: "from-red-600 to-rose-700" },
  { name: "Bending Machine", icon: Wrench, gradient: "from-emerald-600 to-teal-700" },
  { name: "Welding Equipment", icon: Box, gradient: "from-orange-500 to-red-600" },
];

interface OldMachinesProps {
  onNavigate: (path: string) => void;
}

export default function OldMachines({ onNavigate }: OldMachinesProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    let existing: { name: string; contact: string; date: string }[] = [];
    try { existing = JSON.parse(localStorage.getItem("old_machines_interest") || "[]"); } catch {}
    existing.push({ name: name.trim(), contact: contact.trim(), date: new Date().toISOString() });
    try { localStorage.setItem("old_machines_interest", JSON.stringify(existing)); } catch {}
    setSubmitted(true);
    setName("");
    setContact("");
    toast({ title: "Registered!", description: "We'll notify you when this feature launches." });
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={() => onNavigate("/")} data-testid="button-back-old-machines">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-semibold truncate flex-1" data-testid="text-old-machines-title">Old Machine Buy & Sell</h2>
      </div>

      <GlassCard className="relative overflow-hidden mx-4 mt-4 mb-6 border-0">
        <div
          className="relative py-10 px-5 aurora-shimmer"
          style={{
            background: "linear-gradient(-45deg, #7B2FFF, #0077FF, #00D4FF, #0055CC)",
            backgroundSize: "300% 300%",
            animation: "mesh-shift 12s ease infinite",
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, rgba(0,212,255,0.8) 0%, transparent 70%)", animation: "blob-morph 8s ease-in-out infinite" }}
            />
            <div
              className="absolute -bottom-5 -left-5 w-32 h-32 rounded-full opacity-15"
              style={{ background: "radial-gradient(circle, rgba(123,47,255,0.8) 0%, transparent 70%)", animation: "blob-morph 10s ease-in-out infinite reverse" }}
            />
          </div>
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 0 40px rgba(0,212,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Factory className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-extrabold text-white leading-tight mb-2"
              data-testid="text-hero-old-machines"
            >
              Old Machine Buy & Sell
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-sm text-white/80 mb-4 max-w-sm mx-auto"
            >
              Buy & sell used Roll Forming Machines, Press Brakes, Shearing Machines & more industrial equipment
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Badge
                className="text-xs px-4 py-1.5 font-bold border-0"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(0,212,255,0.3)",
                }}
                data-testid="badge-coming-soon-hero"
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                Launching Soon — Q2 2026
              </Badge>
            </motion.div>
          </div>
        </div>
      </GlassCard>

      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold" data-testid="text-categories-heading">Upcoming Categories</h2>
          <Badge variant="secondary" className="text-[9px]">{MACHINE_CATEGORIES.length} categories</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {MACHINE_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
              >
                <Card
                  className="relative p-3 opacity-60 cursor-default overflow-hidden"
                  data-testid={`card-category-${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="absolute top-2 right-2">
                    <Badge
                      className="text-[8px] px-1.5 py-0 border-0"
                      style={{
                        background: "linear-gradient(135deg, rgba(0,119,255,0.15), rgba(0,212,255,0.1))",
                        color: "hsl(var(--primary))",
                      }}
                    >
                      <Lock className="w-2 h-2 mr-0.5" />
                      Soon
                    </Badge>
                  </div>
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-2 grayscale-[40%]`}>
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h3 className="text-xs font-bold mb-0.5 leading-tight">{cat.name}</h3>
                  <p className="text-[9px] text-muted-foreground">Buy & Sell</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="px-4 mb-6">
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0077FF, #00D4FF)" }}>
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold" data-testid="text-notify-heading">Get Notified</h3>
              <p className="text-[10px] text-muted-foreground">Be first to know when we launch</p>
            </div>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
                <Bell className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-bold mb-1" data-testid="text-notify-success">You're on the list!</p>
              <p className="text-xs text-muted-foreground">We'll notify you when Old Machine Buy & Sell launches.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleNotify} className="space-y-3" data-testid="form-notify">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Your Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="pl-10 h-9 text-xs"
                    data-testid="input-notify-name"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Phone or Email"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    className="pl-10 h-9 text-xs"
                    data-testid="input-notify-contact"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-9 text-xs glossy-btn" data-testid="button-notify-submit">
                <Bell className="w-3.5 h-3.5 mr-1.5" />
                Notify Me When It Launches
              </Button>
            </form>
          )}
        </GlassCard>
      </div>

      <div className="px-4 mb-6">
        <Card className="p-4 bg-primary/5 border-primary/10">
          <div className="text-center">
            <p className="text-xs font-semibold mb-1">Have questions about used machines?</p>
            <p className="text-[10px] text-muted-foreground mb-3">Contact us directly for buying or selling enquiries</p>
            <div className="flex gap-2 justify-center">
              <Button size="sm" className="text-xs h-8" asChild>
                <a href="tel:+919090486262" data-testid="button-call-old-machines">
                  <Phone className="w-3.5 h-3.5 mr-1" /> Call Now
                </a>
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-8" asChild>
                <a href="https://wa.me/919090486262?text=Hi%2C%20I%27m%20interested%20in%20old%20machine%20buy%20%26%20sell" target="_blank" rel="noopener noreferrer" data-testid="button-whatsapp-old-machines">
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
