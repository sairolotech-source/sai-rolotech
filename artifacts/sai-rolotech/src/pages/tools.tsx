import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calculator, TrendingUp, IndianRupee, Wrench, FileText,
  Users, ChevronRight, Phone, Gauge, CalendarCheck,
  Banknote, FileSpreadsheet, FolderOpen, ClipboardCheck,
  Activity, Scale, Building2, Headphones, Shield, BookOpen
} from "lucide-react";

interface ToolsProps {
  onNavigate: (path: string) => void;
}

export default function Tools({ onNavigate }: ToolsProps) {
  const categories = [
    {
      title: "Business Tools",
      tools: [
        { icon: TrendingUp, label: "ROI Calculator", path: "/roi", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
        { icon: Calculator, label: "GST Calculator", path: "/gst", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
        { icon: Banknote, label: "EMI Calculator", path: "/emi", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
        { icon: IndianRupee, label: "Coil Rate", path: "/coil-rate", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
      ],
    },
    {
      title: "Quotation & Sales",
      tools: [
        { icon: FileSpreadsheet, label: "Quotation", path: "/quotation", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
        { icon: Scale, label: "Compare Quotes", path: "/quote-compare", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
        { icon: FileText, label: "Subsidies", path: "/subsidies", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      ],
    },
    {
      title: "Machine & Quality",
      tools: [
        { icon: Activity, label: "Health Score", path: "/machine-health", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
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
        { icon: CalendarCheck, label: "Factory Visit", path: "/visit", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
        { icon: Shield, label: "AMC Plans", path: "/amc", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
      ],
    },
    {
      title: "Directory",
      tools: [
        { icon: Users, label: "Dealers", path: "/directory", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
        { icon: Building2, label: "Suppliers", path: "/suppliers", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
      ],
    },
  ];

  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-4">
        <h1 className="text-lg font-bold flex items-center gap-2" data-testid="text-tools-title">
          <Gauge className="w-5 h-5 text-primary" />
          Tools & Resources
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Everything you need for your manufacturing business</p>
      </div>

      <div className="space-y-5">
        {categories.map((cat) => (
          <div key={cat.title}>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">{cat.title}</p>
            <div className="grid grid-cols-2 gap-2">
              {cat.tools.map((tool) => (
                <Card
                  key={tool.label}
                  className="p-3 cursor-pointer hover-elevate active:scale-[0.98] transition-transform"
                  onClick={() => onNavigate(tool.path)}
                  data-testid={`card-tool-${tool.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tool.color}`}>
                      <tool.icon className="w-4.5 h-4.5" />
                    </div>
                    <p className="text-xs font-semibold leading-tight">{tool.label}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

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
