import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Package, FileText, ShoppingCart, User, Upload,
  CheckCircle2, Clock, XCircle, AlertCircle, Loader2, LogOut,
  TrendingUp, Eye, Crown
} from "lucide-react";
import { FreemiumBadge, FreemiumLimitsBar, LockedFeatureOverlay } from "@/components/FreemiumBadge";
import BusinessDiscussion from "@/components/BusinessDiscussion";

type CategoryId = "materials" | "bills" | "orders" | "account";

interface CategorySection {
  id: CategoryId;
  label: string;
  icon: any;
  color: string;
}

const CATEGORIES: CategorySection[] = [
  { id: "materials", label: "Materials", icon: Package, color: "text-blue-600" },
  { id: "bills", label: "Bills", icon: FileText, color: "text-green-600" },
  { id: "orders", label: "Orders", icon: ShoppingCart, color: "text-purple-600" },
  { id: "account", label: "Account", icon: User, color: "text-orange-600" },
];

function getUsageData(vendorId: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(`vendor_usage_${vendorId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function trackUsage(vendorId: string, categoryId: string) {
  try {
    const data = getUsageData(vendorId);
    data[categoryId] = (data[categoryId] || 0) + 1;
    localStorage.setItem(`vendor_usage_${vendorId}`, JSON.stringify(data));
  } catch {}
}

function getSortedCategories(vendorId: string): CategorySection[] {
  const usage = getUsageData(vendorId);
  return [...CATEGORIES].sort((a, b) => (usage[b.id] || 0) - (usage[a.id] || 0));
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    received: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
    verified: "bg-green-100 text-green-700",
  };
  return (
    <Badge className={`text-[10px] ${config[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </Badge>
  );
}

export default function VendorPortal() {
  const [, setLocation] = useLocation();
  const { user, isVendor, isAdmin, isLoading, logout } = useAuth();
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [sortedCategories, setSortedCategories] = useState(CATEGORIES);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      setSortedCategories(getSortedCategories(user.id));
    }
  }, [user?.id]);

  const handleCategoryClick = useCallback((catId: CategoryId) => {
    if (user?.id) {
      trackUsage(user.id, catId);
    }
    setActiveCategory(catId);
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isVendor && !isAdmin) {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Vendor Portal</h1>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="font-semibold">Access Denied</p>
            <p className="text-sm text-muted-foreground mt-1">You need a vendor account to access this portal.</p>
            <Button onClick={() => setLocation("/auth")} className="mt-4" data-testid="button-login">Login as Vendor</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout.mutateAsync();
    setLocation("/");
  };

  if (activeCategory) {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setActiveCategory(null)} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back-dashboard">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold capitalize" data-testid="text-category-title">{activeCategory}</h1>
        </div>
        {activeCategory === "materials" && <MaterialsSection />}
        {activeCategory === "bills" && <BillsSection />}
        {activeCategory === "orders" && <OrdersSection />}
        {activeCategory === "account" && <AccountSection user={user} />}
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold" data-testid="text-vendor-title">Vendor Portal</h1>
            <p className="text-xs text-muted-foreground">Welcome, {user?.name || user?.username}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3" data-testid="vendor-dashboard">
        {sortedCategories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} onClick={() => handleCategoryClick(cat.id)} />
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-muted/30">
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Your most-used sections appear at the top automatically
        </p>
      </div>

      <Card className="mt-4 border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold">Upgrade to PRO</h3>
            <FreemiumBadge isPaid={true} />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: "Unlimited Listings", free: false },
              { label: "AI Quotation PDF", free: false },
              { label: "Analytics Dashboard", free: false },
              { label: "Priority Support", free: false },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-300">
                <Crown className="w-3 h-3 shrink-0" />
                {f.label}
              </div>
            ))}
          </div>
          <Button size="sm" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 border-0">
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            Upgrade Now
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6">
        <BusinessDiscussion
          entityType="vendor"
          entityId={user?.id || "vendor-portal"}
          title="Vendor Discussion"
        />
      </div>
    </div>
  );
}

function CategoryCard({ category, onClick }: { category: CategorySection; onClick: () => void }) {
  const { data: materials } = useQuery<any[]>({
    queryKey: ["/api/vendor/materials"],
    enabled: category.id === "materials",
  });
  const { data: bills } = useQuery<any[]>({
    queryKey: ["/api/vendor/bills"],
    enabled: category.id === "bills",
  });

  let badgeText = "";
  if (category.id === "materials" && materials) {
    const pending = materials.filter((m: any) => m.status === "pending").length;
    const received = materials.filter((m: any) => m.status === "received").length;
    if (pending > 0) badgeText = `${pending} pending`;
    else if (received > 0) badgeText = `${received} received`;
  }
  if (category.id === "bills" && bills) {
    const pending = bills.filter((b: any) => b.status === "pending").length;
    if (pending > 0) badgeText = `${pending} pending`;
  }

  return (
    <Card
      className="cursor-pointer hover:bg-accent/30 transition-all"
      onClick={onClick}
      data-testid={`card-category-${category.id}`}
    >
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${category.color}`}>
              <category.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{category.label}</p>
              <p className="text-[10px] text-muted-foreground">
                {category.id === "materials" && "View received & pending materials"}
                {category.id === "bills" && "Upload & track invoices"}
                {category.id === "orders" && "Purchase orders & history"}
                {category.id === "account" && "Profile & settings"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badgeText && (
              <Badge className="text-[9px] bg-amber-100 text-amber-700" data-testid={`badge-${category.id}`}>
                {badgeText}
              </Badge>
            )}
            <ArrowLeft className="w-4 h-4 text-muted-foreground rotate-180" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MaterialsSection() {
  const { data: materials, isLoading } = useQuery<any[]>({
    queryKey: ["/api/vendor/materials"],
  });

  if (isLoading) return <LoadingState />;

  const received = materials?.filter((m: any) => m.status === "received") || [];
  const pending = materials?.filter((m: any) => m.status === "pending") || [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          Materials Received ({received.length})
        </h2>
        {received.length === 0 ? (
          <Card><CardContent className="pt-4 pb-4 text-center text-sm text-muted-foreground">No materials received yet</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {received.map((m: any) => (
              <Card key={m.id} data-testid={`card-material-${m.id}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{m.materialType}</p>
                      <p className="text-xs text-muted-foreground">PO: {m.poNumber}</p>
                      <p className="text-xs text-muted-foreground">{m.quantity} {m.unit} | {m.date}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                  {m.notes && <p className="text-[10px] text-muted-foreground mt-1">{m.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-600" />
          Materials Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <Card><CardContent className="pt-4 pb-4 text-center text-sm text-muted-foreground">No pending materials</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {pending.map((m: any) => (
              <Card key={m.id} data-testid={`card-material-${m.id}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">{m.materialType}</p>
                      <p className="text-xs text-muted-foreground">PO: {m.poNumber}</p>
                      <p className="text-xs text-muted-foreground">{m.quantity} {m.unit}</p>
                      {m.expectedDate && <p className="text-xs text-muted-foreground">Expected: {m.expectedDate}</p>}
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BillsSection() {
  const { toast } = useToast();
  const { data: bills, isLoading } = useQuery<any[]>({
    queryKey: ["/api/vendor/bills"],
  });
  const [showUpload, setShowUpload] = useState(false);
  const [poNumber, setPoNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !poNumber) throw new Error("File and PO number required");
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) throw new Error("Only PDF, JPEG, PNG, or WebP files are allowed");
      if (file.size > 10 * 1024 * 1024) throw new Error("File must be under 10MB");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("poNumber", poNumber);
      if (amount) formData.append("amount", amount);
      const headers: Record<string, string> = {};
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${import.meta.env.BASE_URL}api/vendor/bills`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Upload failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/bills"] });
      toast({ title: "Bill uploaded successfully" });
      setShowUpload(false);
      setPoNumber("");
      setAmount("");
      setFile(null);
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Bills & Invoices ({bills?.length || 0})</h2>
        <Button size="sm" onClick={() => setShowUpload(!showUpload)} data-testid="button-upload-bill">
          <Upload className="w-3.5 h-3.5 mr-1" />
          Upload Bill
        </Button>
      </div>

      {showUpload && (
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <div>
              <Label className="text-xs">PO Number *</Label>
              <Input
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="Enter PO number"
                data-testid="input-po-number"
              />
            </div>
            <div>
              <Label className="text-xs">Amount (optional)</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Invoice amount"
                data-testid="input-bill-amount"
              />
            </div>
            <div>
              <Label className="text-xs">Invoice File (PDF/Image) *</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                data-testid="input-bill-file"
              />
            </div>
            <Button
              onClick={() => uploadMutation.mutate()}
              disabled={!file || !poNumber || uploadMutation.isPending}
              className="w-full"
              data-testid="button-submit-bill"
            >
              {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
              Submit Bill
            </Button>
          </CardContent>
        </Card>
      )}

      {bills?.map((bill: any) => (
        <Card key={bill.id} data-testid={`card-bill-${bill.id}`}>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">{bill.fileName}</p>
                <p className="text-xs text-muted-foreground">PO: {bill.poNumber}</p>
                {bill.amount && <p className="text-xs text-muted-foreground">Amount: Rs {bill.amount}</p>}
                {bill.uploadedAt && <p className="text-[10px] text-muted-foreground">{new Date(bill.uploadedAt).toLocaleDateString("en-IN")}</p>}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={bill.status} />
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => window.open(bill.fileUrl, "_blank")} data-testid={`button-view-bill-${bill.id}`}>
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            {bill.adminNotes && (
              <p className="text-[10px] mt-1 p-1.5 bg-muted/30 rounded text-muted-foreground">Admin: {bill.adminNotes}</p>
            )}
          </CardContent>
        </Card>
      ))}
      {(!bills || bills.length === 0) && !showUpload && (
        <Card><CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">No bills uploaded yet</CardContent></Card>
      )}
    </div>
  );
}

function OrdersSection() {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Purchase Orders</h2>
      <Card>
        <CardContent className="pt-6 pb-6 text-center">
          <ShoppingCart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Order tracking coming soon</p>
          <p className="text-[10px] text-muted-foreground mt-1">Your purchase orders will appear here</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountSection({ user }: { user: any }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Account Details</h2>
      <Card>
        <CardContent className="pt-4 space-y-2">
          {[
            { label: "Name", value: user?.name },
            { label: "Username", value: user?.username },
            { label: "Phone", value: user?.phone },
            { label: "Email", value: user?.email },
            { label: "Company", value: user?.companyName },
            { label: "GST No", value: user?.gstNo },
            { label: "Location", value: user?.location },
            { label: "Role", value: user?.role },
          ].filter(r => r.value).map((row) => (
            <div key={row.label} className="flex justify-between text-xs py-1.5 border-b last:border-0">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium">{row.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}
