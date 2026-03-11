import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
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
  Snowflake, ShieldCheck, Building2, UserCheck
} from "lucide-react";

type TabType = "dashboard" | "products" | "leads" | "service" | "appointments" | "posts" | "users" | "settings" | "banners" | "market" | "analytics" | "dealers";

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
    { id: "posts", label: "Posts", icon: Eye },
    { id: "dealers", label: "Dealers", icon: Building2 },
    { id: "banners", label: "Banners", icon: Eye },
    { id: "market", label: "Market", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users, superOnly: true },
    { id: "settings", label: "Settings", icon: Settings, superOnly: true },
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
      {activeTab === "posts" && <PostsTab />}
      {activeTab === "dealers" && <DealersTab />}
      {activeTab === "banners" && <BannersTab />}
      {activeTab === "market" && <MarketTab />}
      {activeTab === "users" && <UsersTab />}
      {activeTab === "settings" && <SettingsTab />}
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

function PostsTab() {
  const { toast } = useToast();
  const [showAddPost, setShowAddPost] = useState(false);
  const [newPost, setNewPost] = useState({ caption: "", author: "Sai Rolotech Official", type: "image", images: "", videoUrl: "" });

  const { data: posts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post created!" });
      setShowAddPost(false);
      setNewPost({ caption: "", author: "Sai Rolotech Official", type: "image", images: "", videoUrl: "" });
    },
    onError: () => toast({ title: "Failed to create post", variant: "destructive" }),
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
    if (newPost.type === "image" && newPost.images) {
      postData.images = newPost.images.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    if (newPost.type === "video" && newPost.videoUrl) {
      postData.videoUrl = newPost.videoUrl;
    }
    createPostMutation.mutate(postData);
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">All Posts ({posts?.length || 0})</h2>
        <Button size="sm" onClick={() => setShowAddPost(!showAddPost)} data-testid="button-add-post">
          <Plus className="w-4 h-4 mr-1" /> Add Post
        </Button>
      </div>

      {showAddPost && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label className="text-[10px]">Type</Label>
              <select value={newPost.type} onChange={e => setNewPost(p => ({...p, type: e.target.value}))} className="w-full h-7 rounded-md border border-input bg-background px-2 text-[10px]" data-testid="select-post-type">
                <option value="image">Image Post</option>
                <option value="video">Video Post</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px]">Author</Label>
              <Input value={newPost.author} onChange={e => setNewPost(p => ({...p, author: e.target.value}))} className="h-7 text-xs" data-testid="input-post-author" />
            </div>
            <div>
              <Label className="text-[10px]">Caption *</Label>
              <Textarea value={newPost.caption} onChange={e => setNewPost(p => ({...p, caption: e.target.value}))} className="text-xs min-h-[60px]" placeholder="Write caption..." data-testid="input-post-caption" />
            </div>
            {newPost.type === "image" && (
              <div>
                <Label className="text-[10px]">Post Images</Label>
                <MultiImageUpload
                  bucket="posts"
                  values={newPost.images ? (typeof newPost.images === "string" ? newPost.images.split(",").map((s: string) => s.trim()).filter(Boolean) : newPost.images as string[]) : []}
                  onChange={(urls) => setNewPost(p => ({...p, images: urls.join(", ")}))}
                  label="Upload Post Images"
                  max={5}
                />
              </div>
            )}
            {newPost.type === "video" && (
              <div>
                <Label className="text-[10px]">Video URL</Label>
                <Input value={newPost.videoUrl} onChange={e => setNewPost(p => ({...p, videoUrl: e.target.value}))} className="h-7 text-xs" placeholder="https://youtube.com/..." data-testid="input-post-video" />
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 text-xs" onClick={handleCreatePost} disabled={createPostMutation.isPending} data-testid="button-save-post">
                <Save className="w-3 h-3 mr-1" /> {createPostMutation.isPending ? "Posting..." : "Publish Post"}
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowAddPost(false)}>
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
                  <Badge variant="outline" className="text-[10px]">{post.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.caption}</p>
                {post.videoUrl && <p className="text-[10px] text-blue-500 mt-0.5 truncate">Video: {post.videoUrl}</p>}
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
  const [settingsSection, setSettingsSection] = useState<"company" | "features" | "content" | "advanced">("company");

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", "/api/admin/settings", data);
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
      )}

      <Button
        onClick={() => saveMutation.mutate(formData || d)}
        disabled={saveMutation.isPending}
        className="w-full"
        data-testid="button-save-settings"
      >
        <Save className="w-4 h-4 mr-2" />
        {saveMutation.isPending ? "Saving..." : "Save All Settings"}
      </Button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    contacted: "bg-cyan-100 text-cyan-700",
    qualified: "bg-indigo-100 text-indigo-700",
    converted: "bg-green-100 text-green-700",
    assigned: "bg-cyan-100 text-cyan-700",
    in_progress: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    approved: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <Badge className={`text-[10px] ${colors[status] || "bg-gray-100 text-gray-700"}`}>
      {status?.replace("_", " ")}
    </Badge>
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
  const { data: analytics, isLoading } = useQuery<any>({ queryKey: ["/api/admin/analytics"] });
  if (isLoading) return <LoadingState />;
  if (!analytics) return <EmptyState message="No analytics data" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            App Se Kitna Kaam Mila
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400" data-testid="text-total-leads">{analytics.totalLeads}</p>
              <p className="text-[10px] text-muted-foreground">Total Leads</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400" data-testid="text-converted-leads">{analytics.convertedLeads}</p>
              <p className="text-[10px] text-muted-foreground">Converted</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{analytics.conversionRate}%</p>
              <p className="text-[10px] text-muted-foreground">Conversion Rate</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{analytics.recentLeads7d}</p>
              <p className="text-[10px] text-muted-foreground">Last 7 Days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Lead Sources</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.leadsByInterest && Object.entries(analytics.leadsByInterest).map(([key, val]: [string, any]) => (
            <div key={key} className="flex items-center justify-between py-1.5 border-b last:border-0">
              <span className="text-xs capitalize">{key.replace(/_/g, " ")}</span>
              <Badge variant="secondary" className="text-[10px]">{val}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quotation Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs">Total Quotations</span>
            <span className="text-sm font-bold">{analytics.totalQuotations || 0}</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs">Approved</span>
            <span className="text-sm font-bold text-green-600">{analytics.approvedQuotations || 0}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-t">
            <span className="text-xs">Total Value</span>
            <span className="text-sm font-bold">₹{((analytics.totalQuoteValue || 0) / 100000).toFixed(1)}L</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs">Approved Value</span>
            <span className="text-sm font-bold text-green-600">₹{((analytics.approvedValue || 0) / 100000).toFixed(1)}L</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Support & Visits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs">Total Tickets</span>
            <span className="text-sm font-bold">{analytics.totalTickets || 0}</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs">Open Tickets</span>
            <Badge className="bg-red-100 text-red-700 text-[10px]">{analytics.openTickets || 0}</Badge>
          </div>
          <div className="flex justify-between items-center py-1.5 border-t">
            <span className="text-xs">Total Visits</span>
            <span className="text-sm font-bold">{analytics.totalAppointments || 0}</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-xs">Completed Visits</span>
            <span className="text-sm font-bold text-green-600">{analytics.completedVisits || 0}</span>
          </div>
        </CardContent>
      </Card>
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
