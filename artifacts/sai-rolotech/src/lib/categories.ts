import {
  Factory, Building2, Wrench, Headphones, Shield, CalendarCheck,
  Calculator, TrendingUp, IndianRupee, Banknote, FileSpreadsheet,
  Scale, FileText, Activity, AlertTriangle, BookOpen, ClipboardCheck,
  FolderOpen, Users, Repeat, Cog, MapPin, Flag, Megaphone, Phone,
  type LucideIcon
} from "lucide-react";

export interface CategoryFeature {
  icon: LucideIcon;
  label: string;
  path: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  accentBg: string;
  features: CategoryFeature[];
}

export const categories: Category[] = [
  {
    id: "machines",
    name: "Machines",
    icon: Factory,
    color: "text-blue-600 dark:text-blue-400",
    accentBg: "bg-blue-500/10",
    features: [
      { icon: Factory, label: "Machine Catalog", path: "/catalog", color: "bg-primary/10 text-primary" },
      { icon: Activity, label: "Health Score", path: "/machine-health", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
      { icon: AlertTriangle, label: "Troubleshooting", path: "/machine-troubleshooting", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
      { icon: ClipboardCheck, label: "QC Inspection", path: "/inspection", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
      { icon: Repeat, label: "Old Machine Buy & Sell", path: "/old-machines", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
    ],
  },
  {
    id: "suppliers",
    name: "Suppliers & Dealers",
    icon: Building2,
    color: "text-indigo-600 dark:text-indigo-400",
    accentBg: "bg-indigo-500/10",
    features: [
      { icon: Building2, label: "Suppliers", path: "/suppliers", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      { icon: Users, label: "Dealers Directory", path: "/directory", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
      { icon: IndianRupee, label: "Coil Rate", path: "/coil-rate", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    ],
  },
  {
    id: "service",
    name: "Service Network",
    icon: Wrench,
    color: "text-orange-600 dark:text-orange-400",
    accentBg: "bg-orange-500/10",
    features: [
      { icon: Wrench, label: "Service Request", path: "/service", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
      { icon: Headphones, label: "Support Ticket", path: "/support", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
      { icon: Shield, label: "AMC Plans", path: "/amc", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
      { icon: CalendarCheck, label: "Factory Visit", path: "/visit", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
    ],
  },
  {
    id: "marketplace",
    name: "Marketplace",
    icon: Scale,
    color: "text-emerald-600 dark:text-emerald-400",
    accentBg: "bg-emerald-500/10",
    features: [
      { icon: FileSpreadsheet, label: "Quotation", path: "/quotation", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
      { icon: Scale, label: "Compare Quotes", path: "/quote-compare", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
      { icon: FileText, label: "Subsidies", path: "/subsidies", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    ],
  },
  {
    id: "business-tools",
    name: "Business Tools",
    icon: Calculator,
    color: "text-purple-600 dark:text-purple-400",
    accentBg: "bg-purple-500/10",
    features: [
      { icon: TrendingUp, label: "ROI Calculator", path: "/roi", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
      { icon: Calculator, label: "GST Calculator", path: "/gst", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
      { icon: Banknote, label: "EMI Calculator", path: "/emi", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
      { icon: Cog, label: "RF Calculator", path: "/rf-calculator", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
      { icon: MapPin, label: "Industry Map", path: "/industry-map", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" },
    ],
  },
  {
    id: "knowledge",
    name: "Knowledge Center",
    icon: BookOpen,
    color: "text-pink-600 dark:text-pink-400",
    accentBg: "bg-pink-500/10",
    features: [
      { icon: BookOpen, label: "Operator Training", path: "/training", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
      { icon: Flag, label: "Business Guide", path: "/business-guide", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
      { icon: FolderOpen, label: "Documents", path: "/documents", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
      { icon: Megaphone, label: "Broadcasts", path: "/broadcasts", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
    ],
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}
