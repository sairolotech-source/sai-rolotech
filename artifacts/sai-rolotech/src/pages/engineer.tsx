import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Package, Workflow, Truck, Users, LogOut, Loader2,
  AlertCircle, Clock, CheckCircle2, ChevronRight, Send,
  Phone, MapPin, Building2, MessageSquare, Plus, Filter
} from "lucide-react";

type TabType = "orders" | "workflow" | "jobwork" | "vendors";

const ORDER_STATUSES = ["ordered", "in_production", "dispatched", "delivered"];
const ORDER_STATUS_COLORS: Record<string, string> = {
  ordered: "bg-blue-100 text-blue-700",
  in_production: "bg-amber-100 text-amber-700",
  dispatched: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
};

const WORKFLOW_STAGES = ["raw_material", "cutting", "rolling", "welding", "assembly", "testing", "painting", "packing"];
const STAGE_LABELS: Record<string, string> = {
  raw_material: "Raw Material",
  cutting: "Cutting",
  rolling: "Rolling",
  welding: "Welding",
  assembly: "Assembly",
  testing: "Testing",
  painting: "Painting",
  packing: "Packing",
};

const JOB_STATUSES = ["sent", "in_progress", "completed", "returned"];
const JOB_STATUS_COLORS: Record<string, string> = {
  sent: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  returned: "bg-gray-100 text-gray-700",
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ...ORDER_STATUS_COLORS,
    ...JOB_STATUS_COLORS,
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    fulfilled: "bg-green-100 text-green-700",
  };
  return (
    <Badge className={`text-[10px] ${colors[status] || "bg-gray-100 text-gray-700"}`} data-testid={`badge-status-${status}`}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

function NotesSection({ entityType, entityId, authorName, authorId }: {
  entityType: string; entityId: string; authorName: string; authorId: string | null;
}) {
  const [noteText, setNoteText] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const { data: notes, isLoading } = useQuery<any[]>({
    queryKey: [`/api/engineer/notes/${entityType}/${entityId}`],
    enabled: showNotes,
  });

  const addNote = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/engineer/notes", {
        entityType, entityId, authorName, authorId, content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/engineer/notes/${entityType}/${entityId}`] });
      setNoteText("");
    },
  });

  return (
    <div className="mt-2 border-t pt-2">
      <button
        onClick={() => setShowNotes(!showNotes)}
        className="text-[10px] text-primary flex items-center gap-1"
        data-testid={`button-toggle-notes-${entityId}`}
      >
        <MessageSquare className="w-3 h-3" />
        {showNotes ? "Hide Notes" : "Show Notes"}
      </button>
      {showNotes && (
        <div className="mt-2 space-y-2">
          {isLoading && <p className="text-[10px] text-muted-foreground">Loading...</p>}
          {notes?.map((note: any) => (
            <div key={note.id} className="bg-accent/30 rounded-md p-2">
              <p className="text-[10px] font-medium">{note.authorName}</p>
              <p className="text-[10px] text-muted-foreground">{note.content}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {new Date(note.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))}
          {notes?.length === 0 && <p className="text-[10px] text-muted-foreground">No notes yet</p>}
          <div className="flex gap-1.5">
            <Input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note..."
              className="h-7 text-[10px] flex-1"
              data-testid={`input-note-${entityId}`}
            />
            <Button
              size="sm"
              className="h-7 px-2"
              disabled={!noteText.trim() || addNote.isPending}
              onClick={() => addNote.mutate(noteText.trim())}
              data-testid={`button-add-note-${entityId}`}
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MachineOrdersTab({ userName, userId }: { userName: string; userId: string | null }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/engineer/machine-orders"],
  });

  if (isLoading) return <LoadingState />;

  const filtered = orders?.filter((o: any) => statusFilter === "all" || o.status === statusFilter) || [];

  const statusCounts = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = orders?.filter((o: any) => o.status === s).length || 0;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {ORDER_STATUSES.map((s) => (
          <Card key={s} className="cursor-pointer" onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}>
            <CardContent className="py-2 px-2 text-center">
              <p className="text-lg font-bold">{statusCounts[s]}</p>
              <p className="text-[9px] text-muted-foreground capitalize">{s.replace(/_/g, " ")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setStatusFilter("all")}
          className={`text-[10px] px-3 py-1.5 rounded-full border whitespace-nowrap ${statusFilter === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          data-testid="filter-all-orders"
        >
          All ({orders?.length || 0})
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-[10px] px-3 py-1.5 rounded-full border whitespace-nowrap capitalize ${statusFilter === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            data-testid={`filter-order-${s}`}
          >
            {s.replace(/_/g, " ")} ({statusCounts[s]})
          </button>
        ))}
      </div>

      {filtered.map((order: any) => (
        <Card key={order.id} data-testid={`card-order-${order.id}`}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[10px] font-mono text-primary">{order.orderNumber}</p>
                <p className="font-semibold text-sm">{order.customerName}</p>
                {order.customerPhone && (
                  <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                )}
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="space-y-1">
              <p className="text-xs"><span className="text-muted-foreground">Machine:</span> {order.machineType} {order.machineModel && `(${order.machineModel})`}</p>
              <p className="text-xs"><span className="text-muted-foreground">Qty:</span> {order.quantity}</p>
              {order.expectedDelivery && (
                <p className="text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Expected:</span> {order.expectedDelivery}
                </p>
              )}
              {order.timeline && (
                <p className="text-xs text-muted-foreground">{order.timeline}</p>
              )}
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-1">
                {ORDER_STATUSES.map((s, i) => {
                  const currentIdx = ORDER_STATUSES.indexOf(order.status);
                  const isComplete = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <div className={`w-full h-1.5 rounded-full ${isComplete ? "bg-primary" : "bg-muted"}`} />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-0.5">
                {ORDER_STATUSES.map((s) => (
                  <span key={s} className="text-[8px] text-muted-foreground capitalize">{s.replace(/_/g, " ").split(" ")[0]}</span>
                ))}
              </div>
            </div>

            {order.notes && <p className="text-[10px] text-muted-foreground mt-2 italic">{order.notes}</p>}
            <NotesSection entityType="machine_order" entityId={order.id} authorName={userName} authorId={userId} />
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && <EmptyState message="No machine orders found" />}
    </div>
  );
}

function ProductionWorkflowTab({ userName, userId }: { userName: string; userId: string | null }) {
  const { toast } = useToast();

  const { data: workflows, isLoading } = useQuery<any[]>({
    queryKey: ["/api/engineer/production-workflows"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/engineer/production-workflows/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/engineer/production-workflows"] });
      toast({ title: "Workflow updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  if (isLoading) return <LoadingState />;

  const activeWorkflows = workflows?.filter((w: any) => !w.completedAt) || [];
  const completedWorkflows = workflows?.filter((w: any) => w.completedAt) || [];

  const advanceStage = (workflow: any) => {
    const stages = workflow.stages || WORKFLOW_STAGES;
    const currentIdx = stages.indexOf(workflow.currentStage);
    if (currentIdx < stages.length - 1) {
      const nextStage = stages[currentIdx + 1];
      updateMutation.mutate({
        id: workflow.id,
        data: {
          currentStage: nextStage,
          ...(currentIdx + 1 === stages.length - 1 ? { completedAt: new Date() } : {}),
        },
      });
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">Active Jobs ({activeWorkflows.length})</h2>

      {activeWorkflows.map((wf: any) => {
        const stages = wf.stages || WORKFLOW_STAGES;
        const currentIdx = stages.indexOf(wf.currentStage);
        const progress = Math.round(((currentIdx + 1) / stages.length) * 100);

        return (
          <Card key={wf.id} data-testid={`card-workflow-${wf.id}`}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[10px] font-mono text-primary">{wf.jobId}</p>
                  <p className="font-semibold text-sm">{wf.machineName}</p>
                  {wf.orderNumber && <p className="text-[10px] text-muted-foreground">Order: {wf.orderNumber}</p>}
                  {wf.assignedTo && <p className="text-[10px] text-muted-foreground">Assigned: {wf.assignedTo}</p>}
                </div>
                <div className="text-right">
                  {wf.priority && (
                    <Badge className={`text-[10px] mb-1 ${wf.priority === "high" ? "bg-red-100 text-red-700" : wf.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
                      {wf.priority}
                    </Badge>
                  )}
                  <p className="text-xs font-bold text-primary">{progress}%</p>
                </div>
              </div>

              <div className="space-y-1.5 my-3">
                {stages.map((stage: string, i: number) => {
                  const isComplete = i < currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <div key={stage} className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isComplete ? "bg-green-500 text-white" : isCurrent ? "bg-primary text-white" : "bg-muted"
                      }`}>
                        {isComplete ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <span className="text-[9px] font-bold">{i + 1}</span>
                        )}
                      </div>
                      <span className={`text-xs ${isCurrent ? "font-semibold text-primary" : isComplete ? "text-green-600" : "text-muted-foreground"}`}>
                        {STAGE_LABELS[stage] || stage}
                      </span>
                      {isCurrent && <Badge className="text-[8px] bg-primary/10 text-primary ml-auto">Current</Badge>}
                    </div>
                  );
                })}
              </div>

              {currentIdx < stages.length - 1 && (
                <Button
                  size="sm"
                  className="w-full text-xs mt-2"
                  onClick={() => advanceStage(wf)}
                  disabled={updateMutation.isPending}
                  data-testid={`button-advance-${wf.id}`}
                >
                  <ChevronRight className="w-3.5 h-3.5 mr-1" />
                  Advance to {STAGE_LABELS[stages[currentIdx + 1]] || stages[currentIdx + 1]}
                </Button>
              )}

              {wf.notes && <p className="text-[10px] text-muted-foreground mt-2 italic">{wf.notes}</p>}
              <NotesSection entityType="production_workflow" entityId={wf.id} authorName={userName} authorId={userId} />
            </CardContent>
          </Card>
        );
      })}

      {activeWorkflows.length === 0 && <EmptyState message="No active production workflows" />}

      {completedWorkflows.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-muted-foreground mt-4">Completed ({completedWorkflows.length})</h2>
          {completedWorkflows.slice(0, 5).map((wf: any) => (
            <Card key={wf.id} className="opacity-70" data-testid={`card-workflow-completed-${wf.id}`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground">{wf.jobId}</p>
                    <p className="text-sm font-medium">{wf.machineName}</p>
                  </div>
                  <Badge className="text-[10px] bg-green-100 text-green-700">Completed</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

function JobWorkTab({ userName, userId }: { userName: string; userId: string | null }) {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: jobs, isLoading } = useQuery<any[]>({
    queryKey: ["/api/engineer/job-works"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/engineer/job-works/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/engineer/job-works"] });
      toast({ title: "Job work updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  if (isLoading) return <LoadingState />;

  const filtered = jobs?.filter((j: any) => statusFilter === "all" || j.status === statusFilter) || [];

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setStatusFilter("all")}
          className={`text-[10px] px-3 py-1.5 rounded-full border whitespace-nowrap ${statusFilter === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          data-testid="filter-all-jobs"
        >
          All ({jobs?.length || 0})
        </button>
        {JOB_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-[10px] px-3 py-1.5 rounded-full border whitespace-nowrap capitalize ${statusFilter === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            data-testid={`filter-job-${s}`}
          >
            {s.replace(/_/g, " ")} ({jobs?.filter((j: any) => j.status === s).length || 0})
          </button>
        ))}
      </div>

      {filtered.map((job: any) => (
        <Card key={job.id} data-testid={`card-job-${job.id}`}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm">{job.vendorName}</p>
                {job.vendorPhone && (
                  <a href={`tel:${job.vendorPhone}`} className="text-xs text-primary flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {job.vendorPhone}
                  </a>
                )}
              </div>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-xs mb-1">{job.workDescription}</p>
            {job.machinePart && <p className="text-xs text-muted-foreground">Part: {job.machinePart}</p>}
            {job.quantity && <p className="text-xs text-muted-foreground">Qty: {job.quantity}</p>}
            {job.cost && <p className="text-xs text-muted-foreground">Cost: Rs {job.cost}</p>}
            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
              <span>Sent: {job.sentDate}</span>
              {job.expectedReturn && <span>Expected: {job.expectedReturn}</span>}
              {job.actualReturn && <span className="text-green-600">Returned: {job.actualReturn}</span>}
            </div>

            <div className="flex gap-1.5 mt-2">
              {JOB_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    const updateData: any = { status: s };
                    if (s === "returned") {
                      updateData.actualReturn = new Date().toISOString().split("T")[0];
                    }
                    updateMutation.mutate({ id: job.id, data: updateData });
                  }}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors capitalize ${
                    job.status === s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"
                  }`}
                  data-testid={`button-job-status-${s}-${job.id}`}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            {job.notes && <p className="text-[10px] text-muted-foreground mt-2 italic">{job.notes}</p>}
            <NotesSection entityType="job_work" entityId={job.id} authorName={userName} authorId={userId} />
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && <EmptyState message="No job work entries found" />}
    </div>
  );
}

function VendorConnectTab({ userName, userId }: { userName: string; userId: string | null }) {
  const { toast } = useToast();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    vendorName: "",
    materialName: "",
    quantity: "",
    unit: "kg",
    urgency: "normal",
    notes: "",
  });

  const { data, isLoading } = useQuery<any>({
    queryKey: ["/api/engineer/vendors"],
  });

  const createRequest = useMutation({
    mutationFn: async (formData: any) => {
      await apiRequest("POST", "/api/engineer/material-requests", {
        ...formData,
        requestedBy: userName,
        status: "pending",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/engineer/vendors"] });
      toast({ title: "Material request submitted" });
      setShowRequestForm(false);
      setRequestForm({ vendorName: "", materialName: "", quantity: "", unit: "kg", urgency: "normal", notes: "" });
    },
    onError: () => toast({ title: "Failed to submit", variant: "destructive" }),
  });

  if (isLoading) return <LoadingState />;

  const suppliers = data?.suppliers || [];
  const materialRequests = data?.materialRequests || [];
  const pendingRequests = materialRequests.filter((r: any) => r.status === "pending");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Vendor Directory ({suppliers.length})</h2>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7"
          onClick={() => setShowRequestForm(!showRequestForm)}
          data-testid="button-raise-request"
        >
          <Plus className="w-3 h-3 mr-1" />
          Raise Request
        </Button>
      </div>

      {showRequestForm && (
        <Card className="border-primary/30" data-testid="card-request-form">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Raise Material Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-[10px]">Vendor Name *</Label>
              <Select value={requestForm.vendorName} onValueChange={(v) => setRequestForm((f) => ({ ...f, vendorName: v }))}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-vendor">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s: any) => (
                    <SelectItem key={s.id} value={s.companyName}>{s.companyName}</SelectItem>
                  ))}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px]">Material Name *</Label>
              <Input
                value={requestForm.materialName}
                onChange={(e) => setRequestForm((f) => ({ ...f, materialName: e.target.value }))}
                className="h-8 text-xs"
                placeholder="e.g. MS Coil, Bearing FAG 6205"
                data-testid="input-material-name"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px]">Quantity *</Label>
                <Input
                  value={requestForm.quantity}
                  onChange={(e) => setRequestForm((f) => ({ ...f, quantity: e.target.value }))}
                  className="h-8 text-xs"
                  placeholder="e.g. 500"
                  data-testid="input-quantity"
                />
              </div>
              <div>
                <Label className="text-[10px]">Unit</Label>
                <Select value={requestForm.unit} onValueChange={(v) => setRequestForm((f) => ({ ...f, unit: v }))}>
                  <SelectTrigger className="h-8 text-xs" data-testid="select-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["kg", "pcs", "meters", "tons", "sets"].map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px]">Urgency</Label>
                <Select value={requestForm.urgency} onValueChange={(v) => setRequestForm((f) => ({ ...f, urgency: v }))}>
                  <SelectTrigger className="h-8 text-xs" data-testid="select-urgency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-[10px]">Notes</Label>
              <Textarea
                value={requestForm.notes}
                onChange={(e) => setRequestForm((f) => ({ ...f, notes: e.target.value }))}
                className="text-xs min-h-[50px]"
                placeholder="Any additional details..."
                data-testid="input-request-notes"
              />
            </div>
            <Button
              className="w-full text-xs"
              onClick={() => createRequest.mutate(requestForm)}
              disabled={!requestForm.vendorName || !requestForm.materialName || !requestForm.quantity || createRequest.isPending}
              data-testid="button-submit-request"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              {createRequest.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </CardContent>
        </Card>
      )}

      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">Pending Requests ({pendingRequests.length})</h3>
          {pendingRequests.map((req: any) => (
            <Card key={req.id} className="mb-2 border-amber-200/50" data-testid={`card-request-${req.id}`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-primary">{req.requestNumber}</p>
                    <p className="text-xs font-medium">{req.materialName}</p>
                    <p className="text-[10px] text-muted-foreground">{req.vendorName} - {req.quantity} {req.unit}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {req.urgency === "urgent" && <Badge className="text-[10px] bg-red-100 text-red-700">Urgent</Badge>}
                    <StatusBadge status={req.status} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {suppliers.map((supplier: any) => (
          <Card key={supplier.id} data-testid={`card-vendor-${supplier.id}`}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {supplier.companyName?.charAt(0) || "V"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{supplier.companyName}</p>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                    {supplier.city && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {supplier.city}, {supplier.state}
                      </span>
                    )}
                    {supplier.businessType && (
                      <span className="flex items-center gap-0.5">
                        <Building2 className="w-3 h-3" /> {supplier.businessType}
                      </span>
                    )}
                  </div>
                  {supplier.phone && (
                    <a href={`tel:${supplier.phone}`} className="text-xs text-primary flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" /> {supplier.phone}
                    </a>
                  )}
                  {supplier.specialization && (
                    <p className="text-[10px] text-muted-foreground mt-1">{supplier.specialization}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {supplier.isVerified && <Badge className="text-[8px] bg-blue-100 text-blue-700">Verified</Badge>}
                    {supplier.isGstVerified && <Badge className="text-[8px] bg-green-100 text-green-700">GST</Badge>}
                    {supplier.isPremium && <Badge className="text-[8px] bg-amber-100 text-amber-700">Premium</Badge>}
                  </div>
                </div>
              </div>
              <NotesSection entityType="vendor" entityId={supplier.id} authorName={userName} authorId={userId} />
            </CardContent>
          </Card>
        ))}
        {suppliers.length === 0 && <EmptyState message="No vendors available" />}
      </div>
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

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="pt-6 pb-6 text-center">
        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export default function EngineerDashboard() {
  const [, setLocation] = useLocation();
  const { user, isEngineer, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isEngineer) {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Engineer Dashboard</h1>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="font-semibold">Access Denied</p>
            <p className="text-sm text-muted-foreground mt-1">You need engineer privileges to access this dashboard.</p>
            <Button onClick={() => setLocation("/auth")} className="mt-4" data-testid="button-login">Login as Engineer</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "orders", label: "Orders", icon: Package },
    { id: "workflow", label: "Workflow", icon: Workflow },
    { id: "jobwork", label: "Job Work", icon: Truck },
    { id: "vendors", label: "Vendors", icon: Users },
  ];

  const handleLogout = async () => {
    await logout.mutateAsync();
    setLocation("/");
  };

  const userName = user?.name || "Engineer";
  const userId = user?.id || null;

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold" data-testid="text-engineer-title">Engineer Dashboard</h1>
            <p className="text-xs text-muted-foreground">Welcome, {userName}</p>
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

      {activeTab === "orders" && <MachineOrdersTab userName={userName} userId={userId} />}
      {activeTab === "workflow" && <ProductionWorkflowTab userName={userName} userId={userId} />}
      {activeTab === "jobwork" && <JobWorkTab userName={userName} userId={userId} />}
      {activeTab === "vendors" && <VendorConnectTab userName={userName} userId={userId} />}
    </div>
  );
}
