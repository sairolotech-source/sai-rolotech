import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { IsoDocument, IsoAudit, Capa } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Plus, Search, FileText, Shield, ClipboardList,
  AlertTriangle, CheckCircle2, Clock, XCircle, Eye,
  ChevronDown, ChevronUp, BookOpen, Target, Calendar,
  Award, TrendingUp, BarChart3
} from "lucide-react";

const ISO_CLAUSES = [
  { id: "4", label: "4 - Context of the Organization" },
  { id: "4.1", label: "4.1 - Understanding the Organization" },
  { id: "4.2", label: "4.2 - Interested Parties" },
  { id: "4.3", label: "4.3 - Scope of QMS" },
  { id: "4.4", label: "4.4 - QMS & Processes" },
  { id: "5", label: "5 - Leadership" },
  { id: "5.1", label: "5.1 - Leadership & Commitment" },
  { id: "5.2", label: "5.2 - Quality Policy" },
  { id: "5.3", label: "5.3 - Roles & Responsibilities" },
  { id: "6", label: "6 - Planning" },
  { id: "6.1", label: "6.1 - Risk & Opportunities" },
  { id: "6.2", label: "6.2 - Quality Objectives" },
  { id: "6.3", label: "6.3 - Planning of Changes" },
  { id: "7", label: "7 - Support" },
  { id: "7.1", label: "7.1 - Resources" },
  { id: "7.2", label: "7.2 - Competence" },
  { id: "7.3", label: "7.3 - Awareness" },
  { id: "7.4", label: "7.4 - Communication" },
  { id: "7.5", label: "7.5 - Documented Information" },
  { id: "8", label: "8 - Operation" },
  { id: "8.1", label: "8.1 - Operational Planning" },
  { id: "8.2", label: "8.2 - Product Requirements" },
  { id: "8.3", label: "8.3 - Design & Development" },
  { id: "8.4", label: "8.4 - External Providers" },
  { id: "8.5", label: "8.5 - Production & Service" },
  { id: "8.6", label: "8.6 - Release of Products" },
  { id: "8.7", label: "8.7 - Nonconforming Outputs" },
  { id: "9", label: "9 - Performance Evaluation" },
  { id: "9.1", label: "9.1 - Monitoring & Measurement" },
  { id: "9.2", label: "9.2 - Internal Audit" },
  { id: "9.3", label: "9.3 - Management Review" },
  { id: "10", label: "10 - Improvement" },
  { id: "10.1", label: "10.1 - General" },
  { id: "10.2", label: "10.2 - Nonconformity & CAPA" },
  { id: "10.3", label: "10.3 - Continual Improvement" },
];

const DOC_CATEGORIES = [
  { value: "quality_manual", label: "Quality Manual" },
  { value: "procedure", label: "Procedure" },
  { value: "work_instruction", label: "Work Instruction" },
  { value: "form", label: "Form/Template" },
  { value: "record", label: "Record" },
  { value: "policy", label: "Policy" },
  { value: "sop", label: "SOP" },
  { value: "checklist", label: "Checklist" },
];

const DEPARTMENTS = [
  "Production", "Quality", "Maintenance", "Design", "Purchase",
  "Store", "HR", "Admin", "Sales", "Dispatch"
];

type Tab = "documents" | "audits" | "capa" | "overview";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: any }> = {
    draft: { color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700", icon: Clock },
    under_review: { color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700", icon: Eye },
    approved: { color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700", icon: CheckCircle2 },
    obsolete: { color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700", icon: XCircle },
    scheduled: { color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700", icon: Calendar },
    in_progress: { color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700", icon: Clock },
    completed: { color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700", icon: CheckCircle2 },
    cancelled: { color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700", icon: XCircle },
    open: { color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700", icon: AlertTriangle },
    verified: { color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700", icon: CheckCircle2 },
    closed: { color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700", icon: XCircle },
  };
  const c = config[status] || config.draft;
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`text-[10px] gap-1 ${c.color}`}>
      <Icon className="w-3 h-3" />
      {status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
    </Badge>
  );
}

function OverviewTab({ docs, audits, capaList }: { docs: IsoDocument[]; audits: IsoAudit[]; capaList: Capa[] }) {
  const approvedDocs = docs.filter(d => d.status === "approved").length;
  const totalDocs = docs.length;
  const upcomingAudits = audits.filter(a => a.status === "scheduled").length;
  const openCapas = capaList.filter(c => c.status === "open" || c.status === "in_progress").length;
  const completedAudits = audits.filter(a => a.status === "completed").length;

  const clauseCoverage = new Set(docs.map(d => d.isoClause.split(".")[0]));
  const mainClauses = ["4", "5", "6", "7", "8", "9", "10"];
  const coveragePercent = Math.round((clauseCoverage.size / mainClauses.length) * 100);

  return (
    <div className="space-y-3">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-xs">ISO 9001:2015 Compliance Dashboard</h3>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Quality Management System for roll forming machine manufacturing. Track document control, internal audits, and corrective/preventive actions.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <FileText className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold" data-testid="text-iso-total-docs">{totalDocs}</p>
            <p className="text-[10px] text-muted-foreground">Total Documents</p>
            <p className="text-[10px] text-green-600 dark:text-green-400">{approvedDocs} Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <BarChart3 className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold" data-testid="text-iso-coverage">{coveragePercent}%</p>
            <p className="text-[10px] text-muted-foreground">Clause Coverage</p>
            <p className="text-[10px] text-muted-foreground">{clauseCoverage.size}/7 Main Clauses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <ClipboardList className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <p className="text-lg font-bold" data-testid="text-iso-audits">{audits.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Audits</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400">{upcomingAudits} Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-red-500" />
            <p className="text-lg font-bold" data-testid="text-iso-open-capas">{openCapas}</p>
            <p className="text-[10px] text-muted-foreground">Open CAPAs</p>
            <p className="text-[10px] text-muted-foreground">{capaList.length} Total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-3 pb-3">
          <h3 className="font-semibold text-xs mb-2 flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            Clause Coverage Map
          </h3>
          <div className="space-y-1.5">
            {mainClauses.map(clause => {
              const hasDoc = clauseCoverage.has(clause);
              const clauseLabel = ISO_CLAUSES.find(c => c.id === clause)?.label || clause;
              return (
                <div key={clause} className="flex items-center gap-2" data-testid={`row-clause-${clause}`}>
                  {hasDoc ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <span className={`text-[11px] ${hasDoc ? "text-foreground" : "text-muted-foreground"}`}>
                    {clauseLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentsTab({ isAdmin }: { isAdmin: boolean }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [title, setTitle] = useState("");
  const [isoClause, setIsoClause] = useState("");
  const [category, setCategory] = useState("procedure");
  const [description, setDescription] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [nextReviewDate, setNextReviewDate] = useState("");

  const { data: docs = [], isLoading } = useQuery<IsoDocument[]>({
    queryKey: ["/api/iso-documents"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/iso-documents", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/iso-documents"] });
      toast({ title: "Document Created", description: "ISO document registered successfully" });
      setShowForm(false);
      setTitle(""); setDescription(""); setApprovedBy(""); setEffectiveDate(""); setNextReviewDate("");
    },
    onError: () => toast({ title: "Error", description: "Failed to create document", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/iso-documents/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/iso-documents"] });
      toast({ title: "Updated", description: "Document status updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/iso-documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/iso-documents"] });
      toast({ title: "Deleted", description: "Document removed" });
    },
  });

  const filtered = docs.filter(doc => {
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase()) && !doc.documentNumber.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory !== "all" && doc.category !== filterCategory) return false;
    if (filterStatus !== "all" && doc.status !== filterStatus) return false;
    return true;
  });

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-md" />)}</div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
            data-testid="input-search-iso-docs"
          />
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowForm(!showForm)} data-testid="button-new-iso-doc">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {[{ value: "all", label: "All" }, ...DOC_CATEGORIES].map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            className={`text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap border transition-colors ${
              filterCategory === cat.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-card-border text-muted-foreground"
            }`}
            data-testid={`filter-iso-cat-${cat.value}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {["all", "draft", "under_review", "approved", "obsolete"].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap border transition-colors ${
              filterStatus === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-card-border text-muted-foreground"
            }`}
            data-testid={`filter-iso-status-${s}`}
          >
            {s === "all" ? "All Status" : s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-3 pb-3 space-y-2">
            <h3 className="font-semibold text-xs">Register ISO Document</h3>
            <Input placeholder="Document Title *" value={title} onChange={e => setTitle(e.target.value)} className="h-8 text-xs" data-testid="input-iso-doc-title" />
            <Select value={isoClause} onValueChange={setIsoClause}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-iso-clause">
                <SelectValue placeholder="ISO Clause *" />
              </SelectTrigger>
              <SelectContent>
                {ISO_CLAUSES.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-iso-doc-category">
                <SelectValue placeholder="Document Type *" />
              </SelectTrigger>
              <SelectContent>
                {DOC_CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="text-xs min-h-[60px]" data-testid="input-iso-doc-desc" />
            <Input placeholder="Approved By" value={approvedBy} onChange={e => setApprovedBy(e.target.value)} className="h-8 text-xs" data-testid="input-iso-doc-approved" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">Effective Date</label>
                <Input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} className="h-8 text-xs" data-testid="input-iso-doc-effective" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Next Review</label>
                <Input type="date" value={nextReviewDate} onChange={e => setNextReviewDate(e.target.value)} className="h-8 text-xs" data-testid="input-iso-doc-review" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="flex-1"
                disabled={!title || !isoClause || createMutation.isPending}
                onClick={() => createMutation.mutate({
                  title, isoClause, category, description: description || undefined,
                  approvedBy: approvedBy || undefined, effectiveDate: effectiveDate || undefined,
                  nextReviewDate: nextReviewDate || undefined,
                })}
                data-testid="button-submit-iso-doc"
              >
                {createMutation.isPending ? "Creating..." : "Create Document"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)} data-testid="button-cancel-iso-doc">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground" data-testid="text-no-iso-docs">No ISO documents found</p>
          </CardContent>
        </Card>
      ) : (
        filtered.map(doc => (
          <Card key={doc.id} data-testid={`card-iso-doc-${doc.id}`}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground font-mono">{doc.documentNumber}</p>
                  <h4 className="font-semibold text-xs truncate">{doc.title}</h4>
                </div>
                <StatusBadge status={doc.status} />
              </div>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                <Badge variant="outline" className="text-[9px]">
                  <BookOpen className="w-2.5 h-2.5 mr-0.5" />
                  Clause {doc.isoClause}
                </Badge>
                <Badge variant="outline" className="text-[9px]">
                  {DOC_CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}
                </Badge>
                <Badge variant="outline" className="text-[9px]">Rev. {doc.revision}</Badge>
              </div>
              {doc.description && <p className="text-[10px] text-muted-foreground line-clamp-2 mb-1.5">{doc.description}</p>}
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                {doc.approvedBy && <span>Approved: {doc.approvedBy}</span>}
                {doc.effectiveDate && <span>Effective: {doc.effectiveDate}</span>}
                {doc.nextReviewDate && <span>Review: {doc.nextReviewDate}</span>}
              </div>
              {isAdmin && (
                <div className="flex gap-1.5 mt-2 pt-2 border-t border-card-border">
                  {doc.status === "draft" && (
                    <Button size="sm" variant="outline" className="text-[10px] h-6 px-2"
                      onClick={() => updateMutation.mutate({ id: doc.id, data: { status: "under_review" } })}
                      data-testid={`button-review-${doc.id}`}>
                      Send for Review
                    </Button>
                  )}
                  {doc.status === "under_review" && (
                    <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 text-green-600"
                      onClick={() => updateMutation.mutate({ id: doc.id, data: { status: "approved" } })}
                      data-testid={`button-approve-${doc.id}`}>
                      Approve
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 text-red-600"
                    onClick={() => deleteMutation.mutate(doc.id)}
                    data-testid={`button-delete-iso-${doc.id}`}>
                    Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function AuditsTab({ isAdmin }: { isAdmin: boolean }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [auditType, setAuditType] = useState("internal");
  const [auditorName, setAuditorName] = useState("");
  const [department, setDepartment] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: audits = [], isLoading } = useQuery<IsoAudit[]>({
    queryKey: ["/api/iso-audits"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/iso-audits", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/iso-audits"] });
      toast({ title: "Audit Scheduled", description: "Internal audit created successfully" });
      setShowForm(false);
      setAuditorName(""); setDepartment(""); setScheduledDate(""); setNotes("");
    },
    onError: () => toast({ title: "Error", description: "Failed to create audit", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/iso-audits/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/iso-audits"] });
      toast({ title: "Updated", description: "Audit status updated" });
    },
  });

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-md" />)}</div>;

  return (
    <div className="space-y-3">
      {isAdmin && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowForm(!showForm)} data-testid="button-new-audit">
            <Plus className="w-4 h-4 mr-1" />
            Schedule Audit
          </Button>
        </div>
      )}

      {showForm && (
        <Card>
          <CardContent className="pt-3 pb-3 space-y-2">
            <h3 className="font-semibold text-xs">Schedule Internal Audit</h3>
            <Select value={auditType} onValueChange={setAuditType}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-audit-type">
                <SelectValue placeholder="Audit Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Audit</SelectItem>
                <SelectItem value="external">External Audit</SelectItem>
                <SelectItem value="surveillance">Surveillance Audit</SelectItem>
                <SelectItem value="certification">Certification Audit</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Auditor Name *" value={auditorName} onChange={e => setAuditorName(e.target.value)} className="h-8 text-xs" data-testid="input-auditor-name" />
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-audit-dept">
                <SelectValue placeholder="Department *" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <label className="text-[10px] text-muted-foreground">Scheduled Date *</label>
              <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="h-8 text-xs" data-testid="input-audit-date" />
            </div>
            <Textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} className="text-xs min-h-[60px]" data-testid="input-audit-notes" />
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="flex-1"
                disabled={!auditorName || !department || !scheduledDate || createMutation.isPending}
                onClick={() => createMutation.mutate({
                  auditType, auditorName, department, scheduledDate,
                  notes: notes || undefined,
                })}
                data-testid="button-submit-audit"
              >
                {createMutation.isPending ? "Scheduling..." : "Schedule Audit"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)} data-testid="button-cancel-audit">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {audits.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground" data-testid="text-no-audits">No audits scheduled yet</p>
          </CardContent>
        </Card>
      ) : (
        audits.map(audit => (
          <Card key={audit.id} data-testid={`card-audit-${audit.id}`}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <p className="text-[10px] text-muted-foreground font-mono">{audit.auditNumber}</p>
                  <h4 className="font-semibold text-xs">{audit.department} Department</h4>
                </div>
                <StatusBadge status={audit.status} />
              </div>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                <Badge variant="outline" className="text-[9px]">
                  {audit.auditType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <Badge variant="outline" className="text-[9px]">
                  <Calendar className="w-2.5 h-2.5 mr-0.5" />
                  {audit.scheduledDate}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">Auditor: {audit.auditorName}</p>
              {audit.status === "completed" && (
                <div className="flex gap-3 mt-1.5 text-[10px]">
                  <span className="text-red-600 dark:text-red-400">NC: {audit.nonConformities || 0}</span>
                  <span className="text-amber-600 dark:text-amber-400">OBS: {audit.observations || 0}</span>
                  <span className="text-green-600 dark:text-green-400">OFI: {audit.improvements || 0}</span>
                </div>
              )}
              {audit.notes && <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{audit.notes}</p>}
              {isAdmin && audit.status === "scheduled" && (
                <div className="flex gap-1.5 mt-2 pt-2 border-t border-card-border">
                  <Button size="sm" variant="outline" className="text-[10px] h-6 px-2"
                    onClick={() => updateMutation.mutate({ id: audit.id, data: { status: "in_progress" } })}
                    data-testid={`button-start-audit-${audit.id}`}>
                    Start Audit
                  </Button>
                  <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 text-red-600"
                    onClick={() => updateMutation.mutate({ id: audit.id, data: { status: "cancelled" } })}
                    data-testid={`button-cancel-audit-${audit.id}`}>
                    Cancel
                  </Button>
                </div>
              )}
              {isAdmin && audit.status === "in_progress" && (
                <div className="flex gap-1.5 mt-2 pt-2 border-t border-card-border">
                  <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 text-green-600"
                    onClick={() => updateMutation.mutate({
                      id: audit.id,
                      data: { status: "completed", completedDate: new Date().toISOString().split("T")[0] },
                    })}
                    data-testid={`button-complete-audit-${audit.id}`}>
                    Mark Complete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function CapaTab({ isAdmin }: { isAdmin: boolean }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("corrective");
  const [source, setSource] = useState("audit");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isoClause, setIsoClause] = useState("");
  const [priority, setPriority] = useState("medium");

  const { data: capaList = [], isLoading } = useQuery<Capa[]>({
    queryKey: ["/api/capas"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/capas", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/capas"] });
      toast({ title: "CAPA Created", description: "Corrective/Preventive action initiated" });
      setShowForm(false);
      setDescription(""); setAssignedTo(""); setTargetDate("");
    },
    onError: () => toast({ title: "Error", description: "Failed to create CAPA", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/capas/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/capas"] });
      toast({ title: "Updated", description: "CAPA status updated" });
    },
  });

  const priorityColor: Record<string, string> = {
    low: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700",
    high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700",
    critical: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700",
  };

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-md" />)}</div>;

  return (
    <div className="space-y-3">
      {isAdmin && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowForm(!showForm)} data-testid="button-new-capa">
            <Plus className="w-4 h-4 mr-1" />
            New CAPA
          </Button>
        </div>
      )}

      {showForm && (
        <Card>
          <CardContent className="pt-3 pb-3 space-y-2">
            <h3 className="font-semibold text-xs">Initiate CAPA</h3>
            <div className="grid grid-cols-2 gap-2">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-capa-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-capa-source">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audit">Internal Audit</SelectItem>
                  <SelectItem value="customer_complaint">Customer Complaint</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="process_deviation">Process Deviation</SelectItem>
                  <SelectItem value="management_review">Management Review</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Description of nonconformity *" value={description} onChange={e => setDescription(e.target.value)} className="text-xs min-h-[60px]" data-testid="input-capa-desc" />
            <Input placeholder="Assigned To *" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="h-8 text-xs" data-testid="input-capa-assigned" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">Target Date *</label>
                <Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="h-8 text-xs" data-testid="input-capa-target" />
              </div>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-8 text-xs" data-testid="select-capa-priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={isoClause} onValueChange={setIsoClause}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-capa-clause">
                <SelectValue placeholder="Related ISO Clause (optional)" />
              </SelectTrigger>
              <SelectContent>
                {ISO_CLAUSES.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="flex-1"
                disabled={!description || !assignedTo || !targetDate || createMutation.isPending}
                onClick={() => createMutation.mutate({
                  type, source, description, assignedTo, targetDate,
                  isoClause: isoClause || undefined, priority,
                })}
                data-testid="button-submit-capa"
              >
                {createMutation.isPending ? "Creating..." : "Create CAPA"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)} data-testid="button-cancel-capa">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {capaList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground" data-testid="text-no-capas">No CAPAs initiated yet</p>
          </CardContent>
        </Card>
      ) : (
        capaList.map(capa => (
          <Card key={capa.id} data-testid={`card-capa-${capa.id}`}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground font-mono">{capa.capaNumber}</p>
                  <h4 className="font-semibold text-xs truncate">{capa.description}</h4>
                </div>
                <StatusBadge status={capa.status} />
              </div>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                <Badge variant="outline" className="text-[9px]">
                  {capa.type.replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <Badge variant="outline" className="text-[9px]">
                  {capa.source.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                <Badge variant="outline" className={`text-[9px] ${priorityColor[capa.priority]}`}>
                  {capa.priority.toUpperCase()}
                </Badge>
                {capa.isoClause && (
                  <Badge variant="outline" className="text-[9px]">
                    <BookOpen className="w-2.5 h-2.5 mr-0.5" />
                    Clause {capa.isoClause}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                <span>Assigned: {capa.assignedTo}</span>
                <span>Target: {capa.targetDate}</span>
                {capa.completedDate && <span>Completed: {capa.completedDate}</span>}
              </div>
              {capa.effectiveness && (
                <Badge variant="outline" className="text-[9px] mt-1.5">
                  Effectiveness: {capa.effectiveness.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              )}
              {isAdmin && (capa.status === "open" || capa.status === "in_progress") && (
                <div className="flex gap-1.5 mt-2 pt-2 border-t border-card-border">
                  {capa.status === "open" && (
                    <Button size="sm" variant="outline" className="text-[10px] h-6 px-2"
                      onClick={() => updateMutation.mutate({ id: capa.id, data: { status: "in_progress" } })}
                      data-testid={`button-start-capa-${capa.id}`}>
                      Start
                    </Button>
                  )}
                  {capa.status === "in_progress" && (
                    <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 text-green-600"
                      onClick={() => updateMutation.mutate({
                        id: capa.id,
                        data: { status: "completed", completedDate: new Date().toISOString().split("T")[0] },
                      })}
                      data-testid={`button-complete-capa-${capa.id}`}>
                      Complete
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default function IsoDocsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: docs = [] } = useQuery<IsoDocument[]>({ queryKey: ["/api/iso-documents"] });
  const { data: audits = [] } = useQuery<IsoAudit[]>({ queryKey: ["/api/iso-audits"] });
  const { data: capaList = [] } = useQuery<Capa[]>({ queryKey: ["/api/capas"] });

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: TrendingUp },
    { key: "documents", label: "Documents", icon: FileText },
    { key: "audits", label: "Audits", icon: ClipboardList },
    { key: "capa", label: "CAPA", icon: AlertTriangle },
  ];

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-20 bg-background border-b border-card-border px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate("/")} data-testid="button-iso-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-sm flex items-center gap-1.5" data-testid="text-iso-page-title">
              <Shield className="w-4 h-4 text-primary" />
              ISO 9001:2015
            </h1>
            <p className="text-[10px] text-muted-foreground">Quality Management System</p>
          </div>
        </div>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-md font-medium transition-colors ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              data-testid={`tab-iso-${t.key}`}
            >
              <t.icon className="w-3 h-3" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        {tab === "overview" && <OverviewTab docs={docs} audits={audits} capaList={capaList} />}
        {tab === "documents" && <DocumentsTab isAdmin={isAdmin} />}
        {tab === "audits" && <AuditsTab isAdmin={isAdmin} />}
        {tab === "capa" && <CapaTab isAdmin={isAdmin} />}
      </div>
    </div>
  );
}
