import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import type { MachineDocument } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, FileText, Image, File, Upload, Trash2,
  Download, Search, X, Filter
} from "lucide-react";

const categoryLabels: Record<string, string> = {
  drawing: "Machine Drawing",
  manual: "User Manual",
  certificate: "Certificate",
  invoice: "Invoice",
  specification: "Specification",
  other: "Other",
};

const categoryColors: Record<string, string> = {
  drawing: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  manual: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  certificate: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  invoice: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  specification: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  other: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
};

function FileIcon({ fileType }: { fileType: string }) {
  if (fileType === "image") return <Image className="w-5 h-5 text-blue-500" />;
  if (fileType === "pdf") return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "drawing",
    machineCategory: "",
    machineModel: "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("category", formData.category);
      if (formData.machineCategory) fd.append("machineCategory", formData.machineCategory);
      if (formData.machineModel) fd.append("machineModel", formData.machineModel);

      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Document Uploaded", description: "File has been uploaded successfully." });
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <h3 className="font-bold text-sm">Upload Document</h3>
        <div>
          <Label className="text-xs">Title *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. SAI-5.0 Assembly Drawing"
            data-testid="input-doc-title"
          />
        </div>
        <div>
          <Label className="text-xs">Description</Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
            placeholder="Brief description"
            data-testid="input-doc-description"
          />
        </div>
        <div>
          <Label className="text-xs">Document Type *</Label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            data-testid="select-doc-category"
          >
            {Object.entries(categoryLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Machine Category</Label>
            <Input
              value={formData.machineCategory}
              onChange={(e) => setFormData(p => ({ ...p, machineCategory: e.target.value }))}
              placeholder="e.g. Rolling Shutter"
              data-testid="input-doc-machine-cat"
            />
          </div>
          <div>
            <Label className="text-xs">Machine Model</Label>
            <Input
              value={formData.machineModel}
              onChange={(e) => setFormData(p => ({ ...p, machineModel: e.target.value }))}
              placeholder="e.g. SAI-5.0"
              data-testid="input-doc-machine-model"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">File * (PDF, Image, CAD, Doc — Max 10MB)</Label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf,.doc,.docx,.xls,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-xs mt-1 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border file:text-xs"
            data-testid="input-doc-file"
          />
          {file && <p className="text-[10px] text-muted-foreground mt-1">{file.name} — {formatFileSize(file.size)}</p>}
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={!formData.title || !file || mutation.isPending}
            onClick={() => mutation.mutate()}
            data-testid="button-upload-doc"
          >
            <Upload className="w-4 h-4 mr-1" />
            {mutation.isPending ? "Uploading..." : "Upload"}
          </Button>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-upload">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DocumentsPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const { data: documents, isLoading } = useQuery<MachineDocument[]>({
    queryKey: ["/api/documents"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({ title: "Deleted", description: "Document removed." });
    },
  });

  const filtered = (documents || []).filter(doc => {
    if (filterCategory && doc.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return doc.title.toLowerCase().includes(q) ||
        (doc.description || "").toLowerCase().includes(q) ||
        (doc.machineCategory || "").toLowerCase().includes(q) ||
        (doc.machineModel || "").toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation("/")} className="p-1" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-sm" data-testid="text-docs-title">Machine Documents</h1>
          <p className="text-[10px] text-muted-foreground">Drawings, Manuals & Specifications</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowUpload(!showUpload)} data-testid="button-toggle-upload">
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </Button>
        )}
      </div>

      <div className="px-4 pt-4 space-y-3">
        {showUpload && isAdmin && <UploadForm onClose={() => setShowUpload(false)} />}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-docs"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <Button
            size="sm"
            variant={filterCategory === null ? "default" : "outline"}
            onClick={() => setFilterCategory(null)}
            className="shrink-0"
            data-testid="button-doc-filter-all"
          >
            All
          </Button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={filterCategory === key ? "default" : "outline"}
              onClick={() => setFilterCategory(key)}
              className="shrink-0"
              data-testid={`button-doc-filter-${key}`}
            >
              {label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}><CardContent className="pt-3 pb-3"><Skeleton className="h-12 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No documents found</p>
            {isAdmin && <p className="text-xs text-muted-foreground mt-1">Upload machine drawings and documents using the Upload button above.</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(doc => (
              <Card key={doc.id} data-testid={`card-doc-${doc.id}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <FileIcon fileType={doc.fileType} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate" data-testid={`text-doc-title-${doc.id}`}>{doc.title}</h3>
                      {doc.description && <p className="text-[10px] text-muted-foreground truncate">{doc.description}</p>}
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <Badge className={`text-[9px] ${categoryColors[doc.category] || ""}`}>
                          {categoryLabels[doc.category] || doc.category}
                        </Badge>
                        {doc.machineCategory && <Badge variant="outline" className="text-[9px]">{doc.machineCategory}</Badge>}
                        {doc.machineModel && <Badge variant="outline" className="text-[9px]">{doc.machineModel}</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                        <span>{doc.fileName}</span>
                        {doc.fileSize && <span>• {formatFileSize(doc.fileSize)}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8"
                        onClick={() => window.open(doc.filePath, "_blank")}
                        data-testid={`button-download-${doc.id}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-destructive"
                          onClick={() => deleteMutation.mutate(doc.id)}
                          data-testid={`button-delete-doc-${doc.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
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
