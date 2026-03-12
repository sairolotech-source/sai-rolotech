import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, apiUpload, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload, MultiImageUpload } from "@/components/image-upload";
import {
  ArrowLeft, BarChart3, Package, Users, Wrench, Calendar, MessageSquare,
  Settings, LogOut, ChevronRight, AlertCircle, CheckCircle2, Clock,
  TrendingUp, Eye, Trash2, Edit, Plus, X, Save, Phone, MapPin,
  Snowflake, ShieldCheck, Building2, UserCheck, Bot, Lock, Send, KeyRound, Loader2,
  Megaphone, Globe, ShoppingCart, ExternalLink,
  FileText, ClipboardCheck, Receipt, Search, Filter, IndianRupee,
  ClipboardList, Briefcase, Video
} from "lucide-react";

import { useRef, useEffect, useCallback } from "react";

type TabType = "dashboard" | "products" | "leads" | "service" | "appointments" | "posts" | "users" | "settings" | "banners" | "market" | "analytics" | "dealers" | "moderation" | "ai" | "consents" | "security" | "broadcast" | "quotations" | "approvals" | "vendor-bills" | "assembly" | "job-applications" | "video-calls";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isAdmin, isSuperAdmin, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="font-semibold">Access Denied</p>
            <p className="text-sm text-muted-foreground mt-1">You need admin privileges to access this panel.</p>
            <Button onClick={() => setLocation("/auth")} className="mt-4" data-testid="button-login">Login as Admin</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allTabs: { id: TabType; label: string; icon: any; superOnly?: boolean }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "leads", label: "Leads", icon: MessageSquare },
    { id: "service", label: "Service", icon: Wrench },
    { id: "appointments", label: "Visits", icon: Calendar },
    { id: "products", label: "Products", icon: Package },
    { id: "broadcast", label: "Broadcast", icon: Megaphone },
    { id: "posts", label: "Posts", icon: Eye },
    { id: "moderation", label: "Moderation", icon: ShieldCheck },
    { id: "consents", label: "Consents", icon: ShieldCheck },
    { id: "dealers", label: "Dealers", icon: Building2 },
    { id: "quotations", label: "Quotations", icon: FileText },
    { id: "approvals", label: "Approvals", icon: ClipboardCheck },
    { id: "vendor-bills", label: "Vendor Bills", icon: Receipt },
    { id: "video-calls", label: "Video Calls", icon: Video },
    { id: "banners", label: "Banners", icon: Eye },
    { id: "market", label: "Market", icon: TrendingUp },
    { id: "assembly", label: "Assembly", icon: ClipboardList },
    { id: "security", label: "Security", icon: Lock, superOnly: true },
    { id: "job-applications", label: "Jobs", icon: Briefcase },
    { id: "users", label: "Users", icon: Users, superOnly: true },
    { id: "settings", label: "Settings", icon: Settings, superOnly: true },
    { id: "ai", label: "AI", icon: Bot, superOnly: true },
  ];

  const tabs = allTabs.filter(t => !t.superOnly || isSuperAdmin);

  const handleLogout = async () => {
    await logout.mutateAsync();
    setLocation("/");
  };

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold" data-testid="text-admin-title">{isSuperAdmin ? "Admin Panel" : "Sub-Admin Panel"}</h1>
            <p className="text-xs text-muted-foreground">Welcome, {user?.name} <span className="text-primary">({user?.role === "sub_admin" ? "Sub-Admin" : "Admin"})</span></p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`tab-${tab.id}`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && <DashboardTab />}
      {activeTab === "analytics" && <AnalyticsTab />}
      {activeTab === "leads" && <LeadsTab />}
      {activeTab === "service" && <ServiceTab />}
      {activeTab === "appointments" && <AppointmentsTab />}
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "broadcast" && <BroadcastTab />}
      {activeTab === "posts" && <PostsTab />}
      {activeTab === "moderation" && <ModerationTab />}
      {activeTab === "consents" && <ConsentsTab />}
      {activeTab === "dealers" && <DealersTab />}
      {activeTab === "quotations" && <QuotationsTrackerTab />}
      {activeTab === "approvals" && <ApprovalsTab />}
      {activeTab === "vendor-bills" && <VendorBillsTab />}
      {activeTab === "banners" && <BannersTab />}
      {activeTab === "market" && <MarketTab />}
      {activeTab === "assembly" && <AssemblyTasksTab />}
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "job-applications" && <JobApplicationsTab />}
      {activeTab === "users" && <UsersTab />}
      {activeTab === "settings" && <SettingsTab />}
      {activeTab === "video-calls" && <VideoCallsTab />}
      {activeTab === "ai" && <AIAssistantTab />}
    </div>
  );
}

function DashboardTab() {
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/dashboard"],
  });

  if (isLoading) return <LoadingState />;

  const cards = [
    { label: "Total Products", value: stats?.totalProducts || 0, icon: Package, color: "text-blue-600" },
    { label: "Total Leads", value: stats?.totalLeads || 0, icon: MessageSquare, color: "text-green-600" },
    { label: "Service Requests", value: stats?.totalServiceRequests || 0, icon: Wrench, color: "text-orange-600" },
    { label: "Visit Bookings", value: stats?.totalAppointments || 0, icon: Calendar, color: "text-purple-600" },
  ];

  const pending = [
    { label: "New Leads", value: stats?.pendingLeads || 0, color: "bg-green-100 text-green-700" },
    { label: "Pending Service", value: stats?.pendingServiceRequests || 0, color: "bg-orange-100 text-orange-700" },
    { label: "Pending Visits", value: stats?.pendingAppointments || 0, color: "bg-purple-100 text-purple-700" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <Card key={card.label} data-testid={`stat-${card.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 mb-1">
                <card.icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-[11px] text-muted-foreground">{card.label}</span>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Pending Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pending.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm">{item.label}</span>
              <Badge className={item.color} data-testid={`badge-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
                {item.value}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ConfidenceBadge({ score }: { score: number | null }) {
  if (!score) return null;
  const color = score >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    : score >= 60 ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    : score >= 40 ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  return <Badge className={`text-[9px] ${color}`}>{score}%</Badge>;
}

const financeStageLabels: Record<string, string> = {
  inquiry: "Inquiry",
  discussion: "Bank Discussion",
  docs_submitted: "Docs Submitted",
  sanctioned: "Sanctioned",
  disbursement: "Disbursement",
};

function LeadsTab() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "finance" | "high">("all");
  const { data: leads, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/leads"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      await apiRequest("PATCH", `/api/admin/leads/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Lead updated" });
    },
  });

  if (isLoading) return <LoadingState />;

  const filtered = leads?.filter((l: any) => {
    if (filter === "finance") return l.financeRequired;
    if (filter === "high") return (l.confidenceScore || 0) >= 60;
    return true;
  }) || [];

  const financeLeads = leads?.filter((l: any) => l.financeRequired) || [];
  const highConfidence = leads?.filter((l: any) => (l.confidenceScore || 0) >= 60) || [];

  return (
    <div className="space-y-3">
      {leads && leads.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilter("all")} className={`text-[10px] px-3 py-1.5 rounded-full border whitespace-nowrap ${filter === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} data-testid="filter-all">
            All ({leads.length})
          </button>
          <button onClick={() => setFilter("finance")} className={`text-[10px] px-3 py-1.5 rounded-full border whitespace-nowrap ${filter === "finance" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} data-testid="filter-finance">
            Finance ({financeLeads.length})
          </button>
          <button onClick={() => setFilter("high")} className={`text-[10px] px-3 py-1.5 rounded-full border whitespace-nowrap ${filter === "high" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} data-testid="filter-high">
            High Prob ({highConfidence.length})
          </button>
        </div>
      )}

      <h2 className="text-sm font-semibold text-muted-foreground">{filter === "all" ? "All" : filter === "finance" ? "Finance" : "High Probability"} Leads ({filtered.length})</h2>

      {filtered.map((lead: any) => (
        <Card key={lead.id} data-testid={`card-lead-${lead.id}`}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm">{lead.name}</p>
                <p className="text-xs text-muted-foreground">{lead.phone}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <ConfidenceBadge score={lead.confidenceScore} />
                <StatusBadge status={lead.status} />
              </div>
            </div>
            {lead.interest && <p className="text-xs text-muted-foreground mb-1">Interest: {lead.interest}</p>}
            {lead.machineModel && <p className="text-xs text-muted-foreground mb-1">Model: {lead.machineModel}</p>}
            {lead.location && <p className="text-xs text-muted-foreground mb-1">Location: {lead.location}</p>}
            {lead.expectedAmount && <p className="text-xs text-muted-foreground mb-1">Budget: Rs {lead.expectedAmount}</p>}

            {lead.financeRequired && (
              <div className="mt-2 p-2 rounded-md bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 mb-1">Finance Required</p>
                {lead.financeStage && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {Object.entries(financeStageLabels).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          const scores: Record<string, number> = { inquiry: 20, discussion: 40, docs_submitted: 60, sanctioned: 80, disbursement: 95 };
                          updateMutation.mutate({ id: lead.id, data: { financeStage: key, confidenceScore: scores[key] } });
                        }}
                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                          lead.financeStage === key ? "bg-blue-600 text-white border-blue-600" : "hover:bg-blue-100 dark:hover:bg-blue-900"
                        }`}
                        data-testid={`button-finance-${key}-${lead.id}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-1.5 mt-2">
              {["new", "contacted", "qualified", "converted"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateMutation.mutate({ id: lead.id, data: { status: s } })}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                    lead.status === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"
                  }`}
                  data-testid={`button-lead-status-${s}-${lead.id}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && <EmptyState message="No leads match filter" />}
    </div>
  );
}

function ServiceTab() {
  const { toast } = useToast();
  const { data: requests, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/service-requests"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/service-requests/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Service request updated" });
    },
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">Service Requests ({requests?.length || 0})</h2>
      {requests?.map((req: any) => (
        <Card key={req.id} data-testid={`card-service-${req.id}`}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm">{req.clientName}</p>
                <p className="text-xs text-muted-foreground">{req.phone}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={req.urgency === "urgent" ? "destructive" : "secondary"} className="text-[10px]">
                  {req.urgency}
                </Badge>
                <StatusBadge status={req.status} />
              </div>
            </div>
            <p className="text-xs mb-1"><span className="text-muted-foreground">Machine:</span> {req.machineType}</p>
            <p className="text-xs text-muted-foreground mb-2">{req.problem}</p>
            <div className="flex gap-1.5 mt-2">
              {["pending", "assigned", "in_progress", "resolved"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateMutation.mutate({ id: req.id, status: s })}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                    req.status === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"
                  }`}
                  data-testid={`button-service-status-${s}-${req.id}`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      {(!requests || requests.length === 0) && <EmptyState message="No service requests" />}
    </div>
  );
}

function AppointmentsTab() {
  const { toast } = useToast();
  const { data: appointments, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/appointments"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/admin/appointments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Appointment updated" });
    },
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">Factory Visits ({appointments?.length || 0})</h2>
      {appointments?.map((appt: any) => (
        <Card key={appt.id} data-testid={`card-appointment-${appt.id}`}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm">{appt.buyerName}</p>
                <p className="text-xs text-muted-foreground">{appt.buyerPhone}</p>
              </div>
              <StatusBadge status={appt.status} />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {appt.preferredDate}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {appt.preferredTime}</span>
            </div>
            <p className="text-xs mb-1"><span className="text-muted-foreground">Purpose:</span> {appt.purpose}</p>
            {appt.passCode && (
              <p className="text-xs font-mono text-primary">Pass: {appt.passCode}</p>
            )}
            <div className="flex gap-1.5 mt-2">
              {["pending", "approved", "completed", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateMutation.mutate({ id: appt.id, status: s })}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                    appt.status === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"
                  }`}
                  data-testid={`button-appt-status-${s}-${appt.id}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      {(!appointments || appointments.length === 0) && <EmptyState message="No visit bookings" />}
    </div>
  );
}

function ProductsTab() {
  const { toast } = useToast();
  const { isSuperAdmin } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [searchQ, setSearchQ] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<any>({
    name: "", category: "Rolling Shutter", subCategory: "", machineType: "Single Machine",
    profileType: "", cuttingType: "", decoilerType: "", automation: "Semi-Automatic",
    model: "Basic", speed: "", motor: "", gauge: "", stations: "", description: "",
    estimatedPrice: "", image: "/images/machine-1.png", videoUrl: "", isUsed: false,
    condition: "", location: "", yearOfPurchase: "",
  });

  const { data: products, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/products"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Product added!" });
      setShowAddForm(false);
      setNewProduct({ name: "", category: "Rolling Shutter", subCategory: "", machineType: "Single Machine", profileType: "", cuttingType: "", decoilerType: "", automation: "Semi-Automatic", model: "Basic", speed: "", motor: "", gauge: "", stations: "", description: "", estimatedPrice: "", image: "/images/machine-1.png", videoUrl: "", isUsed: false, condition: "", location: "", yearOfPurchase: "" });
    },
    onError: (e: any) => {
      const msg = typeof e?.message === "string" ? e.message : "Failed to add product";
      toast({ title: msg.length > 100 ? "Required fields missing" : msg, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/admin/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product updated" });
      setEditingId(null);
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Product deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  function startEdit(product: any) {
    setEditingId(product.id);
    setEditData({
      name: product.name || "",
      category: product.category || "",
      subCategory: product.subCategory || "",
      machineType: product.machineType || "",
      profileType: product.profileType || "",
      cuttingType: product.cuttingType || "",
      decoilerType: product.decoilerType || "",
      automation: product.automation || "",
      model: product.model || "",
      speed: product.speed || "",
      motor: product.motor || "",
      gauge: product.gauge || "",
      stations: product.stations || "",
      description: product.description || "",
      estimatedPrice: product.estimatedPrice || "",
      image: product.image || "",
      videoUrl: product.videoUrl || "",
      isUsed: product.isUsed || false,
      condition: product.condition || "",
      location: product.location || "",
      yearOfPurchase: product.yearOfPurchase || "",
    });
  }

  function handleSave() {
    if (!editingId) return;
    const cleaned: any = {};
    Object.entries(editData).forEach(([k, v]) => {
      if (v !== "" && v !== undefined && v !== null) cleaned[k] = v;
    });
    if (cleaned.estimatedPrice) cleaned.estimatedPrice = String(cleaned.estimatedPrice);
    updateMutation.mutate({ id: editingId, data: cleaned });
  }

  if (isLoading) return <LoadingState />;

  const categories = ["Rolling Shutter", "False Ceiling", "Drywall & Partition", "Structural", "Door & Window", "Roofing & Cladding", "Solar & Infrastructure"];

  const filtered = products?.filter(p => {
    if (!searchQ) return true;
    const q = searchQ.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.subCategory?.toLowerCase().includes(q);
  }) || [];

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.subCategory) {
      toast({ title: "Name, Category, Sub-Category required", variant: "destructive" });
      return;
    }
    if (!newProduct.description) {
      toast({ title: "Description is required", variant: "destructive" });
      return;
    }
    const cleaned: any = {};
    Object.entries(newProduct).forEach(([k, v]) => {
      if (v !== "" && v !== undefined && v !== null && v !== false) cleaned[k] = v;
    });
    if (newProduct.isUsed) cleaned.isUsed = true;
    if (cleaned.estimatedPrice) cleaned.estimatedPrice = String(cleaned.estimatedPrice);
    if (!cleaned.image) cleaned.image = "/images/machine-1.png";
    if (!cleaned.machineType) cleaned.machineType = "Single Machine";
    if (!cleaned.automation) cleaned.automation = "Semi-Automatic";
    if (!cleaned.model) cleaned.model = "Basic";
    createMutation.mutate(cleaned);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Products ({products?.length || 0})</h2>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} data-testid="button-add-product">
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Add New Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label className="text-[10px]">Name *</Label>
              <Input value={newProduct.name} onChange={e => setNewProduct((p: any) => ({...p, name: e.target.value}))} className="h-7 text-xs" placeholder="Machine name" data-testid="input-new-product-name" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Category *</Label>
                <select value={newProduct.category} onChange={e => setNewProduct((p: any) => ({...p, category: e.target.value}))} className="w-full h-7 rounded-md border border-input bg-background px-2 text-[10px]" data-testid="select-new-category">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[10px]">Sub-Category *</Label>
                <Input value={newProduct.subCategory} onChange={e => setNewProduct((p: any) => ({...p, subCategory: e.target.value}))} className="h-7 text-xs" placeholder="e.g. Shutter Patti" data-testid="input-new-subcategory" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Machine Type</Label>
                <select value={newProduct.machineType} onChange={e => setNewProduct((p: any) => ({...p, machineType: e.target.value}))} className="w-full h-7 rounded-md border border-input bg-background px-2 text-[10px]" data-testid="select-new-machinetype">
                  <option value="Single Machine">Single Machine</option>
                  <option value="Two in One Machine">Two in One</option>
                  <option value="Three in One Machine">Three in One</option>
                  <option value="Four in One Machine">Four in One</option>
                  <option value="Two Piece Machine">Two Piece</option>
                </select>
              </div>
              <div>
                <Label className="text-[10px]">Model</Label>
                <select value={newProduct.model} onChange={e => setNewProduct((p: any) => ({...p, model: e.target.value}))} className="w-full h-7 rounded-md border border-input bg-background px-2 text-[10px]" data-testid="select-new-model">
                  <option value="Basic">Basic</option>
                  <option value="Medium">Medium</option>
                  <option value="Advance">Advance</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px]">Automation</Label>
                <select value={newProduct.automation} onChange={e => setNewProduct((p: any) => ({...p, automation: e.target.value}))} className="w-full h-7 rounded-md border border-input bg-background px-1 text-[10px]" data-testid="select-new-automation">
                  <option value="Manual">Manual</option>
                  <option value="Semi-Automatic">Semi-Auto</option>
                  <option value="Fully Automatic">Auto</option>
                </select>
              </div>
              <div>
                <Label className="text-[10px]">Price (Lakh)</Label>
                <Input value={newProduct.estimatedPrice} onChange={e => setNewProduct((p: any) => ({...p, estimatedPrice: e.target.value}))} className="h-7 text-xs" placeholder="5.00" data-testid="input-new-price" />
              </div>
              <div>
                <Label className="text-[10px]">Stations</Label>
                <Input value={newProduct.stations} onChange={e => setNewProduct((p: any) => ({...p, stations: e.target.value}))} className="h-7 text-xs" placeholder="10-14" data-testid="input-new-stations" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px]">Speed</Label>
                <Input value={newProduct.speed} onChange={e => setNewProduct((p: any) => ({...p, speed: e.target.value}))} className="h-7 text-xs" placeholder="High Speed" data-testid="input-new-speed" />
              </div>
              <div>
                <Label className="text-[10px]">Motor</Label>
                <Input value={newProduct.motor} onChange={e => setNewProduct((p: any) => ({...p, motor: e.target.value}))} className="h-7 text-xs" placeholder="7.5 HP" data-testid="input-new-motor" />
              </div>
              <div>
                <Label className="text-[10px]">Gauge</Label>
                <Input value={newProduct.gauge} onChange={e => setNewProduct((p: any) => ({...p, gauge: e.target.value}))} className="h-7 text-xs" placeholder="0.35-1.00mm" data-testid="input-new-gauge" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Profile Type</Label>
                <Input value={newProduct.profileType} onChange={e => setNewProduct((p: any) => ({...p, profileType: e.target.value}))} className="h-7 text-xs" data-testid="input-new-profile" />
              </div>
              <div>
                <Label className="text-[10px]">Cutting Type</Label>
                <Input value={newProduct.cuttingType} onChange={e => setNewProduct((p: any) => ({...p, cuttingType: e.target.value}))} className="h-7 text-xs" data-testid="input-new-cutting" />
              </div>
            </div>
            <div>
              <Label className="text-[10px]">Product Image</Label>
              <ImageUpload
                bucket="products"
                value={newProduct.image}
                onChange={(url) => setNewProduct((p: any) => ({...p, image: url || "/images/machine-1.png"}))}
                label="Upload Product Image"
              />
            </div>
            <div>
              <Label className="text-[10px]">Description</Label>
              <Textarea value={newProduct.description} onChange={e => setNewProduct((p: any) => ({...p, description: e.target.value}))} className="text-xs min-h-[50px]" placeholder="Machine description..." data-testid="input-new-description" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 text-xs" onClick={handleAddProduct} disabled={createMutation.isPending} data-testid="button-save-new-product">
                <Save className="w-3 h-3 mr-1" /> {createMutation.isPending ? "Adding..." : "Add Product"}
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowAddForm(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Input placeholder="Search products..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="h-8 text-xs" data-testid="input-search-products" />

      {filtered.map((product: any) => (
        <Card key={product.id} data-testid={`card-product-${product.id}`}>
          <CardContent className="pt-3 pb-3">
            {editingId === product.id ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-primary">Edit Product</h3>
                  <button onClick={() => setEditingId(null)} data-testid={`button-cancel-edit-${product.id}`}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div>
                  <Label className="text-[10px]">Name</Label>
                  <Input value={editData.name} onChange={e => setEditData((p: any) => ({ ...p, name: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-name" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px]">Category</Label>
                    <select value={editData.category} onChange={e => setEditData((p: any) => ({ ...p, category: e.target.value }))} className="w-full h-7 rounded-md border border-input bg-background px-2 text-[10px]" data-testid="select-edit-category">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px]">Sub-Category</Label>
                    <Input value={editData.subCategory} onChange={e => setEditData((p: any) => ({ ...p, subCategory: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-subcategory" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px]">Machine Type</Label>
                    <Input value={editData.machineType} onChange={e => setEditData((p: any) => ({ ...p, machineType: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-machinetype" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Model</Label>
                    <Input value={editData.model} onChange={e => setEditData((p: any) => ({ ...p, model: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-model" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px]">Automation</Label>
                    <select value={editData.automation} onChange={e => setEditData((p: any) => ({ ...p, automation: e.target.value }))} className="w-full h-7 rounded-md border border-input bg-background px-1 text-[10px]" data-testid="select-edit-automation">
                      <option value="Manual">Manual</option>
                      <option value="Semi-Automatic">Semi-Auto</option>
                      <option value="Fully Automatic">Auto</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px]">Price (Lakh)</Label>
                    <Input value={editData.estimatedPrice} onChange={e => setEditData((p: any) => ({ ...p, estimatedPrice: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-price" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Stations</Label>
                    <Input value={editData.stations} onChange={e => setEditData((p: any) => ({ ...p, stations: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-stations" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px]">Speed</Label>
                    <Input value={editData.speed} onChange={e => setEditData((p: any) => ({ ...p, speed: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-speed" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Motor</Label>
                    <Input value={editData.motor} onChange={e => setEditData((p: any) => ({ ...p, motor: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-motor" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Gauge</Label>
                    <Input value={editData.gauge} onChange={e => setEditData((p: any) => ({ ...p, gauge: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-gauge" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px]">Profile Type</Label>
                    <Input value={editData.profileType} onChange={e => setEditData((p: any) => ({ ...p, profileType: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-profile" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Cutting Type</Label>
                    <Input value={editData.cuttingType} onChange={e => setEditData((p: any) => ({ ...p, cuttingType: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-cutting" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Decoiler</Label>
                    <Input value={editData.decoilerType} onChange={e => setEditData((p: any) => ({ ...p, decoilerType: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-decoiler" />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px]">Product Image</Label>
                  <ImageUpload
                    bucket="products"
                    value={editData.image}
                    onChange={(url) => setEditData((p: any) => ({ ...p, image: url || "/images/machine-1.png" }))}
                    label="Change Image"
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Video URL</Label>
                  <Input value={editData.videoUrl} onChange={e => setEditData((p: any) => ({ ...p, videoUrl: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-video" />
                </div>
                <div>
                  <Label className="text-[10px]">Description</Label>
                  <Textarea value={editData.description} onChange={e => setEditData((p: any) => ({ ...p, description: e.target.value }))} className="text-xs min-h-[50px]" data-testid="input-edit-description" />
                </div>

                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                  <input type="checkbox" id={`used-${product.id}`} checked={editData.isUsed} onChange={e => setEditData((p: any) => ({ ...p, isUsed: e.target.checked }))} data-testid="checkbox-edit-used" />
                  <Label htmlFor={`used-${product.id}`} className="text-[10px] cursor-pointer">Used / Refurbished Machine</Label>
                </div>

                {editData.isUsed && (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px]">Condition</Label>
                      <Input value={editData.condition} onChange={e => setEditData((p: any) => ({ ...p, condition: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-condition" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Location</Label>
                      <Input value={editData.location} onChange={e => setEditData((p: any) => ({ ...p, location: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-location" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Year</Label>
                      <Input value={editData.yearOfPurchase} onChange={e => setEditData((p: any) => ({ ...p, yearOfPurchase: e.target.value }))} className="h-7 text-xs" data-testid="input-edit-year" />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1 text-xs h-7" onClick={handleSave} disabled={updateMutation.isPending} data-testid="button-save-product">
                    <Save className="w-3 h-3 mr-1" />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setEditingId(null)} data-testid="button-cancel-edit">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-lg bg-accent flex-shrink-0 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{product.name}</p>
                  <div className="flex flex-wrap items-center gap-1 mt-0.5">
                    <Badge variant="secondary" className="text-[10px]">{product.category}</Badge>
                    <Badge variant="outline" className="text-[10px]">{product.subCategory}</Badge>
                    {product.isUsed && <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600">Used</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0 text-[10px] text-muted-foreground mt-1">
                    {product.estimatedPrice && <span className="text-primary font-medium">Rs {product.estimatedPrice} Lakh</span>}
                    {product.automation && <span>{product.automation}</span>}
                    {product.model && <span>{product.model}</span>}
                    {product.stations && <span>{product.stations} stn</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0 text-[10px] text-muted-foreground">
                    {product.speed && <span>Speed: {product.speed}</span>}
                    {product.motor && <span>Motor: {product.motor}</span>}
                    {product.gauge && <span>Gauge: {product.gauge}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => startEdit(product)}
                    className="p-1.5 hover:bg-primary/10 rounded-md text-primary"
                    data-testid={`button-edit-product-${product.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate(product.id); }}
                    className="p-1.5 hover:bg-destructive/10 rounded-md text-destructive"
                    data-testid={`button-delete-product-${product.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {(!products || products.length === 0) && <EmptyState message="No products" />}
    </div>
  );
}

function BroadcastTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showComposer, setShowComposer] = useState(false);
  const [showMetaSettings, setShowMetaSettings] = useState(false);
  const [metaForm, setMetaForm] = useState({ metaAccessToken: "", metaPageId: "", metaInstagramAccountId: "" });
  const [newBroadcast, setNewBroadcast] = useState({
    title: "",
    message: "",
    image: "",
    audience: "all",
    postToSocialMedia: false,
  });

  const { data: broadcasts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/broadcast-posts"],
  });

  const { data: metaSettings } = useQuery<{ hasAccessToken: boolean; metaPageId: string | null; metaInstagramAccountId: string | null }>({
    queryKey: ["/api/admin/meta-settings"],
  });

  const metaSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", "/api/admin/meta-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/meta-settings"] });
      toast({ title: "Meta settings saved!" });
      setShowMetaSettings(false);
    },
    onError: () => toast({ title: "Failed to save Meta settings", variant: "destructive" }),
  });

  const handleMetaOAuthConnect = async () => {
    try {
      const res = await apiRequest("GET", "/api/admin/meta-oauth/init");
      const data = await res.json();
      if (data.oauthUrl) {
        window.open(data.oauthUrl, "_blank", "width=600,height=700");
      } else {
        toast({ title: data.message || "Could not start OAuth", variant: "destructive" });
      }
    } catch {
      toast({ title: "META_APP_ID not configured. Use manual setup or set META_APP_ID and META_APP_SECRET environment variables.", variant: "destructive" });
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/broadcast-posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/broadcast-posts"] });
      toast({ title: "Broadcast published!" });
      setShowComposer(false);
      setNewBroadcast({ title: "", message: "", image: "", audience: "all", postToSocialMedia: false });
    },
    onError: () => toast({ title: "Failed to publish broadcast", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/broadcast-posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/broadcast-posts"] });
      toast({ title: "Broadcast deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const handlePublish = () => {
    if (!newBroadcast.title || !newBroadcast.message) {
      toast({ title: "Title and message are required", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      ...newBroadcast,
      createdBy: user?.name || "Admin",
    });
  };

  if (isLoading) return <LoadingState />;

  const audienceLabel: Record<string, string> = { suppliers: "Suppliers", buyers: "Machine Buyers", all: "Everyone" };
  const audienceIcon: Record<string, any> = { suppliers: Building2, buyers: ShoppingCart, all: Globe };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
          <Megaphone className="w-4 h-4" />
          Broadcast Posts ({broadcasts?.length || 0})
        </h2>
        <Button size="sm" onClick={() => setShowComposer(!showComposer)} data-testid="button-new-broadcast">
          <Plus className="w-4 h-4 mr-1" /> New Broadcast
        </Button>
      </div>

      {showComposer && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-primary" />
              New Broadcast Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-[10px]">Title *</Label>
              <Input
                value={newBroadcast.title}
                onChange={e => setNewBroadcast(p => ({ ...p, title: e.target.value }))}
                className="h-8 text-xs"
                placeholder="Broadcast title..."
                data-testid="input-broadcast-title"
              />
            </div>
            <div>
              <Label className="text-[10px]">Message *</Label>
              <Textarea
                value={newBroadcast.message}
                onChange={e => setNewBroadcast(p => ({ ...p, message: e.target.value }))}
                className="text-xs min-h-[80px]"
                placeholder="Write your broadcast message..."
                data-testid="input-broadcast-message"
              />
            </div>
            <div>
              <Label className="text-[10px]">Image (optional)</Label>
              <ImageUpload
                bucket="broadcasts"
                value={newBroadcast.image}
                onChange={(url) => setNewBroadcast(p => ({ ...p, image: url }))}
                label="Upload Broadcast Image"
              />
            </div>
            <div>
              <Label className="text-[10px]">Target Audience</Label>
              <Select
                value={newBroadcast.audience}
                onValueChange={(val) => setNewBroadcast(p => ({ ...p, audience: val }))}
              >
                <SelectTrigger className="h-8 text-xs" data-testid="select-broadcast-audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone (Suppliers + Buyers)</SelectItem>
                  <SelectItem value="suppliers">Suppliers Only</SelectItem>
                  <SelectItem value="buyers">Machine Buyers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-[10px] font-medium">Share on Social Media</p>
                  <p className="text-[9px] text-muted-foreground">Post to Facebook & Instagram</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={newBroadcast.postToSocialMedia}
                  onChange={e => setNewBroadcast(p => ({ ...p, postToSocialMedia: e.target.checked }))}
                  className="sr-only peer"
                  data-testid="toggle-social-media"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {newBroadcast.postToSocialMedia && !metaSettings?.hasAccessToken && (
              <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50">
                <p className="text-[10px] text-amber-700 dark:text-amber-400">
                  Meta account not connected. Connect via OAuth or enter credentials manually below.
                </p>
                <div className="flex gap-2 mt-1">
                  <Button size="sm" variant="link" className="text-[10px] p-0 h-auto text-blue-600" onClick={handleMetaOAuthConnect}>
                    Connect Meta Account (OAuth) →
                  </Button>
                  <Button size="sm" variant="link" className="text-[10px] p-0 h-auto text-amber-600" onClick={() => setShowMetaSettings(true)}>
                    Manual Setup →
                  </Button>
                </div>
              </div>
            )}
            {newBroadcast.postToSocialMedia && metaSettings?.hasAccessToken && (
              <div className="p-2 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200/50">
                <p className="text-[10px] text-green-700 dark:text-green-400">
                  Meta connected — Posts will be published to Facebook{metaSettings.metaInstagramAccountId ? " & Instagram" : ""}.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 text-xs"
                onClick={handlePublish}
                disabled={createMutation.isPending}
                data-testid="button-publish-broadcast"
              >
                <Send className="w-3 h-3 mr-1" />
                {createMutation.isPending ? "Publishing..." : "Publish Broadcast"}
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowComposer(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {broadcasts?.map((post: any) => {
        const AudienceIcon = audienceIcon[post.audience] || Globe;
        return (
          <Card key={post.id} data-testid={`card-broadcast-${post.id}`}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{post.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.message}</p>
                </div>
                <Badge className="text-[9px] ml-2 gap-0.5 shrink-0" variant="outline">
                  <AudienceIcon className="w-2.5 h-2.5" />
                  {audienceLabel[post.audience] || "All"}
                </Badge>
              </div>
              {post.image && (
                <div className="w-full h-20 rounded-md overflow-hidden bg-accent mt-2 mb-2">
                  <img src={post.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-2">
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3" /> {post.viewCount || 0} views
                </span>
                <span className="flex items-center gap-0.5">
                  <Users className="w-3 h-3" /> {post.targetUserCount || 0} targeted
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                </span>
              </div>
              {post.postToSocialMedia && (
                <div className="flex items-center gap-2 mt-2 p-1.5 rounded-md bg-muted/50">
                  <Globe className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px]">Social Media: </span>
                  {post.socialMediaStatus === "published" ? (
                    <div className="flex items-center gap-2">
                      {post.facebookPostUrl && (
                        <a href={post.facebookPostUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 flex items-center gap-0.5">
                          Facebook <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {post.instagramPostUrl && (
                        <a href={post.instagramPostUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-pink-600 flex items-center gap-0.5">
                          Instagram <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      <Badge className="text-[8px] bg-green-100 text-green-700">Live</Badge>
                    </div>
                  ) : post.socialMediaStatus === "partial" ? (
                    <div className="flex items-center gap-1 flex-wrap">
                      {post.facebookPostUrl && (
                        <a href={post.facebookPostUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 flex items-center gap-0.5">
                          Facebook <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      <Badge className="text-[8px] bg-amber-100 text-amber-700">Partial</Badge>
                      {post.socialMediaError && (
                        <span className="text-[9px] text-amber-600 truncate max-w-[200px]">{post.socialMediaError}</span>
                      )}
                    </div>
                  ) : post.socialMediaStatus === "failed" ? (
                    <div className="flex items-center gap-1">
                      <Badge className="text-[8px] bg-red-100 text-red-700">Failed</Badge>
                      {post.socialMediaError && (
                        <span className="text-[9px] text-red-500 truncate max-w-[200px]">{post.socialMediaError}</span>
                      )}
                    </div>
                  ) : (
                    <Badge className="text-[8px] bg-gray-100 text-gray-700">Not Posted</Badge>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs"
                  onClick={() => { if (confirm("Delete this broadcast?")) deleteMutation.mutate(post.id); }}
                  data-testid={`button-delete-broadcast-${post.id}`}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {(!broadcasts || broadcasts.length === 0) && <EmptyState message="No broadcast posts yet" />}

      <div className="flex items-center justify-between pt-3 border-t">
        <h3 className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
          <Globe className="w-3.5 h-3.5" /> Meta (Facebook + Instagram)
        </h3>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={handleMetaOAuthConnect}>
            {metaSettings?.hasAccessToken ? "Reconnect OAuth" : "Connect with Facebook"}
          </Button>
          <Button size="sm" variant="ghost" className="text-[10px] h-7" onClick={() => setShowMetaSettings(!showMetaSettings)}>
            Manual
          </Button>
        </div>
      </div>

      {metaSettings?.hasAccessToken && !showMetaSettings && (
        <div className="p-2 rounded-md bg-green-50 dark:bg-green-950/20 text-[10px]">
          <p className="text-green-700 dark:text-green-400 font-medium">Meta Connected</p>
          <p className="text-green-600 dark:text-green-500">Page ID: {metaSettings.metaPageId || "N/A"}</p>
          {metaSettings.metaInstagramAccountId && <p className="text-green-600 dark:text-green-500">Instagram: Connected</p>}
        </div>
      )}

      {showMetaSettings && (
        <Card className="border-blue-200/50">
          <CardContent className="pt-3 pb-3 space-y-2">
            <p className="text-[9px] text-muted-foreground">
              Enter your Meta Page Access Token and Page ID to enable social media publishing. Get these from the Meta Developer Portal (developers.facebook.com).
            </p>
            <div>
              <Label className="text-[10px]">Page Access Token *</Label>
              <Input
                type="password"
                value={metaForm.metaAccessToken}
                onChange={e => setMetaForm(p => ({ ...p, metaAccessToken: e.target.value }))}
                className="h-8 text-xs"
                placeholder={metaSettings?.hasAccessToken ? "••••••• (leave blank to keep current)" : "Enter token..."}
              />
            </div>
            <div>
              <Label className="text-[10px]">Facebook Page ID *</Label>
              <Input
                value={metaForm.metaPageId}
                onChange={e => setMetaForm(p => ({ ...p, metaPageId: e.target.value }))}
                className="h-8 text-xs"
                placeholder={metaSettings?.metaPageId || "e.g. 123456789012345"}
              />
            </div>
            <div>
              <Label className="text-[10px]">Instagram Business Account ID (optional)</Label>
              <Input
                value={metaForm.metaInstagramAccountId}
                onChange={e => setMetaForm(p => ({ ...p, metaInstagramAccountId: e.target.value }))}
                className="h-8 text-xs"
                placeholder={metaSettings?.metaInstagramAccountId || "For Instagram posts (requires image)"}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="text-xs"
                disabled={metaSettingsMutation.isPending}
                onClick={() => {
                  const data: any = {};
                  if (metaForm.metaAccessToken) data.metaAccessToken = metaForm.metaAccessToken;
                  if (metaForm.metaPageId) data.metaPageId = metaForm.metaPageId;
                  if (metaForm.metaInstagramAccountId) data.metaInstagramAccountId = metaForm.metaInstagramAccountId;
                  if (Object.keys(data).length === 0) {
                    toast({ title: "Please fill in at least one field", variant: "destructive" });
                    return;
                  }
                  metaSettingsMutation.mutate(data);
                }}
              >
                {metaSettingsMutation.isPending ? "Saving..." : "Save Meta Settings"}
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowMetaSettings(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PostsTab() {
  const { toast } = useToast();
  const [showAddPost, setShowAddPost] = useState(false);
  const [newPost, setNewPost] = useState({ caption: "", author: "Sai Rolotech Official", type: "image", images: "", videoUrl: "", youtubeUrl: "" });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const { data: posts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      if (mediaFile) {
        const formData = new FormData();
        formData.append("caption", data.caption);
        formData.append("author", data.author);
        formData.append("media", mediaFile);
        if (data.youtubeUrl) formData.append("youtubeUrl", data.youtubeUrl);
        const res = await apiUpload("POST", "/api/admin/posts", formData);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to create post");
        }
        return res.json();
      } else {
        await apiRequest("POST", "/api/admin/posts", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post created!" });
      setShowAddPost(false);
      setNewPost({ caption: "", author: "Sai Rolotech Official", type: "image", images: "", videoUrl: "", youtubeUrl: "" });
      setMediaFile(null);
      setMediaPreview(null);
    },
    onError: (e: any) => toast({ title: e?.message || "Failed to create post", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, isApproved }: { id: string; isApproved: boolean }) => {
      await apiRequest("PATCH", `/api/admin/posts/${id}`, { isApproved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const handleCreatePost = () => {
    if (!newPost.caption) {
      toast({ title: "Caption is required", variant: "destructive" });
      return;
    }
    const postData: any = {
      caption: newPost.caption,
      author: newPost.author,
      type: newPost.type,
      isApproved: true,
    };
    if (newPost.type === "image" && newPost.images && !mediaFile) {
      postData.images = newPost.images.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    if (newPost.type === "video" && newPost.youtubeUrl) {
      postData.youtubeUrl = newPost.youtubeUrl;
    }
    createPostMutation.mutate(postData);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      toast({ title: "Only image or video files allowed", variant: "destructive" });
      return;
    }
    if (isImage && file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be under 10MB", variant: "destructive" });
      return;
    }
    if (isVideo && file.size > 50 * 1024 * 1024) {
      toast({ title: "Video must be under 50MB", variant: "destructive" });
      return;
    }
    setMediaFile(file);
    setNewPost(p => ({ ...p, type: isVideo ? "video" : "image" }));
    const reader = new FileReader();
    reader.onload = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Post to Community Feed ({posts?.length || 0})</h2>
        <Button size="sm" onClick={() => setShowAddPost(!showAddPost)} data-testid="button-add-post">
          <Plus className="w-4 h-4 mr-1" /> Add Post
        </Button>
      </div>

      {showAddPost && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              New Community Post
              <Badge className="text-[8px] bg-primary/10 text-primary border-primary/20">Official</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label className="text-[10px]">Author</Label>
              <Input value={newPost.author} onChange={e => setNewPost(p => ({...p, author: e.target.value}))} className="h-7 text-xs" data-testid="input-post-author" />
            </div>
            <div>
              <Label className="text-[10px]">Caption *</Label>
              <Textarea value={newPost.caption} onChange={e => setNewPost(p => ({...p, caption: e.target.value}))} className="text-xs min-h-[60px]" placeholder="Write caption..." data-testid="input-post-caption" />
            </div>

            <div>
              <Label className="text-[10px]">Upload Photo or Video (max 10MB photo / 50MB video)</Label>
              <div className="mt-1">
                <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" className="text-xs" onChange={handleFileSelect} data-testid="input-post-media" />
              </div>
              {mediaPreview && mediaFile?.type.startsWith("image/") && (
                <div className="relative mt-2">
                  <img src={mediaPreview} className="w-full max-h-32 object-cover rounded-md" alt="Preview" />
                  <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">×</button>
                </div>
              )}
              {mediaPreview && mediaFile?.type.startsWith("video/") && (
                <div className="relative mt-2">
                  <video src={mediaPreview} className="w-full max-h-32 rounded-md" controls />
                  <button onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">×</button>
                </div>
              )}
            </div>

            {!mediaFile && (
              <div>
                <Label className="text-[10px]">Or use Image URLs (comma separated)</Label>
                <MultiImageUpload
                  bucket="posts"
                  values={newPost.images ? (typeof newPost.images === "string" ? newPost.images.split(",").map((s: string) => s.trim()).filter(Boolean) : newPost.images as string[]) : []}
                  onChange={(urls) => setNewPost(p => ({...p, images: urls.join(", ")}))}
                  label="Upload Post Images"
                  max={5}
                />
              </div>
            )}

            <div>
              <Label className="text-[10px]">YouTube Link (optional)</Label>
              <Input value={newPost.youtubeUrl} onChange={e => setNewPost(p => ({...p, youtubeUrl: e.target.value}))} className="h-7 text-xs" placeholder="https://youtube.com/..." data-testid="input-post-youtube" />
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1 text-xs" onClick={handleCreatePost} disabled={createPostMutation.isPending} data-testid="button-save-post">
                <Save className="w-3 h-3 mr-1" /> {createPostMutation.isPending ? "Posting..." : "Publish to Feed"}
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => { setShowAddPost(false); setMediaFile(null); setMediaPreview(null); }}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {posts?.map((post: any) => (
        <Card key={post.id} data-testid={`card-post-${post.id}`}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{post.author}</p>
                  <Badge variant="outline" className="text-[10px]">{post.mediaType || post.type}</Badge>
                  {post.isAdminPost && (
                    <Badge className="text-[8px] bg-primary/10 text-primary border-primary/20">Official</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.caption}</p>
                {post.videoUrl && <p className="text-[10px] text-blue-500 mt-0.5 truncate">Video: {post.videoUrl}</p>}
                {post.youtubeUrl && <p className="text-[10px] text-blue-500 mt-0.5 truncate">YouTube: {post.youtubeUrl}</p>}
                {post.images && post.images.length > 0 && <p className="text-[10px] text-muted-foreground mt-0.5">{post.images.length} image(s)</p>}
              </div>
              <Badge variant={post.isApproved ? "default" : "destructive"} className="text-[10px] ml-2">
                {post.isApproved ? "Live" : "Hidden"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => updateMutation.mutate({ id: post.id, isApproved: !post.isApproved })}
                data-testid={`button-toggle-post-${post.id}`}
              >
                {post.isApproved ? "Hide" : "Approve"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="text-xs"
                onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(post.id); }}
                data-testid={`button-delete-post-${post.id}`}
              >
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {(!posts || posts.length === 0) && <EmptyState message="No posts" />}
    </div>
  );
}

function UsersTab() {
  const { toast } = useToast();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, role, isVerified }: { id: string; role?: string; isVerified?: boolean }) => {
      await apiRequest("PATCH", `/api/admin/users/${id}`, { role, isVerified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ userId, approved }: { userId: string; approved: boolean }) => {
      await apiRequest("POST", "/api/admin/approve-user", { userId, approved });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: vars.approved ? "User approved" : "Approval revoked" });
    },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const toggle2FAMutation = useMutation({
    mutationFn: async ({ userId, enabled }: { userId: string; enabled: boolean }) => {
      await apiRequest("POST", "/api/admin/toggle-2fa", { userId, enabled });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: vars.enabled ? "2FA enabled" : "2FA disabled" });
    },
  });

  const deviceMutation = useMutation({
    mutationFn: async ({ userId, enabled }: { userId: string; enabled: boolean }) => {
      await apiRequest("POST", "/api/admin/set-device-restriction", { userId, enabled });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: vars.enabled ? "Device restriction enabled" : "Device restriction disabled" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "User removed" });
    },
    onError: () => toast({ title: "Failed to delete user", variant: "destructive" }),
  });

  if (isLoading) return <LoadingState />;

  const pendingUsers = users?.filter(u => !u.isApproved && u.isEmailVerified && u.role !== "admin") || [];
  const approvedUsers = users?.filter(u => u.isApproved || u.role === "admin") || [];
  const unverifiedUsers = users?.filter(u => !u.isEmailVerified && u.role !== "admin") || [];

  return (
    <div className="space-y-4">
      {pendingUsers.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending Approval ({pendingUsers.length})
          </h2>
          {pendingUsers.map((u: any) => (
            <Card key={u.id} className="border-amber-200 dark:border-amber-800" data-testid={`card-pending-user-${u.id}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">@{u.username} | {u.phone}</p>
                    {u.email && <p className="text-xs text-muted-foreground">{u.email}</p>}
                    {u.companyName && <p className="text-xs text-muted-foreground">{u.companyName}</p>}
                  </div>
                  <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600">Pending</Badge>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    className="text-xs h-7 flex-1"
                    onClick={() => approveMutation.mutate({ userId: u.id, approved: true })}
                    disabled={approveMutation.isPending}
                    data-testid={`button-approve-user-${u.id}`}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => approveMutation.mutate({ userId: u.id, approved: false })}
                    disabled={approveMutation.isPending}
                    data-testid={`button-reject-user-${u.id}`}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs h-7"
                    onClick={() => { if (confirm(`Delete "${u.name}"?`)) deleteUserMutation.mutate(u.id); }}
                    data-testid={`button-delete-pending-${u.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          All Users ({users?.length || 0})
        </h2>
        {approvedUsers.map((u: any) => (
          <Card key={u.id} data-testid={`card-user-${u.id}`}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start justify-between mb-2" onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)} style={{ cursor: "pointer" }}>
                <div>
                  <p className="font-semibold text-sm">{u.name}</p>
                  <p className="text-xs text-muted-foreground">@{u.username} | {u.phone}</p>
                  {u.email && <p className="text-xs text-muted-foreground">{u.email}</p>}
                  {u.companyName && <p className="text-xs text-muted-foreground">{u.companyName}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Badge variant="secondary" className="text-[10px]">{u.role}</Badge>
                  {u.isApproved && <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Approved</Badge>}
                  {u.twoFactorEnabled && <Badge className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">2FA</Badge>}
                  {u.allowedDevices?.length > 0 && <Badge className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Device Lock</Badge>}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Select
                  value={u.role}
                  onValueChange={(role) => updateMutation.mutate({ id: u.id, role })}
                >
                  <SelectTrigger className="h-7 text-xs w-28" data-testid={`select-user-role-${u.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="sub_admin">Sub-Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant={u.isVerified ? "outline" : "default"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => updateMutation.mutate({ id: u.id, isVerified: !u.isVerified })}
                  data-testid={`button-verify-user-${u.id}`}
                >
                  {u.isVerified ? "Unverify" : "Verify"}
                </Button>
                {u.role !== "admin" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => { if (confirm(`Delete user "${u.name}"? This cannot be undone.`)) deleteUserMutation.mutate(u.id); }}
                    data-testid={`button-delete-user-${u.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {expandedUser === u.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Security Controls</p>

                  <div className="flex items-center justify-between p-2 bg-accent/30 rounded-md">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs">Admin Approval</span>
                    </div>
                    <Button
                      size="sm"
                      variant={u.isApproved ? "outline" : "default"}
                      className="text-[10px] h-6 px-2"
                      onClick={() => approveMutation.mutate({ userId: u.id, approved: !u.isApproved })}
                      data-testid={`button-toggle-approval-${u.id}`}
                    >
                      {u.isApproved ? "Revoke" : "Approve"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-accent/30 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs">Two-Factor Auth (Email OTP)</span>
                    </div>
                    <Button
                      size="sm"
                      variant={u.twoFactorEnabled ? "destructive" : "default"}
                      className="text-[10px] h-6 px-2"
                      onClick={() => toggle2FAMutation.mutate({ userId: u.id, enabled: !u.twoFactorEnabled })}
                      data-testid={`button-toggle-2fa-${u.id}`}
                    >
                      {u.twoFactorEnabled ? "Disable" : "Enable"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-accent/30 rounded-md">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-xs">Device Restriction</span>
                    </div>
                    <Button
                      size="sm"
                      variant={u.allowedDevices?.length > 0 ? "destructive" : "default"}
                      className="text-[10px] h-6 px-2"
                      onClick={() => deviceMutation.mutate({ userId: u.id, enabled: !(u.allowedDevices?.length > 0) })}
                      data-testid={`button-toggle-device-${u.id}`}
                    >
                      {u.allowedDevices?.length > 0 ? "Disable" : "Enable"}
                    </Button>
                  </div>

                  {u.lastDeviceFingerprint && (
                    <div className="p-2 bg-accent/20 rounded-md">
                      <p className="text-[10px] text-muted-foreground">Last Device:</p>
                      <p className="text-[10px] font-mono truncate">{u.lastDeviceFingerprint}</p>
                    </div>
                  )}

                  {u.lastLoginAt && (
                    <p className="text-[10px] text-muted-foreground">
                      Last login: {new Date(u.lastLoginAt).toLocaleString()}
                    </p>
                  )}

                  {u.isEmailVerified === false && (
                    <Badge variant="outline" className="text-[10px] border-red-300 text-red-600">Email Not Verified</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {unverifiedUsers.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider">Unverified Email ({unverifiedUsers.length})</h3>
            {unverifiedUsers.map((u: any) => (
              <Card key={u.id} className="border-red-200 dark:border-red-800/50 opacity-60" data-testid={`card-unverified-user-${u.id}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">@{u.username} | {u.email || "no email"}</p>
                      <Badge variant="outline" className="text-[10px] border-red-300 text-red-500 mt-1">Email not verified</Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => { if (confirm(`Delete "${u.name}"?`)) deleteUserMutation.mutate(u.id); }}
                      data-testid={`button-delete-unverified-${u.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(!users || users.length === 0) && <EmptyState message="No users" />}
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, testId }: { checked: boolean; onChange: (v: boolean) => void; testId: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
      data-testid={testId}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function SettingsTab() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<any>({
    queryKey: ["/api/settings"],
  });

  const [formData, setFormData] = useState<any>(null);
  const [settingsSection, setSettingsSection] = useState<"company" | "features" | "content" | "advanced" | "account_security">("company");

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Settings saved!" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  if (isLoading) return <LoadingState />;

  const d = formData || settings || {};
  const update = (key: string, val: any) => setFormData({ ...d, [key]: val });

  const sections = [
    { id: "company", label: "Company" },
    { id: "features", label: "Features" },
    { id: "content", label: "Content" },
    { id: "advanced", label: "Advanced" },
    { id: "account_security", label: "My Security" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">App Control Panel</h2>
      </div>

      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setSettingsSection(s.id as any)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
              settingsSection === s.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
            }`}
            data-testid={`button-settings-${s.id}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {settingsSection === "company" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-[10px]">Company Name</Label>
              <Input value={d.companyName || ""} onChange={e => update("companyName", e.target.value)} className="h-8 text-xs" data-testid="input-company-name" />
            </div>
            <div>
              <Label className="text-[10px]">WhatsApp Number (with country code)</Label>
              <Input value={d.whatsappNumber || ""} onChange={e => update("whatsappNumber", e.target.value)} className="h-8 text-xs" placeholder="919090486262" data-testid="input-whatsapp" />
            </div>
            <div>
              <Label className="text-[10px]">Support Phone Number</Label>
              <Input value={d.supportNumber || ""} onChange={e => update("supportNumber", e.target.value)} className="h-8 text-xs" placeholder="919090486262" data-testid="input-support" />
            </div>
            <div>
              <Label className="text-[10px]">Current Coil Rate (Rs/kg)</Label>
              <Input value={d.currentCoilRate || ""} onChange={e => update("currentCoilRate", e.target.value)} className="h-8 text-xs" data-testid="input-coil-rate" />
            </div>
            <div>
              <Label className="text-[10px]">Factory Address</Label>
              <Textarea value={d.address || ""} onChange={e => update("address", e.target.value)} rows={2} className="text-xs" data-testid="input-address" />
            </div>
            <div>
              <Label className="text-[10px]">Hero Tagline (below company name)</Label>
              <Input value={d.heroTagline || ""} onChange={e => update("heroTagline", e.target.value)} className="h-8 text-xs" placeholder="Industrial Ecosystem" data-testid="input-hero-tagline" />
            </div>
          </CardContent>
        </Card>
      )}

      {settingsSection === "features" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Feature Toggles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {[
              { key: "chatbotEnabled", label: "AI ChatBot", desc: "Bottom-right chatbot assistant" },
              { key: "whatsappButtonEnabled", label: "WhatsApp Button", desc: "Floating green WhatsApp button" },
              { key: "splashScreenEnabled", label: "Splash Screen", desc: "Opening animation on app load" },
              { key: "visitorCounterEnabled", label: "Visitor Counter", desc: "Live visitor count on home page" },
              { key: "marketRateEnabled", label: "Market Rate Card", desc: "Aaj Ka Rate section on home page" },
              { key: "quickActionsEnabled", label: "Quick Actions", desc: "Horizontal scrollable action buttons" },
              { key: "bannerCarouselEnabled", label: "Banner Carousel", desc: "Promotional banner slider" },
              { key: "socialFeedEnabled", label: "Social Feed / Posts", desc: "Instagram-style post feed" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
                <ToggleSwitch
                  checked={d[item.key] !== false}
                  onChange={v => update(item.key, v)}
                  testId={`toggle-${item.key}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {settingsSection === "content" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Content Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-[10px]">Chatbot Welcome Message</Label>
              <Textarea
                value={d.chatbotWelcomeMessage || ""}
                onChange={e => update("chatbotWelcomeMessage", e.target.value)}
                rows={3}
                className="text-xs"
                placeholder="Namaste! Ask me about machines..."
                data-testid="input-chatbot-welcome"
              />
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-medium">Announcement Banner</p>
                  <p className="text-[10px] text-muted-foreground">Show announcement strip on home page</p>
                </div>
                <ToggleSwitch checked={d.announcementEnabled === true} onChange={v => update("announcementEnabled", v)} testId="toggle-announcement" />
              </div>
              {d.announcementEnabled && (
                <Textarea
                  value={d.announcementText || ""}
                  onChange={e => update("announcementText", e.target.value)}
                  rows={2}
                  className="text-xs"
                  placeholder="e.g. Factory closed on 15 Aug for Independence Day"
                  data-testid="input-announcement-text"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {settingsSection === "advanced" && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">Quotation Approval Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-[10px]">Discount Threshold (%) — quotes above this require approval</Label>
                <Input
                  type="number"
                  value={d.approvalDiscountThreshold ?? 10}
                  onChange={e => update("approvalDiscountThreshold", parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs"
                  data-testid="input-discount-threshold"
                />
              </div>
              <div>
                <Label className="text-[10px]">Price Threshold (Rs) — quotes above this require approval</Label>
                <Input
                  type="number"
                  value={d.approvalPriceThreshold ?? 500000}
                  onChange={e => update("approvalPriceThreshold", parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs"
                  data-testid="input-price-threshold"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">Advanced Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-xs font-medium text-destructive">Maintenance Mode</p>
                  <p className="text-[10px] text-muted-foreground">Show "under maintenance" to all visitors</p>
                </div>
                <ToggleSwitch checked={d.maintenanceMode === true} onChange={v => update("maintenanceMode", v)} testId="toggle-maintenance" />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {settingsSection === "account_security" && <MyAccountSecurity />}

      {settingsSection !== "account_security" && (
        <Button
          onClick={() => saveMutation.mutate(formData || d)}
          disabled={saveMutation.isPending}
          className="w-full"
          data-testid="button-save-settings"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save All Settings"}
        </Button>
      )}
    </div>
  );
}

function MyAccountSecurity() {
  const { user, toggle2FA } = useAuth();
  const { toast } = useToast();

  const { data: mySessions, isLoading: sessionsLoading } = useQuery<any[]>({
    queryKey: ["/api/auth/my-sessions"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const revokeMySession = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest("DELETE", `/api/auth/my-sessions/${sessionId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Session revoked" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/my-sessions"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handle2FAToggle = async () => {
    if (!user?.email && !user?.twoFactorEnabled) {
      toast({ title: "Email required", description: "Add an email to your account to enable 2FA", variant: "destructive" });
      return;
    }
    try {
      await toggle2FA.mutateAsync({ enabled: !user?.twoFactorEnabled });
      toast({ title: user?.twoFactorEnabled ? "2FA disabled" : "2FA enabled" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Two-Factor Authentication (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-medium">Email OTP Verification</p>
              <p className="text-[10px] text-muted-foreground">
                {user?.twoFactorEnabled
                  ? "Enabled - OTP will be sent to your email on login"
                  : "Disabled - Enable for extra security on login"
                }
              </p>
              {!user?.email && (
                <p className="text-[10px] text-orange-600 mt-1">Email is required to enable 2FA</p>
              )}
            </div>
            <Button
              variant={user?.twoFactorEnabled ? "destructive" : "default"}
              size="sm"
              className="text-xs h-7"
              onClick={handle2FAToggle}
              disabled={toggle2FA.isPending}
              data-testid="button-toggle-2fa"
            >
              {toggle2FA.isPending ? "..." : user?.twoFactorEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Active Sessions ({mySessions?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : !mySessions?.length ? (
            <p className="text-xs text-muted-foreground text-center py-3">No active sessions tracked</p>
          ) : (
            <div className="space-y-2">
              {mySessions.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/50 border text-xs">
                  <div>
                    <div className="text-muted-foreground">IP: {s.ip || "N/A"}</div>
                    <div className="text-muted-foreground">Last: {formatDate(s.lastActive)}</div>
                    <div className="text-muted-foreground truncate max-w-[180px]">{s.deviceFingerprint?.substring(0, 40) || "N/A"}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 text-destructive"
                    onClick={() => revokeMySession.mutate(s.id)}
                    disabled={revokeMySession.isPending}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuotationsTrackerTab() {
  const [searchQ, setSearchQ] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [discountFilter, setDiscountFilter] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const { data: quotations, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/quotations-tracker"],
  });

  if (isLoading) return <LoadingState />;

  const filtered = quotations?.filter((q: any) => {
    const matchSearch = !searchQ ||
      q.customerName?.toLowerCase().includes(searchQ.toLowerCase()) ||
      q.customerPhone?.includes(searchQ) ||
      q.machineCategory?.toLowerCase().includes(searchQ.toLowerCase()) ||
      q.quotationNumber?.toLowerCase().includes(searchQ.toLowerCase());
    const matchDate = !dateFilter || (q.createdAt && new Date(q.createdAt).toISOString().slice(0, 10) >= dateFilter);
    const matchDiscount = !discountFilter || parseFloat(q.discountPercent || "0") >= parseFloat(discountFilter);
    return matchSearch && matchDate && matchDiscount;
  }) || [];

  if (selectedQuote) {
    return (
      <div className="space-y-3">
        <button onClick={() => setSelectedQuote(null)} className="flex items-center gap-1 text-xs text-primary" data-testid="button-back-quotes">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to list
        </button>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {selectedQuote.quotationNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { l: "Customer", v: selectedQuote.customerName },
              { l: "Phone", v: selectedQuote.customerPhone },
              { l: "Email", v: selectedQuote.customerEmail },
              { l: "Company", v: selectedQuote.companyName },
              { l: "Machine", v: `${selectedQuote.machineCategory} - ${selectedQuote.profileType}` },
              { l: "Tier", v: selectedQuote.tier },
              { l: "Automation", v: selectedQuote.automation },
              { l: "Rolls", v: selectedQuote.rolls },
              { l: "Quantity", v: selectedQuote.quantity },
              { l: "Unit Price", v: `Rs ${(selectedQuote.singlePrice || 0).toLocaleString("en-IN")}` },
              { l: "Discount", v: selectedQuote.discountPercent ? `${selectedQuote.discountPercent}%` : "None" },
              { l: "Grand Total", v: `Rs ${(selectedQuote.grandTotal || 0).toLocaleString("en-IN")}` },
              { l: "Status", v: selectedQuote.status },
              { l: "Approval", v: selectedQuote.approvalStatus || "N/A" },
              { l: "Created", v: selectedQuote.createdAt ? new Date(selectedQuote.createdAt).toLocaleDateString("en-IN") : "" },
              { l: "Valid Until", v: selectedQuote.validUntil },
            ].filter(r => r.v).map((row) => (
              <div key={row.l} className="flex justify-between text-xs py-1.5 border-b last:border-0">
                <span className="text-muted-foreground">{row.l}</span>
                <span className="font-medium text-right max-w-[60%]">{row.v}</span>
              </div>
            ))}
            {selectedQuote.flaggedReason && (
              <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-800">
                <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">Flagged</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400">{selectedQuote.flaggedReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">Quotation Tracker ({filtered.length})</h2>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, machine..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="pl-9 h-8 text-xs"
            data-testid="input-search-quotations"
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-8 text-xs flex-1"
            data-testid="input-date-filter"
          />
          <Input
            placeholder="Min discount %"
            value={discountFilter}
            onChange={(e) => setDiscountFilter(e.target.value)}
            className="h-8 text-xs w-28"
            data-testid="input-discount-filter"
          />
        </div>
      </div>

      {filtered.map((q: any) => (
        <Card key={q.id} className="cursor-pointer hover:bg-accent/30 transition-all" onClick={() => setSelectedQuote(q)} data-testid={`card-quote-${q.id}`}>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-sm font-semibold">{q.customerName}</p>
                <p className="text-[10px] text-muted-foreground">{q.quotationNumber} | {q.customerPhone}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={`text-[10px] ${q.approvalStatus === "pending_approval" ? "bg-amber-100 text-amber-700" : q.approvalStatus === "approved" ? "bg-green-100 text-green-700" : q.approvalStatus === "rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                  {q.approvalStatus || q.status || "sent"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>{q.machineCategory}</span>
              <span className="font-semibold text-foreground">Rs {(q.grandTotal || 0).toLocaleString("en-IN")}</span>
              {q.discountPercent && parseFloat(q.discountPercent) > 0 && (
                <span className="text-green-600">{q.discountPercent}% off</span>
              )}
              <span>{q.createdAt ? new Date(q.createdAt).toLocaleDateString("en-IN") : ""}</span>
            </div>
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && <EmptyState message="No quotations found" />}
    </div>
  );
}

function ApprovalsTab() {
  const { toast } = useToast();
  const [approvalNote, setApprovalNote] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: pendingApprovals, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/pending-approvals"],
  });
  const { data: allQuotations } = useQuery<any[]>({
    queryKey: ["/api/admin/quotations-tracker"],
  });
  const [showAll, setShowAll] = useState(false);

  const approveMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await apiRequest("PATCH", `/api/admin/quotations/${id}/approve`, { note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quotations-tracker"] });
      toast({ title: "Quotation approved" });
      setActiveId(null);
      setApprovalNote("");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      await apiRequest("PATCH", `/api/admin/quotations/${id}/reject`, { note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quotations-tracker"] });
      toast({ title: "Quotation rejected" });
      setActiveId(null);
      setApprovalNote("");
    },
  });

  if (isLoading) return <LoadingState />;

  const recentDecisions = allQuotations?.filter((q: any) =>
    q.approvalStatus === "approved" || q.approvalStatus === "rejected"
  ).slice(0, 10) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
          <ClipboardCheck className="w-4 h-4" />
          Pending Approvals ({pendingApprovals?.length || 0})
        </h2>
      </div>

      {pendingApprovals?.map((q: any) => (
        <Card key={q.id} className="border-amber-200 dark:border-amber-800" data-testid={`card-approval-${q.id}`}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold">{q.customerName}</p>
                <p className="text-[10px] text-muted-foreground">{q.quotationNumber} | {q.customerPhone}</p>
              </div>
              <Badge className="text-[10px] bg-amber-100 text-amber-700">Pending</Badge>
            </div>

            <div className="space-y-1 text-xs mb-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Machine</span><span>{q.machineCategory} - {q.profileType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold">Rs {(q.grandTotal || 0).toLocaleString("en-IN")}</span></div>
              {q.discountPercent && parseFloat(q.discountPercent) > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-green-600">{q.discountPercent}%</span></div>
              )}
            </div>

            {q.flaggedReason && (
              <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-800 mb-2">
                <p className="text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {q.flaggedReason}
                </p>
              </div>
            )}

            {activeId === q.id ? (
              <div className="space-y-2 mt-2">
                <Textarea
                  placeholder="Add a note (optional)..."
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  rows={2}
                  className="text-xs"
                  data-testid="input-approval-note"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => approveMutation.mutate({ id: q.id, note: approvalNote })}
                    disabled={approveMutation.isPending}
                    data-testid={`button-approve-${q.id}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => rejectMutation.mutate({ id: q.id, note: approvalNote })}
                    disabled={rejectMutation.isPending}
                    data-testid={`button-reject-${q.id}`}
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </div>
                <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => { setActiveId(null); setApprovalNote(""); }}>Cancel</Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="w-full mt-1 text-xs" onClick={() => setActiveId(q.id)} data-testid={`button-review-${q.id}`}>
                Review & Decide
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      {(!pendingApprovals || pendingApprovals.length === 0) && (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium">All clear!</p>
            <p className="text-[10px] text-muted-foreground">No quotations pending approval</p>
          </CardContent>
        </Card>
      )}

      {recentDecisions.length > 0 && (
        <div>
          <button onClick={() => setShowAll(!showAll)} className="text-xs text-primary font-medium mb-2" data-testid="button-toggle-history">
            {showAll ? "Hide" : "Show"} Recent Decisions ({recentDecisions.length})
          </button>
          {showAll && recentDecisions.map((q: any) => (
            <Card key={q.id} className="mb-2" data-testid={`card-decision-${q.id}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">{q.customerName}</p>
                    <p className="text-[10px] text-muted-foreground">{q.quotationNumber} | Rs {(q.grandTotal || 0).toLocaleString("en-IN")}</p>
                  </div>
                  <Badge className={`text-[10px] ${q.approvalStatus === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {q.approvalStatus}
                  </Badge>
                </div>
                {q.approvalNote && <p className="text-[10px] text-muted-foreground mt-1">Note: {q.approvalNote}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function VendorBillsTab() {
  const { toast } = useToast();
  const { data: bills, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/vendor-bills"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/admin/vendor-bills/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendor-bills"] });
      toast({ title: "Bill updated" });
    },
  });

  if (isLoading) return <LoadingState />;

  const pending = bills?.filter((b: any) => b.status === "pending") || [];
  const processed = bills?.filter((b: any) => b.status !== "pending") || [];

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
        <Receipt className="w-4 h-4" />
        Vendor Bill Uploads ({bills?.length || 0})
      </h2>

      {pending.length > 0 && (
        <div>
          <p className="text-xs font-medium text-amber-600 mb-2">Pending Review ({pending.length})</p>
          {pending.map((bill: any) => (
            <Card key={bill.id} className="mb-2 border-amber-200" data-testid={`card-vendor-bill-${bill.id}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold">{bill.fileName}</p>
                    <p className="text-xs text-muted-foreground">PO: {bill.poNumber}</p>
                    {bill.amount && <p className="text-xs text-muted-foreground">Amount: Rs {bill.amount}</p>}
                    <p className="text-[10px] text-muted-foreground">Vendor: {bill.vendorId}</p>
                  </div>
                  <div className="flex gap-1">
                    <a href={bill.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                    </a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                    onClick={() => updateMutation.mutate({ id: bill.id, data: { status: "verified", verifiedAt: new Date() } })}
                    data-testid={`button-verify-bill-${bill.id}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 text-xs"
                    onClick={() => updateMutation.mutate({ id: bill.id, data: { status: "rejected", adminNotes: "Rejected by admin" } })}
                    data-testid={`button-reject-bill-${bill.id}`}
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {processed.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Processed ({processed.length})</p>
          {processed.map((bill: any) => (
            <Card key={bill.id} className="mb-2" data-testid={`card-vendor-bill-${bill.id}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">{bill.fileName}</p>
                    <p className="text-[10px] text-muted-foreground">PO: {bill.poNumber}</p>
                  </div>
                  <Badge className={`text-[10px] ${bill.status === "verified" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {bill.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(!bills || bills.length === 0) && <EmptyState message="No vendor bills uploaded yet" />}
    </div>
  );
}

function JobApplicationsTab() {
  const { toast } = useToast();
  const { data: applications, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/job-applications"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      await apiRequest("PATCH", `/api/admin/job-applications/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-applications"] });
      toast({ title: "Application updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/job-applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-applications"] });
      toast({ title: "Application deleted" });
    },
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">
        Job Applications ({applications?.length || 0})
      </h2>
      {applications?.map((app: any) => (
        <Card key={app.id} data-testid={`card-job-app-${app.id}`}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm">{app.applicantName}</p>
                <p className="text-xs text-muted-foreground">{app.phone}</p>
              </div>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-xs mb-1">
              <span className="text-muted-foreground">Position:</span> {app.jobTitle}
            </p>
            <p className="text-xs mb-1">
              <span className="text-muted-foreground">Category:</span> {app.jobCategory}
            </p>
            <p className="text-xs mb-1">
              <span className="text-muted-foreground">Experience:</span> {app.experience}
            </p>
            {app.createdAt && (
              <p className="text-xs text-muted-foreground mb-2">
                Applied: {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              {["pending", "reviewed", "shortlisted", "rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateMutation.mutate({ id: app.id, data: { status: s } })}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                    app.status === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"
                  }`}
                  data-testid={`button-job-app-status-${s}-${app.id}`}
                >
                  {s}
                </button>
              ))}
              <button
                onClick={() => {
                  if (confirm("Delete this application?")) deleteMutation.mutate(app.id);
                }}
                className="text-[10px] px-2 py-1 rounded-full border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950 ml-auto"
                data-testid={`button-delete-job-app-${app.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
      {(!applications || applications.length === 0) && <EmptyState message="No job applications yet" />}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    contacted: "bg-cyan-100 text-cyan-700",
    qualified: "bg-blue-100 text-blue-700",
    converted: "bg-green-100 text-green-700",
    assigned: "bg-cyan-100 text-cyan-700",
    in_progress: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    approved: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    pending_approval: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    verified: "bg-green-100 text-green-700",
  };
  return (
    <Badge className={`text-[10px] ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status?.replace("_", " ")}
    </Badge>
  );
}

function ConsentsTab() {
  const { toast } = useToast();
  const { data: consentData, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/consent-stats"],
  });
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [sending, setSending] = useState(false);

  const sendNotification = async () => {
    setSending(true);
    try {
      const res = await apiRequest("POST", "/api/admin/send-notification", {
        title: notifTitle,
        body: notifBody,
      });
      const data = await res.json();
      toast({ title: data.message });
      setNotifTitle("");
      setNotifBody("");
    } catch (err: any) {
      toast({ title: "Failed to send", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const exportConsents = () => {
    window.open("/api/admin/consents/export", "_blank");
  };

  if (isLoading) return <LoadingState />;

  const stats = consentData?.stats || [];
  const recent = consentData?.recent || [];

  const categoryLabels: Record<string, string> = {
    push_notifications: "Push Notifications",
    marketing: "Marketing",
    analytics: "Analytics",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground" data-testid="text-consents-title">Consent Overview</h2>
        <Button variant="outline" size="sm" onClick={exportConsents} data-testid="button-export-consents">
          Export Records
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {stats.map((stat: any) => {
          const total = stat.accepted + stat.declined + stat.withdrawn;
          const acceptPercent = total > 0 ? Math.round((stat.accepted / total) * 100) : 0;
          return (
            <Card key={stat.category} data-testid={`consent-stat-${stat.category}`}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{categoryLabels[stat.category] || stat.category}</p>
                  <Badge className="text-[10px]">{total} total</Badge>
                </div>
                <div className="flex gap-3 text-xs mb-2">
                  <span className="text-green-600">✓ {stat.accepted} accepted</span>
                  <span className="text-red-500">✗ {stat.declined} declined</span>
                  <span className="text-amber-500">↩ {stat.withdrawn} withdrawn</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${acceptPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{acceptPercent}% opt-in rate</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send Test Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Title</Label>
            <Input
              value={notifTitle}
              onChange={e => setNotifTitle(e.target.value)}
              placeholder="Notification title"
              data-testid="input-notif-title"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Body</Label>
            <Input
              value={notifBody}
              onChange={e => setNotifBody(e.target.value)}
              placeholder="Notification body"
              data-testid="input-notif-body"
            />
          </div>
          <Button
            onClick={sendNotification}
            disabled={sending || !notifTitle || !notifBody}
            size="sm"
            className="w-full"
            data-testid="button-send-notification"
          >
            {sending ? "Sending..." : "Send to Opted-In Users"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Consent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No consent activity yet</p>
          ) : (
            <div className="space-y-2">
              {recent.slice(0, 15).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between py-1.5 border-b last:border-0 text-xs">
                  <div>
                    <span className="font-medium">{c.userId?.substring(0, 8)}...</span>
                    <span className="text-muted-foreground ml-2">{categoryLabels[c.category] || c.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-[9px] ${
                        c.status === "accepted" ? "bg-green-100 text-green-700" :
                        c.status === "declined" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {c.status}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(c.updatedAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="pt-6 pb-6 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

function AnalyticsTab() {
  const { toast } = useToast();
  const [analyticsSection, setAnalyticsSection] = useState<"overview" | "leads" | "downloads" | "investments" | "pabbly">("overview");
  const { data: analytics, isLoading } = useQuery<any>({ queryKey: ["/api/admin/lead-analytics"] });
  const { data: investments, isLoading: invLoading } = useQuery<any[]>({ queryKey: ["/api/admin/investments"] });
  const { data: downloads } = useQuery<any>({ queryKey: ["/api/admin/app-downloads"] });

  const [showInvForm, setShowInvForm] = useState(false);
  const [newInv, setNewInv] = useState({ platform: "Google Ads", amount: "", date: new Date().toISOString().split("T")[0], campaignName: "", notes: "" });
  const [editDownloads, setEditDownloads] = useState(false);
  const [dlIos, setDlIos] = useState("");
  const [dlAndroid, setDlAndroid] = useState("");

  const createInvMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/investments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lead-analytics"] });
      toast({ title: "Investment added" });
      setShowInvForm(false);
      setNewInv({ platform: "Google Ads", amount: "", date: new Date().toISOString().split("T")[0], campaignName: "", notes: "" });
    },
    onError: () => toast({ title: "Failed to add", variant: "destructive" }),
  });

  const deleteInvMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/investments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lead-analytics"] });
      toast({ title: "Investment deleted" });
    },
  });

  const updateDownloadsMutation = useMutation({
    mutationFn: async (data: { ios: number; android: number }) => {
      await apiRequest("POST", "/api/admin/app-downloads", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/app-downloads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lead-analytics"] });
      toast({ title: "Download counts updated" });
      setEditDownloads(false);
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      await apiRequest("PATCH", `/api/admin/leads/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/lead-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Lead updated" });
    },
  });

  if (isLoading) return <LoadingState />;
  if (!analytics) return <EmptyState message="No analytics data" />;

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "leads", label: "Leads" },
    { id: "downloads", label: "Downloads" },
    { id: "investments", label: "Investments" },
    { id: "pabbly", label: "Pabbly Setup" },
  ];

  const sourceData = analytics.sourceBreakdown ? Object.entries(analytics.sourceBreakdown).map(([name, value]) => ({ name: name.replace(/_/g, " "), value })) : [];

  const dailyData = analytics.dailyLeads
    ? Object.entries(analytics.dailyLeads)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, count]) => ({ date: date.slice(5), leads: count }))
    : [];

  const dlData = analytics.downloads || downloads || { ios: 0, android: 0 };
  const downloadPieData = [
    { name: "iOS", value: dlData.ios || 0 },
    { name: "Android", value: dlData.android || 0 },
  ];

  const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setAnalyticsSection(s.id as any)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
              analyticsSection === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
            data-testid={`analytics-tab-${s.id}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {analyticsSection === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400" data-testid="text-total-leads">{analytics.totalLeads}</p>
              <p className="text-[10px] text-muted-foreground">Total Leads</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{analytics.convertedLeads}</p>
              <p className="text-[10px] text-muted-foreground">Converted</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{analytics.conversionRate}%</p>
              <p className="text-[10px] text-muted-foreground">Conversion Rate</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{analytics.leadsThisWeek}</p>
              <p className="text-[10px] text-muted-foreground">Last 7 Days</p>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Lead Counts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center py-1.5 border-b">
                <span className="text-xs">Today</span>
                <Badge variant="secondary" className="text-[10px]">{analytics.leadsToday}</Badge>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b">
                <span className="text-xs">This Week</span>
                <Badge variant="secondary" className="text-[10px]">{analytics.leadsThisWeek}</Badge>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs">This Month</span>
                <Badge variant="secondary" className="text-[10px]">{analytics.leadsThisMonth}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">App Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-3">
                  <p className="text-xl font-bold">{(dlData.ios || 0) + (dlData.android || 0)}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3">
                  <p className="text-xl font-bold text-gray-700 dark:text-gray-400">{dlData.ios || 0}</p>
                  <p className="text-[10px] text-muted-foreground">iPhone</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">{dlData.android || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Android</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">Rs {((analytics.totalInvestment || 0) / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-muted-foreground">Across all platforms</p>
              {analytics.totalLeads > 0 && analytics.totalInvestment > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Cost per lead: Rs {Math.round(analytics.totalInvestment / analytics.totalLeads)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Lead Source Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {sourceData.length > 0 ? (
                <div className="space-y-1.5">
                  {sourceData.map(({ name, value }: any, i: number) => {
                    const pct = analytics.totalLeads > 0 ? Math.round((value / analytics.totalLeads) * 100) : 0;
                    return (
                      <div key={name}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs capitalize">{name}</span>
                          <span className="text-xs font-medium">{value} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No source data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Leads Over Time (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyData.length > 0 ? (
                <div className="flex items-end gap-1 h-32">
                  {dailyData.map((d: any, i: number) => {
                    const maxVal = Math.max(...dailyData.map((dd: any) => dd.leads), 1);
                    const heightPct = (d.leads / maxVal) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <span className="text-[8px] text-muted-foreground">{d.leads}</span>
                        <div className="w-full bg-primary/80 rounded-t-sm" style={{ height: `${Math.max(heightPct, 4)}%` }} />
                        <span className="text-[7px] text-muted-foreground rotate-[-45deg] origin-center">{d.date}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No data yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {analyticsSection === "leads" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Recent Leads ({analytics.recentLeads?.length || 0})</h2>
          {analytics.recentLeads?.map((lead: any) => (
            <Card key={lead.id} data-testid={`analytics-lead-${lead.id}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <p className="font-semibold text-sm">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    {lead.email && <p className="text-[10px] text-muted-foreground">{lead.email}</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {lead.source && <Badge variant="outline" className="text-[10px] capitalize">{lead.source.replace(/_/g, " ")}</Badge>}
                    <StatusBadge status={lead.status || "new"} />
                  </div>
                </div>
                {lead.location && <p className="text-[10px] text-muted-foreground mb-0.5">Location: {lead.location}</p>}
                {lead.interest && <p className="text-[10px] text-muted-foreground mb-0.5">Interest: {lead.interest}</p>}
                {lead.message && <p className="text-[10px] text-muted-foreground mb-1 line-clamp-2">{lead.message}</p>}
                <p className="text-[9px] text-muted-foreground mb-1.5">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                </p>
                <div className="flex gap-1.5">
                  {["new", "contacted", "converted", "lost"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateLeadMutation.mutate({ id: lead.id, data: { status: s } })}
                      className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                        (lead.status || "new") === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"
                      }`}
                      data-testid={`analytics-lead-status-${s}-${lead.id}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {(!analytics.recentLeads || analytics.recentLeads.length === 0) && <EmptyState message="No leads yet" />}
        </div>
      )}

      {analyticsSection === "downloads" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">App Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-4">
                  <p className="text-3xl font-bold">{(dlData.ios || 0) + (dlData.android || 0)}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                  <p className="text-3xl font-bold text-gray-700 dark:text-gray-400">{dlData.ios || 0}</p>
                  <p className="text-xs text-muted-foreground">iPhone (iOS)</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">{dlData.android || 0}</p>
                  <p className="text-xs text-muted-foreground">Android</p>
                </div>
              </div>

              {(dlData.ios > 0 || dlData.android > 0) && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden flex">
                    {dlData.ios > 0 && (
                      <div
                        className="h-full bg-gray-500"
                        style={{ width: `${(dlData.ios / ((dlData.ios || 0) + (dlData.android || 0))) * 100}%` }}
                      />
                    )}
                    {dlData.android > 0 && (
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(dlData.android / ((dlData.ios || 0) + (dlData.android || 0))) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              )}

              {editDownloads ? (
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px]">iOS Downloads</Label>
                      <Input value={dlIos} onChange={e => setDlIos(e.target.value)} className="h-7 text-xs" type="number" data-testid="input-dl-ios" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Android Downloads</Label>
                      <Input value={dlAndroid} onChange={e => setDlAndroid(e.target.value)} className="h-7 text-xs" type="number" data-testid="input-dl-android" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 text-xs" onClick={() => updateDownloadsMutation.mutate({ ios: Number(dlIos) || 0, android: Number(dlAndroid) || 0 })} disabled={updateDownloadsMutation.isPending} data-testid="button-save-downloads">
                      <Save className="w-3 h-3 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => setEditDownloads(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setDlIos(String(dlData.ios || 0)); setDlAndroid(String(dlData.android || 0)); setEditDownloads(true); }} data-testid="button-edit-downloads">
                  <Edit className="w-3 h-3 mr-1" /> Manually Update Counts
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">Auto-Track Download Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-[10px] text-muted-foreground">Add these URLs to your app download links to auto-count downloads:</p>
              <div className="bg-muted p-2 rounded text-[10px] font-mono break-all">
                iOS: /api/track/download?platform=ios
              </div>
              <div className="bg-muted p-2 rounded text-[10px] font-mono break-all">
                Android: /api/track/download?platform=android
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analyticsSection === "investments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Ad Spend / Investment</h2>
            <Button size="sm" onClick={() => setShowInvForm(!showInvForm)} data-testid="button-add-investment">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          {showInvForm && (
            <Card className="border-primary/30">
              <CardContent className="pt-4 space-y-2">
                <div>
                  <Label className="text-[10px]">Platform *</Label>
                  <select value={newInv.platform} onChange={e => setNewInv(p => ({ ...p, platform: e.target.value }))} className="w-full h-7 rounded-md border border-input bg-background px-2 text-[10px]" data-testid="select-inv-platform">
                    <option value="Google Ads">Google Ads</option>
                    <option value="Meta/Facebook">Meta / Facebook</option>
                    <option value="IndiaMART">IndiaMART Subscription</option>
                    <option value="TradeIndia">TradeIndia</option>
                    <option value="JustDial">JustDial</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px]">Amount (Rs) *</Label>
                    <Input value={newInv.amount} onChange={e => setNewInv(p => ({ ...p, amount: e.target.value }))} className="h-7 text-xs" type="number" placeholder="5000" data-testid="input-inv-amount" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Date</Label>
                    <Input value={newInv.date} onChange={e => setNewInv(p => ({ ...p, date: e.target.value }))} className="h-7 text-xs" type="date" data-testid="input-inv-date" />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px]">Campaign Name</Label>
                  <Input value={newInv.campaignName} onChange={e => setNewInv(p => ({ ...p, campaignName: e.target.value }))} className="h-7 text-xs" placeholder="e.g. Shutter Machine Lead Gen" data-testid="input-inv-campaign" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 text-xs" onClick={() => { if (!newInv.amount) { toast({ title: "Amount required", variant: "destructive" }); return; } createInvMutation.mutate({ ...newInv, amount: Number(newInv.amount) }); }} disabled={createInvMutation.isPending} data-testid="button-save-investment">
                    <Save className="w-3 h-3 mr-1" /> {createInvMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowInvForm(false)}><X className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Investment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary mb-2">Rs {((analytics.totalInvestment || 0) / 1000).toFixed(1)}K</p>
              {analytics.investmentByPlatform && Object.entries(analytics.investmentByPlatform).map(([platform, amount]: [string, any]) => {
                const pct = analytics.totalInvestment > 0 ? Math.round((amount / analytics.totalInvestment) * 100) : 0;
                const leadsFromSource = analytics.sourceBreakdown?.[platform.toLowerCase().replace(/[\s/]/g, "")] || 0;
                const roi = leadsFromSource > 0 && amount > 0 ? `Rs ${Math.round(amount / leadsFromSource)}/lead` : "N/A";
                return (
                  <div key={platform} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <div>
                      <span className="text-xs font-medium">{platform}</span>
                      <p className="text-[10px] text-muted-foreground">ROI: {roi}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold">Rs {Number(amount).toLocaleString()}</span>
                      <p className="text-[10px] text-muted-foreground">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {investments && investments.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">All Entries ({investments.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {investments.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-xs font-medium">{inv.platform}</p>
                      <p className="text-[10px] text-muted-foreground">{inv.campaignName || "No campaign"} | {inv.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">Rs {Number(inv.amount).toLocaleString()}</span>
                      <button onClick={() => { if (confirm("Delete?")) deleteInvMutation.mutate(inv.id); }} className="p-1 hover:bg-destructive/10 rounded text-destructive" data-testid={`button-delete-inv-${inv.id}`}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {analyticsSection === "pabbly" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                How to Connect Pabbly
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Pabbly Connect can automatically send leads from IndiaMART, TradeIndia, WhatsApp, website forms, etc. to your dashboard. Follow these steps:
              </p>
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <Badge className="text-[10px] shrink-0">1</Badge>
                  <p className="text-xs">Go to <span className="font-medium">Pabbly Connect</span> and create a new workflow</p>
                </div>
                <div className="flex gap-2 items-start">
                  <Badge className="text-[10px] shrink-0">2</Badge>
                  <p className="text-xs">Set <span className="font-medium">Trigger</span> as your lead source (IndiaMART, TradeIndia, WhatsApp, etc.)</p>
                </div>
                <div className="flex gap-2 items-start">
                  <Badge className="text-[10px] shrink-0">3</Badge>
                  <p className="text-xs">Add an <span className="font-medium">Action</span> step: choose <span className="font-medium">Webhook / API</span></p>
                </div>
                <div className="flex gap-2 items-start">
                  <Badge className="text-[10px] shrink-0">4</Badge>
                  <p className="text-xs">Set method to <span className="font-medium">POST</span> and paste this webhook URL:</p>
                </div>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-[10px] font-bold text-muted-foreground mb-1">Webhook URL:</p>
                <p className="text-xs font-mono break-all select-all">{typeof window !== "undefined" ? window.location.origin : ""}/api/leads/pabbly-webhook</p>
              </div>
              <div className="flex gap-2 items-start">
                <Badge className="text-[10px] shrink-0">5</Badge>
                <p className="text-xs">Map these fields in the JSON body:</p>
              </div>
              <div className="bg-muted p-3 rounded-lg text-[10px] font-mono space-y-0.5">
                <p>{"{"}</p>
                <p className="pl-4">"name": "Lead ka naam",</p>
                <p className="pl-4">"phone": "Phone number",</p>
                <p className="pl-4">"source": "indiamart | tradeindia | whatsapp | website | direct",</p>
                <p className="pl-4">"email": "Email (optional)",</p>
                <p className="pl-4">"message": "Inquiry message (optional)",</p>
                <p className="pl-4">"location": "City/State (optional)",</p>
                <p className="pl-4">"interest": "Machine type (optional)"</p>
                <p>{"}"}</p>
              </div>
              <Card className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
                <CardContent className="pt-3 pb-3">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                    Security: Set PABBLY_WEBHOOK_SECRET env variable on your server, then add a header in Pabbly:
                  </p>
                  <p className="text-[10px] font-mono bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded">
                    x-webhook-secret: your-secret-value
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                <CardContent className="pt-3 pb-3">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                    Once connected, all leads will auto-appear in your Lead Analytics dashboard!
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function DealersTab() {
  const { toast } = useToast();
  const { data: dealerList, isLoading } = useQuery<any[]>({ queryKey: ["/api/dealers"] });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", phone: "", alternatePhone: "", email: "", location: "", state: "",
    city: "", pincode: "", gstNo: "", companyName: "", address: "", notes: ""
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/dealers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealers"] });
      toast({ title: "Dealer added successfully" });
      resetForm();
    },
    onError: () => toast({ title: "Failed to add dealer", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PATCH", `/api/admin/dealers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealers"] });
      toast({ title: "Dealer updated" });
      resetForm();
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/dealers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealers"] });
      toast({ title: "Dealer removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const freezeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/admin/dealers/${id}/freeze`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealers"] });
      toast({ title: "Dealer status updated" });
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  });

  const gstVerifyMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/admin/dealers/${id}/verify-gst`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealers"] });
      toast({ title: "GST verification updated" });
    },
    onError: () => toast({ title: "GST verification failed", variant: "destructive" }),
  });

  const resetForm = () => {
    setForm({ name: "", phone: "", alternatePhone: "", email: "", location: "", state: "", city: "", pincode: "", gstNo: "", companyName: "", address: "", notes: "" });
    setShowForm(false);
    setEditId(null);
  };

  const handleEdit = (d: any) => {
    setForm({
      name: d.name || "", phone: d.phone || "", alternatePhone: d.alternatePhone || "",
      email: d.email || "", location: d.location || "", state: d.state || "",
      city: d.city || "", pincode: d.pincode || "", gstNo: d.gstNo || "",
      companyName: d.companyName || "", address: d.address || "", notes: d.notes || ""
    });
    setEditId(d.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.location || !form.state) {
      toast({ title: "Name, Phone, Location, State required", variant: "destructive" });
      return;
    }
    if (editId) {
      updateMutation.mutate({ id: editId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading dealers...</div>;

  const activeCount = dealerList?.filter((d: any) => d.isActive && !d.isFrozen).length || 0;
  const frozenCount = dealerList?.filter((d: any) => d.isFrozen).length || 0;
  const gstVerifiedCount = dealerList?.filter((d: any) => d.isGstVerified).length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" data-testid="text-dealers-title">Dealers ({dealerList?.length || 0})</h2>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} data-testid="button-add-dealer">
          <Plus className="w-4 h-4 mr-1" /> Add Dealer
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card><CardContent className="pt-3 pb-3 text-center">
          <p className="text-lg font-bold text-green-600" data-testid="text-active-dealers">{activeCount}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card><CardContent className="pt-3 pb-3 text-center">
          <p className="text-lg font-bold text-blue-600" data-testid="text-frozen-dealers">{frozenCount}</p>
          <p className="text-xs text-muted-foreground">Frozen</p>
        </CardContent></Card>
        <Card><CardContent className="pt-3 pb-3 text-center">
          <p className="text-lg font-bold text-emerald-600" data-testid="text-gst-verified">{gstVerifiedCount}</p>
          <p className="text-xs text-muted-foreground">GST Verified</p>
        </CardContent></Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{editId ? "Edit Dealer" : "Add New Dealer"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name *</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Dealer name" data-testid="input-dealer-name" />
              </div>
              <div>
                <Label className="text-xs">Company</Label>
                <Input value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} placeholder="Company name" data-testid="input-dealer-company" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Phone *</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" data-testid="input-dealer-phone" />
              </div>
              <div>
                <Label className="text-xs">Alternate Phone</Label>
                <Input value={form.alternatePhone} onChange={e => setForm({...form, alternatePhone: e.target.value})} placeholder="Alt. number" data-testid="input-dealer-alt-phone" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="dealer@email.com" data-testid="input-dealer-email" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">GST No.</Label>
                <Input value={form.gstNo} onChange={e => setForm({...form, gstNo: e.target.value.toUpperCase()})} placeholder="22XXXXX1234X1Z5" maxLength={15} data-testid="input-dealer-gst" />
              </div>
              <div>
                <Label className="text-xs">Pincode</Label>
                <Input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} placeholder="110041" maxLength={6} data-testid="input-dealer-pincode" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Location *</Label>
                <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Mundka, Delhi" data-testid="input-dealer-location" />
              </div>
              <div>
                <Label className="text-xs">City</Label>
                <Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="City" data-testid="input-dealer-city" />
              </div>
            </div>
            <div>
              <Label className="text-xs">State *</Label>
              <Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} placeholder="Uttar Pradesh" data-testid="input-dealer-state" />
            </div>
            <div>
              <Label className="text-xs">Full Address</Label>
              <Textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full address with landmark" rows={2} data-testid="input-dealer-address" />
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Admin notes (private)" rows={2} data-testid="input-dealer-notes" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="flex-1" data-testid="button-save-dealer">
                <Save className="w-4 h-4 mr-1" /> {editId ? "Update" : "Save"}
              </Button>
              <Button variant="outline" onClick={resetForm} data-testid="button-cancel-dealer">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {dealerList?.map((d: any) => (
          <Card key={d.id} className={`${d.isFrozen ? "opacity-60 border-blue-300" : ""}`} data-testid={`card-dealer-${d.id}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm" data-testid={`text-dealer-name-${d.id}`}>{d.name}</p>
                    {d.isFrozen && <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700"><Snowflake className="w-3 h-3 mr-1" />Frozen</Badge>}
                    {d.isGstVerified && <Badge variant="secondary" className="text-xs bg-green-100 text-green-700"><ShieldCheck className="w-3 h-3 mr-1" />GST Verified</Badge>}
                    {!d.isGstVerified && d.gstNo && <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">GST Unverified</Badge>}
                  </div>
                  {d.companyName && <p className="text-xs text-muted-foreground">{d.companyName}</p>}
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span data-testid={`text-dealer-phone-${d.id}`}>{d.phone}</span>
                  {d.alternatePhone && <span className="text-muted-foreground">| {d.alternatePhone}</span>}
                </div>
                {d.email && <div className="flex items-center gap-2"><span>@</span><span>{d.email}</span></div>}
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>{d.location}, {d.state} {d.pincode ? `- ${d.pincode}` : ""}</span>
                </div>
                {d.gstNo && <div className="flex items-center gap-2"><Building2 className="w-3 h-3" /><span className="font-mono" data-testid={`text-dealer-gst-${d.id}`}>{d.gstNo}</span></div>}
              </div>

              {d.notes && <p className="text-xs bg-muted/50 rounded p-2 mb-3 italic">{d.notes}</p>}

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(d)} className="text-xs h-7" data-testid={`button-edit-dealer-${d.id}`}>
                  <Edit className="w-3 h-3 mr-1" /> Edit
                </Button>
                {d.gstNo && (
                  <Button size="sm" variant="outline" onClick={() => gstVerifyMutation.mutate(d.id)}
                    className={`text-xs h-7 ${d.isGstVerified ? "border-green-300 text-green-700" : "border-yellow-300 text-yellow-700"}`}
                    disabled={gstVerifyMutation.isPending} data-testid={`button-verify-gst-${d.id}`}>
                    <ShieldCheck className="w-3 h-3 mr-1" /> {d.isGstVerified ? "GST Verified ✓" : "Verify GST"}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => freezeMutation.mutate(d.id)}
                  className={`text-xs h-7 ${d.isFrozen ? "border-blue-300 text-blue-700" : ""}`}
                  disabled={freezeMutation.isPending} data-testid={`button-freeze-dealer-${d.id}`}>
                  <Snowflake className="w-3 h-3 mr-1" /> {d.isFrozen ? "Unfreeze" : "Freeze"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => {
                  if (confirm("Remove this dealer permanently?")) deleteMutation.mutate(d.id);
                }} className="text-xs h-7" disabled={deleteMutation.isPending} data-testid={`button-delete-dealer-${d.id}`}>
                  <Trash2 className="w-3 h-3 mr-1" /> Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!dealerList || dealerList.length === 0) && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No dealers added yet</p>
              <p className="text-xs mt-1">Click "Add Dealer" to add your first dealer</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function BannersTab() {
  const { toast } = useToast();
  const { data: bannerList, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/banners"] });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", buttonText: "", buttonLink: "", bgColor: "from-indigo-600 to-purple-600" });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/banners", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({ title: "Banner Created" });
      setShowForm(false);
      setForm({ title: "", subtitle: "", buttonText: "", buttonLink: "", bgColor: "from-indigo-600 to-purple-600" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiRequest("PATCH", `/api/admin/banners/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/banners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/banners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/banners"] });
      toast({ title: "Banner Deleted" });
    },
  });

  if (isLoading) return <LoadingState />;

  const colorOptions = [
    { label: "Blue-Cyan", value: "from-blue-600 to-cyan-600" },
    { label: "Green-Teal", value: "from-emerald-600 to-teal-600" },
    { label: "Indigo-Purple", value: "from-indigo-600 to-purple-600" },
    { label: "Orange-Red", value: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold">Home Page Banners</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)} data-testid="button-add-banner">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Banner
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div>
              <Label className="text-xs">Title *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Banner title" data-testid="input-banner-title" />
            </div>
            <div>
              <Label className="text-xs">Subtitle</Label>
              <Input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="Banner subtitle" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Button Text</Label>
                <Input value={form.buttonText} onChange={e => setForm({ ...form, buttonText: e.target.value })} placeholder="Get Quote" />
              </div>
              <div>
                <Label className="text-xs">Button Link</Label>
                <Input value={form.buttonLink} onChange={e => setForm({ ...form, buttonLink: e.target.value })} placeholder="/quotation" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Color Theme</Label>
              <Select value={form.bgColor} onValueChange={v => setForm({ ...form, bgColor: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {colorOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className={`bg-gradient-to-r ${form.bgColor} rounded-lg p-3 text-white`}>
              <p className="text-xs font-bold">{form.title || "Preview"}</p>
              {form.subtitle && <p className="text-[10px] text-white/80">{form.subtitle}</p>}
            </div>
            <Button size="sm" onClick={() => createMutation.mutate(form)} disabled={!form.title || createMutation.isPending} data-testid="button-save-banner">
              {createMutation.isPending ? "Saving..." : "Save Banner"}
            </Button>
          </CardContent>
        </Card>
      )}

      {bannerList?.map((b: any) => (
        <Card key={b.id}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <p className="text-sm font-semibold">{b.title}</p>
                {b.subtitle && <p className="text-[10px] text-muted-foreground">{b.subtitle}</p>}
              </div>
              <div className="flex items-center gap-1.5">
                <Badge className={b.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} data-testid={`badge-banner-status-${b.id}`}>
                  {b.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => toggleMutation.mutate({ id: b.id, isActive: !b.isActive })}>
                {b.isActive ? "Hide" : "Show"}
              </Button>
              <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => deleteMutation.mutate(b.id)}>
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {(!bannerList || bannerList.length === 0) && <EmptyState message="No banners yet" />}
    </div>
  );
}

function ModerationTab() {
  const { toast } = useToast();
  const { data: reportedPosts, isLoading: loadingPosts } = useQuery<any[]>({
    queryKey: ["/api/admin/moderation/reported-posts"],
  });
  const { data: warnedUsers, isLoading: loadingWarned } = useQuery<any[]>({
    queryKey: ["/api/admin/moderation/warned-users"],
  });
  const { data: frozenUsers, isLoading: loadingFrozen } = useQuery<any[]>({
    queryKey: ["/api/admin/moderation/frozen-users"],
  });

  const unfreezeMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/admin/moderation/unfreeze/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation/frozen-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation/warned-users"] });
      toast({ title: "User unfrozen successfully" });
    },
    onError: () => toast({ title: "Failed to unfreeze user", variant: "destructive" }),
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      await apiRequest("DELETE", `/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/moderation/reported-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post deleted" });
    },
    onError: () => toast({ title: "Failed to delete post", variant: "destructive" }),
  });

  if (loadingPosts || loadingWarned || loadingFrozen) return <LoadingState />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Reported Posts ({reportedPosts?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reportedPosts && reportedPosts.length > 0 ? reportedPosts.map((post: any) => (
            <div key={post.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold">{post.author}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{post.caption}</p>
                </div>
                <Badge variant="destructive" className="text-[10px]">
                  {post.reportCount} reports
                </Badge>
              </div>
              {post.youtubeUrl && (
                <p className="text-[10px] text-blue-500 truncate mb-1">YT: {post.youtubeUrl}</p>
              )}
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="destructive" className="text-[10px] h-7"
                  onClick={() => deletePostMutation.mutate(post.id)}
                  disabled={deletePostMutation.isPending}
                  data-testid={`button-delete-reported-${post.id}`}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Delete Post
                </Button>
              </div>
            </div>
          )) : <EmptyState message="No reported posts" />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            Users with Warnings ({warnedUsers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {warnedUsers && warnedUsers.length > 0 ? warnedUsers.map((u: any) => (
            <div key={u.id} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{u.name}</p>
                <p className="text-xs text-muted-foreground">@{u.username}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {u.warningCount} warnings
                </Badge>
                {u.isFrozen && (
                  <Badge variant="destructive" className="text-[10px]">Frozen</Badge>
                )}
              </div>
            </div>
          )) : <EmptyState message="No warned users" />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-blue-500" />
            Frozen Accounts ({frozenUsers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {frozenUsers && frozenUsers.length > 0 ? frozenUsers.map((u: any) => (
            <div key={u.id} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{u.name}</p>
                <p className="text-xs text-muted-foreground">@{u.username} - {u.warningCount} warnings</p>
              </div>
              <Button size="sm" variant="outline" className="text-[10px] h-7"
                onClick={() => unfreezeMutation.mutate(u.id)}
                disabled={unfreezeMutation.isPending}
                data-testid={`button-unfreeze-${u.id}`}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" /> Unfreeze
              </Button>
            </div>
          )) : <EmptyState message="No frozen accounts" />}
        </CardContent>
      </Card>
    </div>
  );
}

function MarketTab() {
  const { toast } = useToast();
  const { data: history, isLoading } = useQuery<any[]>({ queryKey: ["/api/market-prices/history"] });
  const [form, setForm] = useState({
    material: "gp_coil",
    price: "",
    previousPrice: "",
    trend: "stable",
    prediction: "",
    upChance: "",
    downChance: "",
    updateSlot: "morning",
    region: "Delhi-Mundka",
    date: new Date().toISOString().split("T")[0],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/market-prices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market-prices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/market-prices/history"] });
      toast({ title: "Rate Updated" });
      setForm({ ...form, price: "", previousPrice: "", prediction: "", upChance: "", downChance: "" });
    },
  });

  if (isLoading) return <LoadingState />;

  const materialLabels: Record<string, string> = { gp_coil: "GP Coil", cr_coil: "CR Coil", steel: "Steel" };
  const trendLabels: Record<string, string> = { up: "Badhega (Up)", down: "Girega (Down)", stable: "Same Rahega" };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Daily Rate Update (Delhi-Mundka)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Material</Label>
            <Select value={form.material} onValueChange={v => setForm({ ...form, material: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gp_coil">GP Coil</SelectItem>
                <SelectItem value="cr_coil">CR Coil</SelectItem>
                <SelectItem value="steel">Steel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Aaj Ka Rate (₹/kg)</Label>
              <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="58.50" data-testid="input-market-price" />
            </div>
            <div>
              <Label className="text-xs">Kal Ka Rate (₹/kg)</Label>
              <Input type="number" value={form.previousPrice} onChange={e => setForm({ ...form, previousPrice: e.target.value })} placeholder="57.80" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Trend</Label>
              <Select value={form.trend} onValueChange={v => setForm({ ...form, trend: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="up">Badhega (Up)</SelectItem>
                  <SelectItem value="down">Girega (Down)</SelectItem>
                  <SelectItem value="stable">Same Rahega</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Badhne ke Chance (%)</Label>
              <Input type="number" min="0" max="100" value={form.upChance} onChange={e => setForm({ ...form, upChance: e.target.value })} placeholder="60" data-testid="input-up-chance" />
            </div>
            <div>
              <Label className="text-xs">Girne ke Chance (%)</Label>
              <Input type="number" min="0" max="100" value={form.downChance} onChange={e => setForm({ ...form, downChance: e.target.value })} placeholder="20" data-testid="input-down-chance" />
            </div>
            <div>
              <Label className="text-xs">Update Slot</Label>
              <Select value={form.updateSlot} onValueChange={v => setForm({ ...form, updateSlot: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9 AM)</SelectItem>
                  <SelectItem value="evening">Evening (6 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Extra Comment (Optional)</Label>
            <Input value={form.prediction} onChange={e => setForm({ ...form, prediction: e.target.value })} placeholder="Koi extra note..." data-testid="input-prediction" />
          </div>
          <Button size="sm" onClick={() => {
            const payload: any = { ...form };
            if (form.upChance) payload.upChance = parseInt(form.upChance);
            if (form.downChance) payload.downChance = parseInt(form.downChance);
            createMutation.mutate(payload);
          }} disabled={!form.price || createMutation.isPending} data-testid="button-update-rate">
            {createMutation.isPending ? "Updating..." : "Update Rate"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Rate History</CardTitle>
        </CardHeader>
        <CardContent>
          {history?.slice(0, 20).map((h: any, i: number) => (
            <div key={h.id || i} className="flex items-center justify-between py-2 border-b last:border-0 gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] shrink-0">{materialLabels[h.material] || h.material}</Badge>
                  <span className="text-xs text-muted-foreground">{h.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-sm font-bold">₹{Number(h.price).toFixed(1)}</span>
                {h.trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                {h.trend === "down" && <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
              </div>
            </div>
          ))}
          {(!history || history.length === 0) && <p className="text-xs text-muted-foreground text-center py-4">No rate history</p>}
        </CardContent>
      </Card>
    </div>
  );
}

type ChatMessage = { role: "user" | "assistant"; content: string };

function AIAssistantTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [otpUnlocked, setOtpUnlocked] = useState(false);
  const [otpStep, setOtpStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendOtp = async () => {
    if (!email || !email.includes("@")) {
      setOtpError("Valid email daalo");
      return;
    }
    setIsSendingOtp(true);
    setOtpError("");
    try {
      const res = await apiRequest("POST", "/api/admin/assistant/send-otp", { email });
      const data = await res.json();
      if (data.success) {
        setOtpStep("code");
        toast({ title: data.message || "OTP bhej diya gaya" });
        if (data.devCode) {
          setOtpCode(data.devCode);
        }
      }
    } catch (err: any) {
      setOtpError(err.message || "OTP bhejne mein error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      setOtpError("6-digit OTP daalo");
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError("");
    try {
      const res = await apiRequest("POST", "/api/admin/assistant/verify-otp", { email, code: otpCode });
      const data = await res.json();
      if (data.success) {
        setOtpUnlocked(true);
        setOtpCode("");
        setMessages([{ role: "assistant", content: "Namaste! Main aapka AI Assistant hoon. Kya help chahiye?\n\nMujhse poochh sakte ho:\n- Leads ka summary\n- Aaj ke follow-ups\n- Internet se koi bhi jaankari\n- Koi bhi lead search karo\n- Product list dekhna\n- Reminder set karna" }]);
      }
    } catch (err: any) {
      setOtpError(err.message || "Galat OTP");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSendMessage = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isSending) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsSending(true);
    try {
      const res = await apiRequest("POST", "/api/admin/assistant/chat", {
        messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
      });
      const data = await res.json();
      setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages([...updatedMessages, { role: "assistant", content: "Error aa gaya. Dobara try karo." }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleLock = () => {
    setOtpUnlocked(false);
    setMessages([]);
    setEmail("");
    setOtpCode("");
    setOtpStep("email");
  };

  if (!otpUnlocked) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0077FF] to-[#00D4FF] flex items-center justify-center mx-auto shadow-lg">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Personal Assistant</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {otpStep === "email" ? "Email verify karo AI Assistant unlock karne ke liye" : `OTP code ${email} par bheja gaya`}
              </p>
            </div>
            <div className="max-w-[280px] mx-auto space-y-3">
              {otpStep === "email" ? (
                <>
                  <div>
                    <Label className="text-xs">Email Address</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setOtpError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                      placeholder={user?.email || "admin@example.com"}
                      className="text-center h-11"
                      autoFocus
                      data-testid="input-otp-email"
                    />
                  </div>
                  {otpError && <p className="text-xs text-destructive">{otpError}</p>}
                  <Button onClick={handleSendOtp} className="w-full" disabled={isSendingOtp || !email.includes("@")} data-testid="button-send-otp">
                    {isSendingOtp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    {isSendingOtp ? "Sending..." : "Send OTP"}
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-xs">OTP Code</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => { setOtpCode(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
                      placeholder="6-digit code"
                      className="text-center text-2xl tracking-[0.5em] h-12"
                      autoFocus
                      data-testid="input-otp-code"
                    />
                  </div>
                  {otpError && <p className="text-xs text-destructive">{otpError}</p>}
                  <Button onClick={handleVerifyOtp} className="w-full" disabled={isVerifyingOtp || otpCode.length < 6} data-testid="button-verify-otp">
                    {isVerifyingOtp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                    {isVerifyingOtp ? "Verifying..." : "Verify & Unlock"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setOtpStep("email"); setOtpError(""); setOtpCode(""); }} className="w-full text-xs text-muted-foreground">
                    Change Email
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0077FF] to-[#00D4FF] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold">AI Assistant</h3>
            <p className="text-[10px] text-muted-foreground">Sai Rolotech Personal Helper</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLock} className="h-7 px-2 text-destructive" data-testid="button-lock">
          <Lock className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto bg-muted/30 rounded-lg p-3 space-y-3 mb-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card border rounded-bl-md"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-card border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Kuch bhi poochho..."
          className="flex-1 h-10"
          disabled={isSending}
          autoFocus
          data-testid="input-chat"
        />
        <Button type="submit" size="sm" className="h-10 px-3" disabled={isSending || !input.trim()} data-testid="button-send">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

function SecurityTab() {
  const { toast } = useToast();
  const [eventFilter, setEventFilter] = useState("");
  const [securityView, setSecurityView] = useState<"overview" | "audit" | "sessions" | "locked">("overview");

  const { data: summary, isLoading: summaryLoading } = useQuery<any>({
    queryKey: ["/api/admin/security/summary"],
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: 30000,
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/security/audit-logs", eventFilter],
    queryFn: async () => {
      const url = eventFilter
        ? `/api/admin/security/audit-logs?eventType=${eventFilter}&limit=100`
        : `/api/admin/security/audit-logs?limit=100`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load audit logs");
      return res.json();
    },
  });

  const { data: activeSessions, isLoading: sessionsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/security/active-sessions"],
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: 30000,
  });

  const { data: lockedAccounts, isLoading: lockedLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/security/locked-accounts"],
    queryFn: getQueryFn({ on401: "throw" }),
    refetchInterval: 30000,
  });

  const revokeSessionMut = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/security/sessions/${sessionId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Session revoked" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/security/active-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/security/summary"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const unlockAccountMut = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/admin/security/unlock-account/${userId}`);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({ title: `Account unlocked: ${data.username}` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/security/locked-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/security/summary"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const eventTypeLabels: Record<string, string> = {
    login_success: "Login Success",
    login_failed: "Login Failed",
    logout: "Logout",
    account_locked: "Account Locked",
    account_unlocked: "Account Unlocked",
    otp_sent: "OTP Sent",
    otp_verified: "OTP Verified",
    otp_failed: "OTP Failed",
    suspicious_login: "Suspicious Login",
    session_revoked: "Session Revoked",
    user_registered: "User Registered",
    "2fa_toggled": "2FA Toggled",
    user_approval_changed: "User Approval Changed",
  };

  const eventTypeColors: Record<string, string> = {
    login_success: "bg-green-100 text-green-800",
    login_failed: "bg-red-100 text-red-800",
    logout: "bg-gray-100 text-gray-800",
    account_locked: "bg-red-200 text-red-900",
    account_unlocked: "bg-green-200 text-green-900",
    suspicious_login: "bg-orange-100 text-orange-800",
    otp_sent: "bg-blue-100 text-blue-800",
    otp_verified: "bg-green-100 text-green-800",
    otp_failed: "bg-red-100 text-red-800",
    session_revoked: "bg-yellow-100 text-yellow-800",
  };

  const formatDate = (d: string) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    return dt.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4" data-testid="security-tab">
      <div className="grid grid-cols-2 gap-3">
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setSecurityView("overview")}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Failed Logins (24h)</span>
            </div>
            <p className="text-2xl font-bold" data-testid="failed-login-count">{summaryLoading ? "..." : summary?.failedLogins24h || 0}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setSecurityView("locked")}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Locked Accounts</span>
            </div>
            <p className="text-2xl font-bold" data-testid="locked-count">{summaryLoading ? "..." : summary?.lockedAccountsCount || 0}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setSecurityView("sessions")}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Active Sessions</span>
            </div>
            <p className="text-2xl font-bold" data-testid="sessions-count">{summaryLoading ? "..." : summary?.activeSessionsCount || 0}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setSecurityView("audit")}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Audit Log</span>
            </div>
            <p className="text-2xl font-bold">View</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(["overview", "audit", "sessions", "locked"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setSecurityView(v)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              securityView === v ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`security-view-${v}`}
          >
            {v === "overview" ? "Recent Events" : v === "audit" ? "Audit Log" : v === "sessions" ? "Active Sessions" : "Locked Accounts"}
          </button>
        ))}
      </div>

      {securityView === "overview" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : summary?.recentEvents?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent events</p>
            ) : (
              <div className="space-y-2">
                {summary?.recentEvents?.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-2 p-2 rounded-lg bg-accent/50 text-xs">
                    <Badge variant="secondary" className={`text-[10px] shrink-0 ${eventTypeColors[log.eventType] || "bg-gray-100"}`}>
                      {eventTypeLabels[log.eventType] || log.eventType}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{log.username || "System"}</span>
                      {log.ip && <span className="text-muted-foreground ml-1">({log.ip})</span>}
                      <div className="text-muted-foreground">{formatDate(log.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {securityView === "audit" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Audit Log
              <Select value={eventFilter || "all"} onValueChange={(v) => setEventFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue placeholder="Filter events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="login_success">Login Success</SelectItem>
                  <SelectItem value="login_failed">Login Failed</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="account_locked">Account Locked</SelectItem>
                  <SelectItem value="suspicious_login">Suspicious Login</SelectItem>
                  <SelectItem value="session_revoked">Session Revoked</SelectItem>
                  <SelectItem value="otp_sent">OTP Sent</SelectItem>
                  <SelectItem value="otp_verified">OTP Verified</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : !auditLogs?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">No audit logs found</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="p-2 rounded-lg bg-accent/50 text-xs border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className={`text-[10px] ${eventTypeColors[log.eventType] || "bg-gray-100"}`}>
                        {eventTypeLabels[log.eventType] || log.eventType}
                      </Badge>
                      <span className="text-muted-foreground">{formatDate(log.createdAt)}</span>
                    </div>
                    <div className="flex gap-4">
                      <span>User: <strong>{log.username || "N/A"}</strong></span>
                      <span>IP: {log.ip || "N/A"}</span>
                    </div>
                    {log.metadata && (
                      <div className="text-muted-foreground mt-1 truncate">
                        {typeof log.metadata === "object" ? JSON.stringify(log.metadata) : log.metadata}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {securityView === "sessions" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Sessions ({activeSessions?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : !activeSessions?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active sessions</p>
            ) : (
              <div className="space-y-2">
                {activeSessions.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border">
                    <div className="text-xs">
                      <div className="font-medium">{s.username || "Unknown"}</div>
                      <div className="text-muted-foreground">IP: {s.ip || "N/A"}</div>
                      <div className="text-muted-foreground">Last active: {formatDate(s.lastActive)}</div>
                      <div className="text-muted-foreground truncate max-w-[200px]">Device: {s.deviceFingerprint?.substring(0, 50) || "N/A"}</div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => revokeSessionMut.mutate(s.id)}
                      disabled={revokeSessionMut.isPending}
                      data-testid={`revoke-session-${s.id}`}
                    >
                      <X className="w-3 h-3 mr-1" /> Revoke
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {securityView === "locked" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Locked Accounts ({lockedAccounts?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {lockedLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : !lockedAccounts?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">No locked accounts</p>
            ) : (
              <div className="space-y-2">
                {lockedAccounts.map((acc: any) => (
                  <div key={acc.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="text-xs">
                      <div className="font-medium">{acc.username}</div>
                      <div className="text-muted-foreground">{acc.name} - {acc.phone}</div>
                      <div className="text-red-600">Locked until: {formatDate(acc.accountLockedUntil)}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => unlockAccountMut.mutate(acc.id)}
                      disabled={unlockAccountMut.isPending}
                      data-testid={`unlock-account-${acc.id}`}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Unlock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AssemblyTasksTab() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    taskName: "",
    assignedTeam: "",
    dueDate: "",
    urgency: "medium",
    notes: "",
    assignedTo: "",
  });

  const { data: tasks, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/assembly-tasks"],
  });

  const { data: assemblyHeads } = useQuery<any[]>({
    queryKey: ["/api/admin/assembly-head-users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/assembly-tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assembly-tasks"] });
      toast({ title: "Assembly task created" });
      setShowAddForm(false);
      setNewTask({ taskName: "", assignedTeam: "", dueDate: "", urgency: "medium", notes: "", assignedTo: "" });
    },
    onError: (e: any) => toast({ title: e.message || "Failed to create task", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/admin/assembly-tasks/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assembly-tasks"] });
      toast({ title: "Task updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/assembly-tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/assembly-tasks"] });
      toast({ title: "Task deleted" });
    },
  });

  const handleCreate = () => {
    if (!newTask.taskName || !newTask.dueDate) {
      toast({ title: "Task name and due date are required", variant: "destructive" });
      return;
    }
    const payload: any = {
      taskName: newTask.taskName,
      dueDate: newTask.dueDate,
      urgency: newTask.urgency,
    };
    if (newTask.assignedTeam) payload.assignedTeam = newTask.assignedTeam;
    if (newTask.notes) payload.notes = newTask.notes;
    if (newTask.assignedTo) payload.assignedTo = newTask.assignedTo;
    createMutation.mutate(payload);
  };

  if (isLoading) return <LoadingState />;

  const urgencyColor = (u: string) => {
    if (u === "high") return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    if (u === "low") return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
  };

  const statusColor = (s: string) => {
    if (s === "completed") return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    if (s === "in_progress") return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Assembly Tasks ({tasks?.length || 0})</h2>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} data-testid="button-add-assembly-task">
          <Plus className="w-4 h-4 mr-1" /> New Task
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Create Assembly Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label className="text-[10px]">Task Name *</Label>
              <Input value={newTask.taskName} onChange={e => setNewTask(p => ({ ...p, taskName: e.target.value }))} className="h-7 text-xs" placeholder="e.g. Assemble Motor Unit" data-testid="input-task-name" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Due Date *</Label>
                <Input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))} className="h-7 text-xs" data-testid="input-task-due-date" />
              </div>
              <div>
                <Label className="text-[10px]">Urgency</Label>
                <select value={newTask.urgency} onChange={e => setNewTask(p => ({ ...p, urgency: e.target.value }))} className="w-full h-7 rounded-md border border-input bg-background px-2 text-[10px]" data-testid="select-task-urgency">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Assigned Team</Label>
                <Input value={newTask.assignedTeam} onChange={e => setNewTask(p => ({ ...p, assignedTeam: e.target.value }))} className="h-7 text-xs" placeholder="e.g. Team A" data-testid="input-task-team" />
              </div>
              <div>
                <Label className="text-[10px]">Assign To</Label>
                <select value={newTask.assignedTo} onChange={e => setNewTask(p => ({ ...p, assignedTo: e.target.value }))} className="w-full h-7 rounded-md border border-input bg-background px-2 text-[10px]" data-testid="select-task-assignee">
                  <option value="">Select Assembly Head</option>
                  {assemblyHeads?.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.username})</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-[10px]">Notes</Label>
              <Textarea value={newTask.notes} onChange={e => setNewTask(p => ({ ...p, notes: e.target.value }))} className="text-xs min-h-[40px]" placeholder="Any additional details..." data-testid="input-task-notes" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 text-xs" onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-save-assembly-task">
                <Save className="w-3 h-3 mr-1" /> {createMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowAddForm(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tasks?.map((task: any) => (
        <Card key={task.id} data-testid={`card-assembly-task-${task.id}`}>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{task.taskName}</p>
                {task.assignedTeam && <p className="text-xs text-muted-foreground">Team: {task.assignedTeam}</p>}
              </div>
              <div className="flex items-center gap-1.5">
                <Badge className={`text-[10px] ${urgencyColor(task.urgency)}`}>{task.urgency}</Badge>
                <Badge className={`text-[10px] ${statusColor(task.status)}`}>{task.status === "in_progress" ? "In Progress" : task.status}</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-IN") : "N/A"}</p>
            {task.notes && <p className="text-xs text-muted-foreground mb-2">{task.notes}</p>}
            <div className="flex gap-1.5 mt-2">
              {["pending", "in_progress", "completed"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateMutation.mutate({ id: task.id, data: { status: s, ...(s === "completed" ? { completedAt: new Date().toISOString() } : {}) } })}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                    task.status === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"
                  }`}
                  data-testid={`button-task-status-${s}-${task.id}`}
                >
                  {s === "in_progress" ? "In Progress" : s}
                </button>
              ))}
              <button
                onClick={() => { if (confirm("Delete this task?")) deleteMutation.mutate(task.id); }}
                className="text-[10px] px-2 py-1 rounded-full border text-destructive hover:bg-destructive/10 transition-colors"
                data-testid={`button-delete-task-${task.id}`}
              >
                Delete
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
      {(!tasks || tasks.length === 0) && <EmptyState message="No assembly tasks yet" />}
    </div>
  );
}

function VideoCallsTab() {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<"slots" | "bookings">("slots");
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [slotForm, setSlotForm] = useState({
    date: "",
    startTime: "10:00",
    endTime: "10:30",
    duration: 30,
    maxBookings: 3,
    engineerName: "",
    isActive: true,
  });

  const { data: slots = [], isLoading: slotsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/video-call-slots"],
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/video-call-bookings"],
  });

  const createSlotMut = useMutation({
    mutationFn: async (data: typeof slotForm) => {
      const res = await apiRequest("POST", "/api/admin/video-call-slots", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/video-call-slots"] });
      setShowSlotForm(false);
      setSlotForm({ date: "", startTime: "10:00", endTime: "10:30", duration: 30, maxBookings: 3, engineerName: "", isActive: true });
      toast({ title: "Slot created" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteSlotMut = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/video-call-slots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/video-call-slots"] });
      toast({ title: "Slot deleted" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateBookingMut = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/video-call-bookings/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/video-call-bookings"] });
      toast({ title: "Booking updated" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const formatDate = (d: string) => {
    try {
      return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    } catch { return d; }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={subTab === "slots" ? "default" : "outline"} size="sm" onClick={() => setSubTab("slots")} data-testid="button-subtab-slots">
          Time Slots
        </Button>
        <Button variant={subTab === "bookings" ? "default" : "outline"} size="sm" onClick={() => setSubTab("bookings")} data-testid="button-subtab-bookings">
          Bookings ({bookings.length})
        </Button>
      </div>

      {subTab === "slots" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Available Slots</p>
            <Button size="sm" onClick={() => setShowSlotForm(!showSlotForm)} data-testid="button-add-slot">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Slot
            </Button>
          </div>

          {showSlotForm && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Date *</Label>
                    <Input type="date" value={slotForm.date} onChange={e => setSlotForm(p => ({ ...p, date: e.target.value }))} className="mt-1" data-testid="input-slot-date" />
                  </div>
                  <div>
                    <Label className="text-xs">Engineer Name</Label>
                    <Input value={slotForm.engineerName} onChange={e => setSlotForm(p => ({ ...p, engineerName: e.target.value }))} placeholder="Engineer" className="mt-1" data-testid="input-slot-engineer" />
                  </div>
                  <div>
                    <Label className="text-xs">Start Time *</Label>
                    <Input type="time" value={slotForm.startTime} onChange={e => setSlotForm(p => ({ ...p, startTime: e.target.value }))} className="mt-1" data-testid="input-slot-start" />
                  </div>
                  <div>
                    <Label className="text-xs">End Time *</Label>
                    <Input type="time" value={slotForm.endTime} onChange={e => setSlotForm(p => ({ ...p, endTime: e.target.value }))} className="mt-1" data-testid="input-slot-end" />
                  </div>
                  <div>
                    <Label className="text-xs">Duration (min)</Label>
                    <Input type="number" value={slotForm.duration} onChange={e => setSlotForm(p => ({ ...p, duration: parseInt(e.target.value) || 30 }))} className="mt-1" data-testid="input-slot-duration" />
                  </div>
                  <div>
                    <Label className="text-xs">Max Bookings</Label>
                    <Input type="number" value={slotForm.maxBookings} onChange={e => setSlotForm(p => ({ ...p, maxBookings: parseInt(e.target.value) || 1 }))} className="mt-1" data-testid="input-slot-max" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => createSlotMut.mutate(slotForm)} disabled={!slotForm.date || createSlotMut.isPending} data-testid="button-save-slot">
                    <Save className="w-3.5 h-3.5 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowSlotForm(false)} data-testid="button-cancel-slot">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {slotsLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : !slots.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">No slots created yet</p>
          ) : (
            <div className="space-y-2">
              {slots.map((slot: any) => (
                <Card key={slot.id} data-testid={`card-slot-${slot.id}`}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-semibold">{formatDate(slot.date)}</span>
                          <Badge variant={slot.isActive ? "default" : "secondary"} className="text-[10px] h-4">
                            {slot.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{slot.startTime} - {slot.endTime}</span>
                          <span>|</span>
                          <span>{slot.currentBookings}/{slot.maxBookings} booked</span>
                        </div>
                        {slot.engineerName && (
                          <p className="text-[10px] text-muted-foreground">{slot.engineerName}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive h-7 px-2" onClick={() => deleteSlotMut.mutate(slot.id)} disabled={deleteSlotMut.isPending} data-testid={`button-delete-slot-${slot.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === "bookings" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">All Video Call Bookings</p>
          {bookingsLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : !bookings.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">No bookings yet</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((b: any) => (
                <Card key={b.id} data-testid={`card-booking-admin-${b.id}`}>
                  <CardContent className="pt-3 pb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">{b.bookingNumber}</span>
                      <Badge variant={b.status === "confirmed" ? "default" : b.status === "cancelled" ? "destructive" : "secondary"}>
                        {b.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div><span className="text-muted-foreground">Name:</span> {b.userName}</div>
                      <div><span className="text-muted-foreground">Phone:</span> {b.userPhone}</div>
                      <div><span className="text-muted-foreground">Machine:</span> {b.machineType}</div>
                      <div><span className="text-muted-foreground">Date:</span> {formatDate(b.slotDate)}</div>
                    </div>
                    <p className="text-xs text-muted-foreground">{b.problemDescription}</p>
                    {b.meetingLink && (
                      <a href={b.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1">
                        <Video className="w-3 h-3" /> {b.meetingLink}
                      </a>
                    )}
                    {b.status === "confirmed" && (
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => updateBookingMut.mutate({ id: b.id, data: { status: "completed" } })} data-testid={`button-complete-${b.id}`}>
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs h-7 text-destructive flex-1" onClick={() => updateBookingMut.mutate({ id: b.id, data: { status: "cancelled", cancelReason: "Cancelled by admin" } })} data-testid={`button-admin-cancel-${b.id}`}>
                          <X className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
