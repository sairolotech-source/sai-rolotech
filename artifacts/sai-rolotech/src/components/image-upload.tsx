import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  bucket: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

interface MultiImageUploadProps {
  bucket: string;
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
}

export function ImageUpload({ bucket, value, onChange, label = "Upload Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/upload/${bucket}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }

      const data = await res.json();
      onChange(data.url);
      toast({ title: "Image uploaded!" });
    } catch (err: any) {
      toast({ title: err.message || "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        data-testid="input-file-upload"
      />
      {value && value.startsWith("http") ? (
        <div className="relative w-full h-20 rounded-md overflow-hidden bg-accent mb-1">
          <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
            data-testid="button-remove-image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full text-xs h-7"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        data-testid="button-upload-image"
      >
        {uploading ? (
          <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Uploading...</>
        ) : (
          <><Upload className="w-3 h-3 mr-1" /> {label}</>
        )}
      </Button>
    </div>
  );
}

export function MultiImageUpload({ bucket, values, onChange, label = "Upload Images", max = 5 }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (values.length + files.length > max) {
      toast({ title: `Maximum ${max} images allowed`, variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("files", f));

      const res = await fetch(`/api/upload/${bucket}/multiple`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }

      const data = await res.json();
      onChange([...values, ...data.urls]);
      toast({ title: `${data.urls.length} image(s) uploaded!` });
    } catch (err: any) {
      toast({ title: err.message || "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updated = values.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
        data-testid="input-file-multi-upload"
      />
      {values.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-1.5">
          {values.map((url, i) => (
            <div key={i} className="relative w-14 h-14 rounded-md overflow-hidden bg-accent">
              {url.startsWith("http") ? (
                <img src={url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {values.length < max && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full text-xs h-7"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          data-testid="button-upload-multi-image"
        >
          {uploading ? (
            <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="w-3 h-3 mr-1" /> {label} ({values.length}/{max})</>
          )}
        </Button>
      )}
    </div>
  );
}
