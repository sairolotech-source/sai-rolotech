import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import UiStyleSwitcher from "@/components/UiStyleSwitcher";
import {
  Calculator, TrendingUp, IndianRupee, Wrench, FileText,
  Users, ChevronRight, Phone, Gauge, CalendarCheck,
  Banknote, FileSpreadsheet, FolderOpen, ClipboardCheck,
  Activity, Scale, Building2, Headphones, Shield, BookOpen,
  Cog, MapPin, Repeat, AlertTriangle, RotateCcw, Star, Video, Gift, Factory, Trophy, BarChart3
} from "lucide-react";
import { useToolUsage } from "@/hooks/use-tool-usage";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToolItem {
  icon: any;
  label: string;
  path: string;
  color: string;
}

interface ToolsProps {
  onNavigate: (path: string) => void;
}

export default function Tools({ onNavigate }: ToolsProps) {
  const { recordUsage, sortByUsage, isTopPick, resetUsage, hasAnyUsage } = useToolUsage();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const categories: { title: string; tools: ToolItem[] }[] = [
    {
      title: "Engineering",
      tools: [
        { icon: Cog, label: "RF Calculator", path: "/rf-calculator", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
        { icon: MapPin, label: "Industry Map", path: "/industry-map", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
      ],
    },
    {
      title: "Business Tools",
      tools: [
        { icon: TrendingUp, label: "ROI Calculator", path: "/roi", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
        { icon: Calculator, label: "GST Calculator", path: "/gst", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
        { icon: Banknote, label: "EMI Calculator", path: "/emi", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
        { icon: IndianRupee, label: "Coil Rate", path: "/coil-rate", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
      ],
    },
    {
      title: "Quotation & Sales",
      tools: [
        { icon: FileSpreadsheet, label: "Quotation", path: "/quotation", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
        { icon: Scale, label: "Compare Quotes", path: "/quote-compare", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
        { icon: FileText, label: "Subsidies", path: "/subsidies", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      ],
    },
    {
      title: "Machine & Quality",
      tools: [
        { icon: Activity, label: "Health Score", path: "/machine-health", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
        { icon: AlertTriangle, label: "Troubleshooting", path: "/machine-troubleshooting", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
        { icon: BookOpen, label: "Training Guide", path: "/training", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
        { icon: ClipboardCheck, label: "QC Inspection", path: "/inspection", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
        { icon: FolderOpen, label: "Documents", path: "/documents", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
      ],
    },
    {
      title: "Services & Support",
      tools: [
        { icon: Wrench, label: "Service Request", path: "/service", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
        { icon: Headphones, label: "Support Ticket", path: "/support", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
        { icon: Video, label: "Video Call Support", path: "/video-call", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
        { icon: CalendarCheck, label: "Factory Visit", path: "/visit", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
        { icon: Shield, label: "AMC Plans", path: "/amc", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
      ],
    },
    {
      title: "Viral & Community",
      tools: [
        { icon: Gift, label: "Refer & Earn", path: "/refer-earn", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
        { icon: BarChart3, label: "Industry Data", path: "/industry-data", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
        { icon: Factory, label: "Production Feed", path: "/production-share", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
        { icon: Trophy, label: "Top Manufacturers", path: "/manufacturer-rankings", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
      ],
    },
    {
      title: "Marketplace",
      tools: [
        { icon: Repeat, label: "Old Machine Buy & Sell", path: "/old-machines", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
      ],
    },
    {
      title: "Directory",
      tools: [
        { icon: Users, label: "Dealers", path: "/directory", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
        { icon: Building2, label: "Suppliers", path: "/suppliers", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      ],
    },
  ];

  const handleToolClick = (tool: ToolItem) => {
    recordUsage(tool.path);
    onNavigate(tool.path);
  };

  const handleReset = () => {
    resetUsage();
    setShowResetConfirm(false);
  };

  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2" data-testid="text-tools-title">
            <Gauge className="w-5 h-5 text-primary" />
            Tools & Resources
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Everything you need for your manufacturing business</p>
        </div>
        {hasAnyUsage && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground"
              onClick={() => setShowResetConfirm(!showResetConfirm)}
              data-testid="button-reset-order"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <AnimatePresence>
              {showResetConfirm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  className="absolute right-0 top-10 z-50 w-48 p-3 rounded-xl shadow-lg border bg-background"
                  data-testid="reset-confirm-popup"
                >
                  <p className="text-xs font-medium mb-2">Reset tool order to default?</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" className="text-xs flex-1 h-7" onClick={handleReset} data-testid="button-confirm-reset">
                      Reset
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs flex-1 h-7" onClick={() => setShowResetConfirm(false)} data-testid="button-cancel-reset">
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {categories.map((cat) => {
          const sortedTools = sortByUsage(cat.tools);
          return (
            <div key={cat.title}>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{cat.title}</p>
              <div className="grid grid-cols-2 gap-2">
                {sortedTools.map((tool) => {
                  const topPick = isTopPick(tool, cat.tools, 3);
                  return (
                    <Card
                      key={tool.label}
                      className="p-3 cursor-pointer hover-elevate active:scale-[0.98] transition-transform relative"
                      onClick={() => handleToolClick(tool)}
                      data-testid={`card-tool-${tool.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tool.color}`}>
                          <tool.icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold leading-tight">{tool.label}</p>
                          {topPick && (
                            <Badge
                              variant="outline"
                              className="mt-1 text-[8px] px-1.5 py-0 gap-0.5 border-amber-400/50 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/20"
                              data-testid={`badge-top-pick-${tool.label.toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                              Top Pick
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Card className="p-4 mt-5" data-testid="card-theme-settings">
        <ThemeSwitcher />
      </Card>

      <Card className="p-4 mt-3" data-testid="card-ui-style-settings">
        <UiStyleSwitcher />
      </Card>

      <Card className="p-3 mt-5 bg-primary/5 border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Phone className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" data-testid="text-contact-card-title">Need Expert Help?</p>
            <p className="text-[10px] text-muted-foreground">Machine consultation & support</p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <a
              href="tel:+919090486262"
              className="text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md text-center"
              data-testid="link-call"
            >
              Call Now
            </a>
            <a
              href="https://wa.me/919090486262"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-md text-center"
              data-testid="link-whatsapp"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
