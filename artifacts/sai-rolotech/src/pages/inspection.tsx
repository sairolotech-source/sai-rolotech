import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import type { Inspection } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, ClipboardCheck, CheckCircle2, XCircle, AlertTriangle,
  Plus, ChevronRight, Clock, Search, X, Save
} from "lucide-react";

type CheckItem = {
  id: string;
  name: string;
  category: string;
  status: "pending" | "pass" | "fail" | "na";
  notes: string;
};

const defaultChecklistItems: { name: string; category: string }[] = [
  { name: "Frame Alignment", category: "Structure" },
  { name: "Side Plate Flatness", category: "Structure" },
  { name: "Base Frame Welding Quality", category: "Structure" },
  { name: "Shaft Straightness", category: "Shaft & Bearings" },
  { name: "Shaft Diameter Tolerance", category: "Shaft & Bearings" },
  { name: "Bearing Fitment (NSK/FLT/FAG)", category: "Shaft & Bearings" },
  { name: "Bearing Lubrication", category: "Shaft & Bearings" },
  { name: "Roller Profile Accuracy", category: "Rollers" },
  { name: "Roller Surface Finish", category: "Rollers" },
  { name: "Roller Hardness (HRC)", category: "Rollers" },
  { name: "Roller Alignment", category: "Rollers" },
  { name: "Gearbox Assembly", category: "Drive System" },
  { name: "Side Gear Mesh", category: "Drive System" },
  { name: "Motor Connection", category: "Drive System" },
  { name: "Chain/Belt Tension", category: "Drive System" },
  { name: "Panel Wiring", category: "Electrical" },
  { name: "PLC Programming", category: "Electrical" },
  { name: "Safety Switches", category: "Electrical" },
  { name: "Emergency Stop", category: "Electrical" },
  { name: "Touch Panel Display", category: "Electrical" },
  { name: "Cutting Blade Sharpness", category: "Cutting System" },
  { name: "Cutting Accuracy", category: "Cutting System" },
  { name: "Scrap Ejection", category: "Cutting System" },
  { name: "Decoiler Rotation", category: "Decoiler" },
  { name: "Decoiler Brake System", category: "Decoiler" },
  { name: "Profile Dimension Check", category: "Trial Run" },
  { name: "Speed Test (m/min)", category: "Trial Run" },
  { name: "Noise Level Test", category: "Trial Run" },
  { name: "Vibration Check", category: "Trial Run" },
  { name: "Continuous Run (30 min)", category: "Trial Run" },
  { name: "Output Quality Visual", category: "Trial Run" },
  { name: "Paint/Powder Coating", category: "Finishing" },
  { name: "Name Plate & Labels", category: "Finishing" },
  { name: "Tool Kit Included", category: "Finishing" },
  { name: "User Manual Provided", category: "Finishing" },
  { name: "Warranty Card Issued", category: "Finishing" },
];

function createCheckItems(): CheckItem[] {
  return defaultChecklistItems.map((item, i) => ({
    id: `chk-${i}`,
    name: item.name,
    category: item.category,
    status: "pending" as const,
    notes: "",
  }));
}

const statusColors = {
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  passed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  conditional: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "pass") return <CheckCircle2 className="w-4 h-4 text-green-600" />;
  if (status === "fail") return <XCircle className="w-4 h-4 text-red-600" />;
  if (status === "na") return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
  return <Clock className="w-4 h-4 text-amber-500" />;
}

function NewInspectionForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    machineModel: "",
    machineCategory: "Rolling Shutter",
    customerName: "",
    inspectorName: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const items = createCheckItems();
      const res = await apiRequest("POST", "/api/admin/inspections", {
        ...formData,
        items,
        status: "in_progress",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      toast({ title: "Inspection Created", description: "Quality checklist has been initialized." });
      onClose();
    },
  });

  const machineCategories = ["Rolling Shutter", "False Ceiling", "Drywall & Partition", "Structural", "Door & Window", "Roofing & Cladding", "Solar & Infrastructure"];

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <h3 className="font-bold text-sm">New Quality Inspection</h3>
        <div>
          <Label className="text-xs">Machine Category *</Label>
          <select
            value={formData.machineCategory}
            onChange={(e) => setFormData(p => ({ ...p, machineCategory: e.target.value }))}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            data-testid="select-insp-category"
          >
            {machineCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs">Machine Model *</Label>
          <Input
            value={formData.machineModel}
            onChange={(e) => setFormData(p => ({ ...p, machineModel: e.target.value }))}
            placeholder="e.g. SAI-5.0 Advance"
            data-testid="input-insp-model"
          />
        </div>
        <div>
          <Label className="text-xs">Customer Name</Label>
          <Input
            value={formData.customerName}
            onChange={(e) => setFormData(p => ({ ...p, customerName: e.target.value }))}
            placeholder="Party / Customer name"
            data-testid="input-insp-customer"
          />
        </div>
        <div>
          <Label className="text-xs">Inspector Name *</Label>
          <Input
            value={formData.inspectorName}
            onChange={(e) => setFormData(p => ({ ...p, inspectorName: e.target.value }))}
            placeholder="QC Inspector name"
            data-testid="input-insp-inspector"
          />
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={!formData.machineModel || !formData.inspectorName || mutation.isPending}
            onClick={() => mutation.mutate()}
            data-testid="button-create-inspection"
          >
            {mutation.isPending ? "Creating..." : "Create Inspection"}
          </Button>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-inspection">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InspectionDetail({ inspection, onBack }: { inspection: Inspection; onBack: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [items, setItems] = useState<CheckItem[]>(inspection.items as CheckItem[]);
  const [notes, setNotes] = useState(inspection.notes || "");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = [...new Set(items.map(i => i.category))];

  const updateMutation = useMutation({
    mutationFn: async (data: { items?: CheckItem[]; status?: string; overallResult?: string; notes?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/inspections/${inspection.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      toast({ title: "Saved", description: "Inspection updated." });
    },
  });

  const toggleItemStatus = (itemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const next = item.status === "pending" ? "pass"
        : item.status === "pass" ? "fail"
        : item.status === "fail" ? "na"
        : "pending";
      return { ...item, status: next };
    }));
  };

  const passCount = items.filter(i => i.status === "pass").length;
  const failCount = items.filter(i => i.status === "fail").length;
  const pendingCount = items.filter(i => i.status === "pending").length;
  const totalChecked = items.filter(i => i.status !== "pending").length;
  const progress = Math.round((totalChecked / items.length) * 100);

  const determineResult = () => {
    if (pendingCount > 0) return "incomplete";
    if (failCount === 0) return "passed";
    if (failCount <= 3) return "conditional";
    return "failed";
  };

  const handleSave = () => {
    const result = determineResult();
    const status = result === "passed" ? "passed"
      : result === "failed" ? "failed"
      : result === "conditional" ? "conditional"
      : "in_progress";
    updateMutation.mutate({ items, status, overallResult: result, notes });
  };

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-1" data-testid="button-back-inspection">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-sm" data-testid="text-inspection-title">{inspection.inspectionNumber}</h1>
          <p className="text-[10px] text-muted-foreground">{inspection.machineModel} — {inspection.machineCategory}</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending} data-testid="button-save-inspection">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        <Card>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">Progress</span>
              <span className="text-xs font-bold" data-testid="text-progress">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px]">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-600" /> {passCount} Pass</span>
              <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-600" /> {failCount} Fail</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" /> {pendingCount} Pending</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="bg-muted/30 rounded-md p-2">
            <span className="text-muted-foreground">Inspector</span>
            <p className="font-medium" data-testid="text-inspector">{inspection.inspectorName}</p>
          </div>
          {inspection.customerName && (
            <div className="bg-muted/30 rounded-md p-2">
              <span className="text-muted-foreground">Customer</span>
              <p className="font-medium" data-testid="text-customer">{inspection.customerName}</p>
            </div>
          )}
        </div>

        {categories.map(cat => {
          const catItems = items.filter(i => i.category === cat);
          const catPass = catItems.filter(i => i.status === "pass").length;
          const isExpanded = expandedCategory === cat;

          return (
            <Card key={cat} data-testid={`card-category-${cat}`}>
              <button
                className="w-full px-4 py-3 flex items-center justify-between"
                onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                data-testid={`button-expand-${cat}`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-xs">{cat}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{catPass}/{catItems.length}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-3 space-y-1.5">
                  {catItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2" data-testid={`check-item-${item.id}`}>
                      <button
                        onClick={() => isAdmin && toggleItemStatus(item.id)}
                        className="shrink-0"
                        disabled={!isAdmin}
                        data-testid={`button-toggle-${item.id}`}
                      >
                        <StatusIcon status={item.status} />
                      </button>
                      <span className={`text-xs flex-1 ${item.status === "fail" ? "text-red-600 font-medium" : item.status === "pass" ? "text-green-700 dark:text-green-400" : ""}`}>
                        {item.name}
                      </span>
                      <Badge variant="outline" className="text-[8px] capitalize">{item.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}

        {isAdmin && (
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Inspector Notes</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional observations, remarks..."
              className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-xs resize-none"
              data-testid="textarea-notes"
            />
          </div>
        )}

        {inspection.overallResult && (
          <Card className={`${
            inspection.overallResult === "passed" ? "border-green-300 bg-green-50/30 dark:bg-green-950/20" :
            inspection.overallResult === "failed" ? "border-red-300 bg-red-50/30 dark:bg-red-950/20" :
            "border-blue-300 bg-blue-50/30 dark:bg-blue-950/20"
          }`}>
            <CardContent className="pt-3 pb-3 text-center">
              {inspection.overallResult === "passed" && <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-1" />}
              {inspection.overallResult === "failed" && <XCircle className="w-8 h-8 text-red-600 mx-auto mb-1" />}
              {inspection.overallResult === "conditional" && <AlertTriangle className="w-8 h-8 text-blue-600 mx-auto mb-1" />}
              <p className="font-bold text-sm capitalize" data-testid="text-overall-result">
                {inspection.overallResult === "conditional" ? "Conditional Pass" : inspection.overallResult}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function InspectionPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [showNew, setShowNew] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: inspections, isLoading } = useQuery<Inspection[]>({
    queryKey: ["/api/inspections"],
  });

  const filtered = (inspections || []).filter(insp => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return insp.inspectionNumber.toLowerCase().includes(q) ||
      insp.machineModel.toLowerCase().includes(q) ||
      insp.machineCategory.toLowerCase().includes(q) ||
      (insp.customerName || "").toLowerCase().includes(q) ||
      insp.inspectorName.toLowerCase().includes(q);
  });

  if (selectedInspection) {
    return <InspectionDetail inspection={selectedInspection} onBack={() => {
      setSelectedInspection(null);
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
    }} />;
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation("/")} className="p-1" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-sm" data-testid="text-inspection-page-title">Quality Inspection</h1>
          <p className="text-[10px] text-muted-foreground">37-Point Machine Checklist</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowNew(!showNew)} data-testid="button-new-inspection">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        )}
      </div>

      <div className="px-4 pt-4 space-y-3">
        {showNew && isAdmin && <NewInspectionForm onClose={() => setShowNew(false)} />}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by QC number, model, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-inspections"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-3 pb-3">
            <h3 className="font-semibold text-xs mb-1">37-Point Quality Check</h3>
            <p className="text-[10px] text-muted-foreground">
              Every machine goes through a comprehensive quality inspection covering Structure, Shaft & Bearings, Rollers, Drive System, Electrical, Cutting, Decoiler, Trial Run, and Finishing.
            </p>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}><CardContent className="pt-3 pb-3"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardCheck className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No inspections yet</p>
            {isAdmin && <p className="text-xs text-muted-foreground mt-1">Create a new quality inspection to start the 47-point checklist.</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(insp => {
              const checkItems = (insp.items as CheckItem[]) || [];
              const passCount = checkItems.filter(i => i.status === "pass").length;
              const failCount = checkItems.filter(i => i.status === "fail").length;
              const progress = Math.round((checkItems.filter(i => i.status !== "pending").length / checkItems.length) * 100);

              return (
                <Card
                  key={insp.id}
                  className="cursor-pointer hover-elevate"
                  onClick={() => setSelectedInspection(insp)}
                  data-testid={`card-inspection-${insp.id}`}
                >
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <h3 className="font-bold text-sm" data-testid={`text-insp-number-${insp.id}`}>{insp.inspectionNumber}</h3>
                        <p className="text-[10px] text-muted-foreground">{insp.machineModel} — {insp.machineCategory}</p>
                      </div>
                      <Badge className={`text-[9px] capitalize ${statusColors[insp.status as keyof typeof statusColors] || ""}`}>
                        {insp.status === "in_progress" ? "In Progress" : insp.status}
                      </Badge>
                    </div>
                    {insp.customerName && (
                      <p className="text-[10px] text-muted-foreground mb-1.5">Customer: {insp.customerName}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px]">
                      <div className="flex-1">
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <span className="text-muted-foreground">{progress}%</span>
                      <span className="text-green-600">{passCount}✓</span>
                      {failCount > 0 && <span className="text-red-600">{failCount}✗</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
