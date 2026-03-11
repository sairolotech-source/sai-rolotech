import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from "wouter";
import type { Quotation } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Plus, Search, FileText, Shield, Send, Eye, Download,
  CheckCircle2, Clock, XCircle, AlertTriangle, Copy, Share2,
  ChevronLeft, ChevronRight, Factory, IndianRupee, Truck,
  Calendar, Building2, Phone, Mail, MapPin, QrCode, Stamp,
  MessageCircle, TrendingUp, Flame, BarChart3
} from "lucide-react";

function formatINR(num: number): string {
  return num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const tierLabels: Record<string, string> = { basic: "Basic", medium: "Medium", advance: "Advance" };
const autoLabels: Record<string, string> = { raw: "Raw", semi: "Semi-Automatic", auto: "Automatic" };

const tierSpecs: Record<string, Record<string, string>> = {
  basic: {
    "Side Plate Thickness": "16mm", "Shaft Diameter": "35mm", "Roller Material": "En8",
    "Motor HP": "5 HP", "Gearbox Type": "Open Box", "Cutting Type": "Punch Scrap",
    "Control Panel": "5 inch Display", "Heat Treatment": "45 HRC", "Finish": "Temper",
    "Bearing": "1pc (NSK)", "Warranty": "1 Year",
  },
  medium: {
    "Side Plate Thickness": "20mm", "Shaft Diameter": "45mm", "Roller Material": "En31",
    "Motor HP": "5 HP", "Gearbox Type": "Helical Reduction 1pc", "Cutting Type": "Ultra Cut",
    "Control Panel": "5 inch Display", "Heat Treatment": "55 HRC", "Finish": "Temper + Nickel",
    "Bearing": "2pc (FLT)", "Warranty": "2 Years",
  },
  advance: {
    "Side Plate Thickness": "25mm", "Shaft Diameter": "50mm", "Roller Material": "D3",
    "Motor HP": "7.5 HP", "Gearbox Type": "Helical Reduction 2pc", "Cutting Type": "Ultra Cut",
    "Control Panel": "7 inch Touch Panel", "Heat Treatment": "60 HRC", "Finish": "Hard Chrome + Polish",
    "Bearing": "2pc FAG (German)", "Warranty": "3+2 = 5 Years",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: any }> = {
    sent: { color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: Send },
    viewed: { color: "bg-amber-500/10 text-amber-600 border-amber-200", icon: Eye },
    downloaded: { color: "bg-purple-500/10 text-purple-600 border-purple-200", icon: Download },
    approved: { color: "bg-green-500/10 text-green-600 border-green-200", icon: CheckCircle2 },
    negotiation: { color: "bg-orange-500/10 text-orange-600 border-orange-200", icon: Flame },
    expired: { color: "bg-red-500/10 text-red-600 border-red-200", icon: XCircle },
  };
  const c = config[status] || config.sent;
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`text-[10px] gap-1 ${c.color}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function QuotationDocument({ quote }: { quote: Quotation }) {
  const [page, setPage] = useState(1);
  const totalPages = 6;
  const createdDate = quote.createdAt ? new Date(quote.createdAt).toLocaleDateString("en-IN") : "";
  const specs = tierSpecs[quote.tier] || tierSpecs.medium;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => setPage(p => p - 1)} data-testid="button-prev-page">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} data-testid="button-next-page">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="border-2 border-primary/20 rounded-lg min-h-[500px]">
        <CardContent className="pt-4 pb-4">
          {page === 1 && (
            <div className="text-center space-y-5" data-testid="quote-page-1">
              <div className="border-b-2 border-primary/30 pb-4 mb-4">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Factory className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-lg font-bold text-primary tracking-wide">SAI ROLOTECH</h1>
                <p className="text-[10px] text-muted-foreground tracking-widest mt-1">INDUSTRIAL ROLL FORMING MACHINERY MANUFACTURER</p>
                <p className="text-[9px] text-primary/70 mt-2 italic">Engineering Strength &bull; Precision &bull; Performance</p>
              </div>

              <div className="bg-primary/5 rounded-md p-4 text-left space-y-2">
                <h2 className="text-sm font-bold text-center mb-3">QUOTATION</h2>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Quotation No:</span>
                    <p className="font-bold text-primary" data-testid="text-quote-number">{quote.quotationNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{createdDate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valid Till:</span>
                    <p className="font-medium">{quote.validUntil}</p>
                  </div>
                  {quote.projectName && (
                    <div>
                      <span className="text-muted-foreground">Project:</span>
                      <p className="font-medium">{quote.projectName}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-left p-3 border rounded-md space-y-1.5">
                <p className="text-[10px] text-muted-foreground font-semibold">PREPARED FOR</p>
                <p className="text-sm font-bold" data-testid="text-customer-name">{quote.customerName}</p>
                {quote.companyName && <p className="text-xs font-medium text-foreground/80">{quote.companyName}</p>}
                <div className="space-y-0.5">
                  {quote.customerPhone && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span data-testid="text-customer-phone">{quote.customerPhone}</span>
                    </div>
                  )}
                  {quote.customerEmail && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span data-testid="text-customer-email">{quote.customerEmail}</span>
                    </div>
                  )}
                  {quote.customerAddress && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span data-testid="text-customer-address">{quote.customerAddress}</span>
                    </div>
                  )}
                  {quote.gstNo && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      <span data-testid="text-customer-gst">GSTIN: {quote.gstNo}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-left p-3 border rounded-md space-y-0.5">
                <p className="text-[10px] text-muted-foreground font-semibold">CONTACT</p>
                <p className="text-[10px]">Ground Floor Mdk052, Udyog Nagar, Mundka, New Delhi 110041</p>
                <p className="text-[10px]">+91 9090-486-262 | sairolotech@gmail.com</p>
              </div>
            </div>
          )}

          {page === 2 && (
            <div className="space-y-4" data-testid="quote-page-2">
              <h2 className="text-sm font-bold border-b pb-2 flex items-center gap-1.5">
                <Factory className="w-4 h-4 text-primary" />
                MACHINE CONFIGURATION
              </h2>

              <div className="space-y-2.5">
                {[
                  { label: "Machine Type", value: `${quote.machineCategory} Roll Forming Machine` },
                  { label: "Profile", value: quote.profileType },
                  { label: "Model / Tier", value: tierLabels[quote.tier] || quote.tier },
                  { label: "Automation", value: autoLabels[quote.automation] || quote.automation },
                  { label: "Stations / Rolls", value: `${quote.rolls}` },
                  { label: "Gearbox", value: specs["Gearbox Type"] },
                  ...(quote.cuttingType ? [{ label: "Cutting System", value: quote.cuttingType }] : []),
                  ...(quote.decoilerType ? [{ label: "Decoiler", value: quote.decoilerType }] : []),
                  ...(quote.machineModel ? [{ label: "Machine Model", value: quote.machineModel }] : []),
                  { label: "Quantity", value: `${quote.quantity}` },
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between text-xs py-1.5 px-2 rounded ${i % 2 === 0 ? "bg-muted/30" : ""}`}>
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-[10px] font-semibold text-green-700 dark:text-green-400 mb-2">SAFETY FEATURES INCLUDED</p>
                <div className="grid grid-cols-1 gap-1">
                  {["Side Safety Cover", "Emergency Stop Button", "Guard Protection", "Overload Protection"].map(f => (
                    <div key={f} className="flex items-center gap-1.5 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {page === 3 && (
            <div className="space-y-4" data-testid="quote-page-3">
              <h2 className="text-sm font-bold border-b pb-2 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-primary" />
                COMMERCIAL BREAKDOWN
              </h2>

              <div className="p-2.5 bg-muted/20 rounded-md text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bill To:</span>
                  <span className="font-semibold">{quote.customerName}{quote.companyName ? ` (${quote.companyName})` : ""}</span>
                </div>
                {quote.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{quote.customerPhone}</span>
                  </div>
                )}
                {quote.customerAddress && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="text-right max-w-[60%]">{quote.customerAddress}</span>
                  </div>
                )}
                {quote.gstNo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GSTIN:</span>
                    <span className="font-mono font-semibold" data-testid="text-bill-gst">{quote.gstNo}</span>
                  </div>
                )}
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-primary/10">
                      <th className="text-left p-2 font-semibold">Description</th>
                      <th className="text-right p-2 font-semibold">Amount (Rs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-2">Base Machine Price ({tierLabels[quote.tier]} / {autoLabels[quote.automation]})</td>
                      <td className="p-2 text-right font-medium">{formatINR(quote.singlePrice)}</td>
                    </tr>
                    {quote.quantity > 1 && (
                      <tr className="border-t">
                        <td className="p-2">Quantity ({quote.quantity} machines)</td>
                        <td className="p-2 text-right font-medium">{formatINR(quote.totalBeforeDiscount)}</td>
                      </tr>
                    )}
                    {(quote.dealerMargin || 0) > 0 && (
                      <tr className="border-t">
                        <td className="p-2">Dealer Margin</td>
                        <td className="p-2 text-right font-medium">{formatINR(quote.dealerMargin || 0)}</td>
                      </tr>
                    )}
                    {(quote.discountAmount || 0) > 0 && (
                      <tr className="border-t text-green-600 dark:text-green-400">
                        <td className="p-2">Discount ({quote.discountPercent}%)</td>
                        <td className="p-2 text-right font-medium">-{formatINR(quote.discountAmount || 0)}</td>
                      </tr>
                    )}
                    <tr className="border-t bg-muted/20">
                      <td className="p-2 font-semibold">Subtotal</td>
                      <td className="p-2 text-right font-semibold">{formatINR(quote.subtotal)}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2">GST @ 18%</td>
                      <td className="p-2 text-right font-medium">{formatINR(quote.gstAmount)}</td>
                    </tr>
                    <tr className="border-t bg-primary/10">
                      <td className="p-2 font-bold text-sm">GRAND TOTAL</td>
                      <td className="p-2 text-right font-bold text-sm text-primary" data-testid="text-quote-grand-total">Rs {formatINR(quote.grandTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {quote.addOns && (
                <div className="p-2.5 bg-muted/20 rounded-md">
                  <p className="text-[10px] font-semibold mb-1">ADD-ONS / NOTES</p>
                  <p className="text-[10px] text-muted-foreground">{quote.addOns}</p>
                </div>
              )}
            </div>
          )}

          {page === 4 && (
            <div className="space-y-4" data-testid="quote-page-4">
              <h2 className="text-sm font-bold border-b pb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                TECHNICAL SPECIFICATIONS
              </h2>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-primary/10">
                      <th className="text-left p-2 font-semibold">Parameter</th>
                      <th className="text-right p-2 font-semibold">Specification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(specs).map(([key, val], i) => (
                      <tr key={key} className={`border-t ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="p-2 text-muted-foreground">{key}</td>
                        <td className="p-2 text-right font-medium">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-400">QUALITY ASSURANCE</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  All machines undergo 37-point quality inspection before dispatch. ISO 9001:2015 compliant manufacturing processes.
                </p>
              </div>
            </div>
          )}

          {page === 5 && (
            <div className="space-y-4" data-testid="quote-page-5">
              <h2 className="text-sm font-bold border-b pb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary" />
                DELIVERY & PAYMENT TERMS
              </h2>

              <div className="p-3 bg-muted/20 rounded-md space-y-3">
                <div>
                  <p className="text-[10px] font-semibold text-primary mb-1">DELIVERY TIMELINE</p>
                  <p className="text-xs font-bold">{quote.deliveryDays} Working Days from Advance Payment</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Subject to confirmation of order and advance payment receipt</p>
                </div>
              </div>

              <div className="p-3 bg-muted/20 rounded-md space-y-2">
                <p className="text-[10px] font-semibold text-primary mb-1">PAYMENT TERMS</p>
                {[
                  { pct: "50%", desc: "Advance with Purchase Order" },
                  { pct: "30%", desc: "Before Dispatch (After Inspection)" },
                  { pct: "20%", desc: "After Successful Trial Run at Site" },
                ].map((term, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-primary">{term.pct}</span>
                    </div>
                    <p className="text-xs">{term.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-muted/20 rounded-md">
                <p className="text-[10px] font-semibold text-primary mb-1">QUOTATION VALIDITY</p>
                <p className="text-xs font-medium">Valid until {quote.validUntil}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Prices subject to change after validity period. Steel rate fluctuations may apply.</p>
              </div>

              <div className="p-3 bg-muted/20 rounded-md space-y-1">
                <p className="text-[10px] font-semibold text-primary mb-1">TERMS & CONDITIONS</p>
                {[
                  "GST 18% applicable on total value",
                  "Packaging & transportation extra",
                  "Trial material to be arranged by buyer",
                  "Installation guidance provided free of cost",
                  "Warranty as per machine tier selected",
                ].map((t, i) => (
                  <p key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                    <span className="text-primary mt-0.5">•</span> {t}
                  </p>
                ))}
              </div>
            </div>
          )}

          {page === 6 && (
            <div className="space-y-5" data-testid="quote-page-6">
              <h2 className="text-sm font-bold border-b pb-2 flex items-center gap-1.5">
                <Stamp className="w-4 h-4 text-primary" />
                BANK DETAILS & AUTHORIZATION
              </h2>

              <div className="p-3 bg-muted/20 rounded-md space-y-1.5">
                <p className="text-[10px] font-semibold text-primary">BANK DETAILS</p>
                {[
                  { l: "Account Name", v: "SAI ROLOTECH" },
                  { l: "Bank", v: "State Bank of India" },
                  { l: "Account No", v: "XXXX XXXX XXXX" },
                  { l: "IFSC Code", v: "SBIN0XXXXXX" },
                  { l: "Branch", v: "Mundka Industrial Area, Delhi" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{row.l}:</span>
                    <span className="font-medium">{row.v}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-8 h-8 mx-auto text-muted-foreground/40" />
                    <p className="text-[8px] text-muted-foreground mt-1">QR Code</p>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-muted/20 rounded-md text-[10px] space-y-0.5 mb-2">
                <p className="font-semibold text-primary mb-1">CUSTOMER DETAILS</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span className="font-medium">{quote.customerName}</span></div>
                {quote.companyName && <div className="flex justify-between"><span className="text-muted-foreground">Company:</span><span className="font-medium">{quote.companyName}</span></div>}
                {quote.customerPhone && <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span><span>{quote.customerPhone}</span></div>}
                {quote.customerEmail && <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span>{quote.customerEmail}</span></div>}
                {quote.customerAddress && <div className="flex justify-between"><span className="text-muted-foreground">Address:</span><span className="text-right max-w-[55%]">{quote.customerAddress}</span></div>}
                {quote.gstNo && <div className="flex justify-between"><span className="text-muted-foreground">GSTIN:</span><span className="font-mono font-semibold">{quote.gstNo}</span></div>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border-t-2 border-primary/30 pt-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-4">For SAI ROLOTECH</p>
                  <div className="h-10 border-b border-dashed border-muted-foreground/30 mb-1" />
                  <p className="text-[10px] font-semibold">Authorized Signatory</p>
                </div>
                <div className="border-t-2 border-primary/30 pt-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-4">For {quote.companyName || quote.customerName}</p>
                  <div className="h-10 border-b border-dashed border-muted-foreground/30 mb-1" />
                  <p className="text-[10px] font-semibold">Signature & Stamp</p>
                </div>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-[8px] text-muted-foreground italic">This is a computer-generated document. No physical signature required for digital acceptance.</p>
                <p className="text-[8px] text-muted-foreground mt-0.5">{quote.quotationNumber} | Generated on {createdDate}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`flex-1 h-1.5 rounded-full transition-colors ${page === i + 1 ? "bg-primary" : "bg-muted"}`}
            data-testid={`dot-page-${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function QuoteViewer() {
  const { toast } = useToast();
  const [, params] = useRoute("/quote/:number");
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const number = params?.number || "";

  const { data: quote, isLoading, error } = useQuery<Quotation>({
    queryKey: ["/api/quotations/view", number],
    queryFn: async () => {
      const res = await apiRequest("POST", `/api/quotations/view/${number}`, { code });
      return res.json();
    },
    enabled: verified && !!number && !!code,
    retry: false,
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/quotations/${number}/download`, { code });
    },
    onSuccess: () => toast({ title: "Downloaded", description: "Quotation marked as downloaded" }),
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/quotations/${number}/approve`, { code });
    },
    onSuccess: () => {
      toast({ title: "Approved!", description: "Quotation approved successfully. Our team will contact you." });
      queryClient.invalidateQueries({ queryKey: ["/api/quotations/view", number, code] });
    },
  });

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-bold text-lg">SAI ROLOTECH</h1>
              <p className="text-xs text-muted-foreground mt-1">Secure Quotation Portal</p>
              <p className="text-sm font-mono mt-2 text-primary" data-testid="text-quote-ref">{number}</p>
            </div>
            <div>
              <Label className="text-xs">Access Code</Label>
              <Input
                type="text"
                placeholder="Enter your access code"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="text-center text-lg tracking-widest"
                data-testid="input-access-code"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-center">Enter the code shared with you to view this quotation</p>
            </div>
            <Button className="w-full" disabled={code.length < 4} onClick={() => setVerified(true)} data-testid="button-verify-code">
              View Quotation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) return (
    <div className="p-4 space-y-3">
      <Skeleton className="h-12" />
      <Skeleton className="h-[500px]" />
    </div>
  );

  if (error || !quote) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card>
        <CardContent className="pt-6 text-center">
          <XCircle className="w-10 h-10 mx-auto mb-2 text-red-500" />
          <h2 className="font-bold text-sm mb-1">Invalid Access</h2>
          <p className="text-xs text-muted-foreground mb-3">Incorrect access code or quotation not found.</p>
          <Button variant="outline" onClick={() => { setVerified(false); setCode(""); }} data-testid="button-try-again">Try Again</Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="pb-24 max-w-lg mx-auto">
      <div className="sticky top-0 z-20 bg-background border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-sm" data-testid="text-viewer-title">{quote.quotationNumber}</h1>
          <p className="text-[10px] text-muted-foreground">Sai Rolotech Quotation</p>
        </div>
        <StatusBadge status={quote.status} />
      </div>

      <div className="px-4 pt-3">
        <QuotationDocument quote={quote as Quotation} />

        <div className="mt-4 space-y-2">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => downloadMutation.mutate()}
            disabled={downloadMutation.isPending}
            data-testid="button-download-quote"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Quotation
          </Button>

          {quote.status !== "approved" && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              data-testid="button-approve-quote"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {approveMutation.isPending ? "Approving..." : "Approve & Accept Quotation"}
            </Button>
          )}

          {quote.status === "approved" && (
            <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200">
              <CardContent className="pt-3 pb-3 text-center">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-green-600" />
                <p className="text-xs font-semibold text-green-700 dark:text-green-400">Quotation Approved</p>
                <p className="text-[10px] text-muted-foreground">Our team will contact you to proceed.</p>
              </CardContent>
            </Card>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(`https://wa.me/919090486262?text=${encodeURIComponent(`Hi, regarding quotation ${quote.quotationNumber}. I would like to discuss further.`)}`, "_blank")}
            data-testid="button-quote-whatsapp"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Discuss on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}

const pricingNumeric: Record<string, Record<number, { raw: number; semi: number; auto: number }>> = {
  basic: {
    6: { raw: 240000, semi: 280000, auto: 480000 }, 7: { raw: 280000, semi: 320000, auto: 520000 },
    8: { raw: 320000, semi: 360000, auto: 560000 }, 9: { raw: 360000, semi: 400000, auto: 600000 },
    10: { raw: 400000, semi: 440000, auto: 640000 }, 11: { raw: 440000, semi: 480000, auto: 680000 },
    12: { raw: 480000, semi: 520000, auto: 720000 }, 13: { raw: 520000, semi: 560000, auto: 760000 },
  },
  medium: {
    6: { raw: 285000, semi: 330000, auto: 530000 }, 7: { raw: 335000, semi: 380000, auto: 580000 },
    8: { raw: 385000, semi: 430000, auto: 630000 }, 9: { raw: 430000, semi: 475000, auto: 675000 },
    10: { raw: 480000, semi: 525000, auto: 725000 }, 11: { raw: 530000, semi: 575000, auto: 775000 },
    12: { raw: 580000, semi: 625000, auto: 825000 }, 13: { raw: 530000, semi: 675000, auto: 875000 },
  },
  advance: {
    6: { raw: 325000, semi: 370000, auto: 570000 }, 7: { raw: 380000, semi: 425000, auto: 625000 },
    8: { raw: 435000, semi: 480000, auto: 680000 }, 9: { raw: 485000, semi: 530000, auto: 730000 },
    10: { raw: 540000, semi: 585000, auto: 785000 }, 11: { raw: 595000, semi: 640000, auto: 840000 },
    12: { raw: 650000, semi: 695000, auto: 895000 }, 13: { raw: 705000, semi: 750000, auto: 950000 },
  },
};

const machineCategories = [
  { category: "Rolling Shutter", profiles: ["Shutter Patti", "Guide Rail", "Bottom Lock"], cuttingOptions: ["Punch Scrap", "Ultra Cut"], decoilerOptions: ["Vertical", "Horizontal"] },
  { category: "False Ceiling", profiles: ["POP Channel", "Main Channel", "Furring Channel", "T-Grid", "Cross Tee", "Ceiling Angle"], cuttingOptions: ["Ultra Cut"], decoilerOptions: ["Horizontal", "Horizontal (Advanced)"] },
  { category: "Drywall & Partition", profiles: ["C-Channel / Stud", "Track", "Partition Section"], cuttingOptions: ["Punch Scrap", "Ultra Cut"], decoilerOptions: ["Horizontal"] },
  { category: "Structural", profiles: ["Z-Purlin", "C-Purlin", "Sigma Purlin"], cuttingOptions: ["Hydraulic Cut"], decoilerOptions: ["Horizontal (5 Ton)", "Horizontal (10 Ton)"] },
  { category: "Door & Window", profiles: ["Door Frame", "Window Section"], cuttingOptions: ["Ultra Cut"], decoilerOptions: ["Horizontal"] },
  { category: "Roofing & Cladding", profiles: ["Trapezoidal Sheet", "Corrugated Sheet", "Ridge Cap"], cuttingOptions: ["Hydraulic Cut"], decoilerOptions: ["Horizontal (3 Ton)", "Horizontal (5 Ton)"] },
  { category: "Solar & Infrastructure", profiles: ["Solar Mounting Channel", "Guard Rail"], cuttingOptions: ["Ultra Cut", "Hydraulic Cut"], decoilerOptions: ["Horizontal", "Horizontal (10 Ton)"] },
];

function AdminQuotationPanel() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [projectName, setProjectName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Rolling Shutter");
  const [selectedProfile, setSelectedProfile] = useState("Shutter Patti");
  const [selectedCutting, setSelectedCutting] = useState("Ultra Cut");
  const [selectedDecoiler, setSelectedDecoiler] = useState("Horizontal");
  const [tier, setTier] = useState("medium");
  const [automation, setAutomation] = useState("semi");
  const [rolls, setRolls] = useState(8);
  const [quantity, setQuantity] = useState(1);
  const [customDiscount, setCustomDiscount] = useState("");
  const [dealerMargin, setDealerMargin] = useState("");
  const [addOns, setAddOns] = useState("");
  const [validDays, setValidDays] = useState("30");
  const [adminNotes, setAdminNotes] = useState("");

  const { data: quotes = [], isLoading } = useQuery<Quotation[]>({
    queryKey: ["/api/admin/quotations"],
  });

  const catData = machineCategories.find(c => c.category === selectedCategory);
  const tierData = pricingNumeric[tier]?.[rolls];
  const singlePrice = tierData ? tierData[automation as keyof typeof tierData] : 0;
  const dm = parseInt(dealerMargin) || 0;
  const totalBeforeDiscount = (singlePrice + dm) * quantity;
  const discountPct = parseFloat(customDiscount) || (quantity >= 3 ? 2 : 0);
  const discountAmount = Math.round(totalBeforeDiscount * discountPct / 100);
  const subtotal = totalBeforeDiscount - discountAmount;
  const gstAmount = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gstAmount;
  const deliveryDays = 30 + 7 * (quantity - 1);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/quotations", data);
      return res.json();
    },
    onSuccess: (data: Quotation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quotations"] });
      toast({ title: "Quotation Created!", description: `${data.quotationNumber} — Access Code: ${data.accessCode}` });
      setShowCreate(false);
      resetForm();
    },
    onError: () => toast({ title: "Error", description: "Failed to create quotation", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/admin/quotations/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quotations"] });
      toast({ title: "Updated" });
    },
  });

  function resetForm() {
    setCustomerName(""); setCompanyName(""); setCustomerPhone(""); setCustomerEmail("");
    setGstNo(""); setCustomerAddress(""); setProjectName(""); setCustomDiscount("");
    setDealerMargin(""); setAddOns(""); setAdminNotes("");
    setQuantity(1); setRolls(8); setTier("medium"); setAutomation("semi");
  }

  function handleCreate() {
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + parseInt(validDays));
    const validUntil = validDate.toLocaleDateString("en-IN");

    createMutation.mutate({
      customerName, companyName: companyName || undefined, customerPhone,
      customerEmail: customerEmail || undefined, gstNo: gstNo || undefined,
      customerAddress: customerAddress || undefined, projectName: projectName || undefined,
      machineCategory: selectedCategory, profileType: selectedProfile,
      tier, automation, rolls, cuttingType: selectedCutting, decoilerType: selectedDecoiler,
      quantity, singlePrice, totalBeforeDiscount,
      discountPercent: discountPct.toString(), discountAmount, subtotal, gstAmount, grandTotal,
      deliveryDays, addOns: addOns || undefined, dealerMargin: dm,
      accessCode, validUntil, preparedBy: "Sai Rolotech",
      adminNotes: adminNotes || undefined,
    });
  }

  const filtered = quotes.filter(q => {
    if (search && !q.customerName.toLowerCase().includes(search.toLowerCase()) && !q.quotationNumber.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && q.status !== filterStatus) return false;
    return true;
  });

  const now = new Date();
  function getFollowUpFlag(q: Quotation): string | null {
    if (q.status === "approved" || q.status === "expired") return null;
    const created = new Date(q.createdAt!);
    const daysSince = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    if (q.status === "sent" && daysSince >= 2) return "Not viewed — 2+ days";
    if ((q.status === "viewed" || q.status === "downloaded") && daysSince >= 5) return "Viewed but not approved — 5+ days";
    return null;
  }

  const statusCounts = {
    sent: quotes.filter(q => q.status === "sent").length,
    viewed: quotes.filter(q => q.status === "viewed").length,
    downloaded: quotes.filter(q => q.status === "downloaded").length,
    approved: quotes.filter(q => q.status === "approved").length,
    negotiation: quotes.filter(q => q.status === "negotiation").length,
    expired: quotes.filter(q => q.status === "expired").length,
  };

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-20 bg-background border-b px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate("/")} data-testid="button-quote-portal-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-sm" data-testid="text-quote-portal-title">Quotation Portal</h1>
            <p className="text-[10px] text-muted-foreground">Pro-Level Branded Quotations</p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)} data-testid="button-create-quotation">
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="pt-2 pb-2 text-center">
              <p className="text-lg font-bold text-blue-600" data-testid="text-total-quotes">{quotes.length}</p>
              <p className="text-[9px] text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-2 pb-2 text-center">
              <p className="text-lg font-bold text-green-600" data-testid="text-approved-quotes">{statusCounts.approved}</p>
              <p className="text-[9px] text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-2 pb-2 text-center">
              <p className="text-lg font-bold text-amber-600" data-testid="text-pending-quotes">{statusCounts.sent + statusCounts.viewed}</p>
              <p className="text-[9px] text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {["all", "sent", "viewed", "downloaded", "approved", "negotiation", "expired"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap border transition-colors ${
                filterStatus === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-card-border text-muted-foreground"
              }`}
              data-testid={`filter-quote-${s}`}
            >
              {s === "all" ? `All (${quotes.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${statusCounts[s as keyof typeof statusCounts] || 0})`}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search by name or quotation no..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" data-testid="input-search-quotes" />
        </div>

        {showCreate && (
          <Card className="border-primary/30">
            <CardContent className="pt-3 pb-3 space-y-3">
              <h3 className="font-bold text-xs text-primary">Create Pro Quotation</h3>

              <div className="p-2 bg-muted/20 rounded-md">
                <p className="text-[10px] font-semibold mb-2">Customer Details</p>
                <div className="space-y-2">
                  <Input placeholder="Customer Name *" value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-8 text-xs" data-testid="input-q-customer" />
                  <Input placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="h-8 text-xs" data-testid="input-q-company" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Phone *" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="h-8 text-xs" data-testid="input-q-phone" />
                    <Input placeholder="Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="h-8 text-xs" data-testid="input-q-email" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="GST No" value={gstNo} onChange={e => setGstNo(e.target.value)} className="h-8 text-xs" data-testid="input-q-gst" />
                    <Input placeholder="Project Name" value={projectName} onChange={e => setProjectName(e.target.value)} className="h-8 text-xs" data-testid="input-q-project" />
                  </div>
                  <Input placeholder="Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="h-8 text-xs" data-testid="input-q-address" />
                </div>
              </div>

              <div className="p-2 bg-muted/20 rounded-md">
                <p className="text-[10px] font-semibold mb-2">Machine Configuration</p>
                <div className="space-y-2">
                  <select value={selectedCategory} onChange={e => {
                    const cat = machineCategories.find(c => c.category === e.target.value);
                    setSelectedCategory(e.target.value);
                    if (cat) { setSelectedProfile(cat.profiles[0]); setSelectedCutting(cat.cuttingOptions[0]); setSelectedDecoiler(cat.decoilerOptions[0]); }
                  }} className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs" data-testid="select-q-category">
                    {machineCategories.map(c => <option key={c.category} value={c.category}>{c.category}</option>)}
                  </select>
                  {catData && (
                    <div className="grid grid-cols-3 gap-2">
                      <select value={selectedProfile} onChange={e => setSelectedProfile(e.target.value)} className="h-8 rounded-md border border-input bg-background px-1 text-[10px]" data-testid="select-q-profile">
                        {catData.profiles.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <select value={selectedCutting} onChange={e => setSelectedCutting(e.target.value)} className="h-8 rounded-md border border-input bg-background px-1 text-[10px]" data-testid="select-q-cutting">
                        {catData.cuttingOptions.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={selectedDecoiler} onChange={e => setSelectedDecoiler(e.target.value)} className="h-8 rounded-md border border-input bg-background px-1 text-[10px]" data-testid="select-q-decoiler">
                        {catData.decoilerOptions.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <select value={tier} onChange={e => setTier(e.target.value)} className="h-8 rounded-md border border-input bg-background px-1 text-[10px]" data-testid="select-q-tier">
                      <option value="basic">Basic</option>
                      <option value="medium">Medium</option>
                      <option value="advance">Advance</option>
                    </select>
                    <select value={automation} onChange={e => setAutomation(e.target.value)} className="h-8 rounded-md border border-input bg-background px-1 text-[10px]" data-testid="select-q-auto">
                      <option value="raw">Raw</option>
                      <option value="semi">Semi-Auto</option>
                      <option value="auto">Automatic</option>
                    </select>
                    <select value={rolls} onChange={e => setRolls(parseInt(e.target.value))} className="h-8 rounded-md border border-input bg-background px-1 text-[10px]" data-testid="select-q-rolls">
                      {[6, 7, 8, 9, 10, 11, 12, 13].map(r => <option key={r} value={r}>{r} Rolls</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[9px] text-muted-foreground">Qty</label>
                      <Input type="number" min={1} value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className="h-8 text-xs" data-testid="input-q-qty" />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">Discount %</label>
                      <Input placeholder="0" value={customDiscount} onChange={e => setCustomDiscount(e.target.value)} className="h-8 text-xs" data-testid="input-q-discount" />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">Validity (days)</label>
                      <Input value={validDays} onChange={e => setValidDays(e.target.value)} className="h-8 text-xs" data-testid="input-q-validity" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-muted-foreground">Dealer Margin (Rs)</label>
                      <Input placeholder="0" value={dealerMargin} onChange={e => setDealerMargin(e.target.value)} className="h-8 text-xs" data-testid="input-q-dealer" />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground">Add-ons</label>
                      <Input placeholder="Extra items..." value={addOns} onChange={e => setAddOns(e.target.value)} className="h-8 text-xs" data-testid="input-q-addons" />
                    </div>
                  </div>
                </div>
              </div>

              {singlePrice > 0 && (
                <div className="p-2 bg-primary/5 rounded-md border border-primary/20">
                  <p className="text-[10px] font-semibold mb-1">Price Preview</p>
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex justify-between"><span className="text-muted-foreground">Single Machine</span><span className="font-medium">Rs {formatINR(singlePrice)}</span></div>
                    {dm > 0 && <div className="flex justify-between"><span className="text-muted-foreground">+ Dealer Margin</span><span className="font-medium">Rs {formatINR(dm)}</span></div>}
                    <div className="flex justify-between"><span className="text-muted-foreground">{quantity}x Total</span><span className="font-medium">Rs {formatINR(totalBeforeDiscount)}</span></div>
                    {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({discountPct}%)</span><span>-Rs {formatINR(discountAmount)}</span></div>}
                    <div className="flex justify-between"><span className="text-muted-foreground">GST 18%</span><span className="font-medium">Rs {formatINR(gstAmount)}</span></div>
                    <div className="flex justify-between pt-1 border-t font-bold text-xs">
                      <span>Grand Total</span>
                      <span className="text-primary" data-testid="text-q-grand-total">Rs {formatINR(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              )}

              <Textarea placeholder="Admin Notes (internal only)" value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="text-xs min-h-[40px]" data-testid="input-q-notes" />

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={!customerName || !customerPhone || customerPhone.length < 10 || singlePrice === 0 || createMutation.isPending}
                  onClick={handleCreate}
                  data-testid="button-generate-quotation"
                >
                  {createMutation.isPending ? "Generating..." : "Generate Quotation"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowCreate(false)} data-testid="button-cancel-quotation">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-md" />)}</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground" data-testid="text-no-quotes">No quotations found</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(q => {
            const followUp = getFollowUpFlag(q);
            return (
              <Card key={q.id} data-testid={`card-quote-${q.id}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-primary font-mono font-bold">{q.quotationNumber}</p>
                      <h4 className="font-semibold text-xs truncate">{q.customerName}</h4>
                      {q.companyName && <p className="text-[10px] text-muted-foreground">{q.companyName}</p>}
                    </div>
                    <StatusBadge status={q.status} />
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    <Badge variant="outline" className="text-[9px]">{q.machineCategory}</Badge>
                    <Badge variant="outline" className="text-[9px]">{tierLabels[q.tier]} / {autoLabels[q.automation]}</Badge>
                    <Badge variant="outline" className="text-[9px]">{q.rolls} Rolls</Badge>
                    <Badge variant="outline" className="text-[9px] font-bold">Rs {formatINR(q.grandTotal)}</Badge>
                  </div>

                  {followUp && (
                    <div className="flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-400 mb-1.5" data-testid={`text-followup-${q.id}`}>
                      <AlertTriangle className="w-3 h-3" />
                      <span className="font-medium">{followUp}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{q.customerPhone}</span>
                    {q.customerEmail && <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" />{q.customerEmail}</span>}
                    {q.gstNo && <span className="flex items-center gap-0.5"><Building2 className="w-2.5 h-2.5" />GST: {q.gstNo}</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                    {q.customerAddress && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{q.customerAddress}</span>}
                    <span>Valid: {q.validUntil}</span>
                    <span>Code: {q.accessCode}</span>
                  </div>

                  <div className="flex gap-1.5 mt-2 pt-2 border-t border-card-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-6 px-2"
                      onClick={() => {
                        const link = `${window.location.origin}/quote/${q.quotationNumber}`;
                        navigator.clipboard.writeText(`Quotation: ${q.quotationNumber}\nAccess Code: ${q.accessCode}\nLink: ${link}`);
                        toast({ title: "Copied!", description: "Quotation link and access code copied" });
                      }}
                      data-testid={`button-copy-link-${q.id}`}
                    >
                      <Copy className="w-3 h-3 mr-0.5" />
                      Copy Link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-6 px-2"
                      onClick={() => {
                        const link = `${window.location.origin}/quote/${q.quotationNumber}`;
                        const msg = `Dear ${q.customerName},\n\nYour quotation ${q.quotationNumber} is ready.\n\nView: ${link}\nAccess Code: ${q.accessCode}\n\nTotal: Rs ${formatINR(q.grandTotal)}\nValid: ${q.validUntil}\n\nSai Rolotech\n+91 9090-486-262`;
                        window.open(`https://wa.me/91${q.customerPhone}?text=${encodeURIComponent(msg)}`, "_blank");
                      }}
                      data-testid={`button-send-wa-${q.id}`}
                    >
                      <MessageCircle className="w-3 h-3 mr-0.5" />
                      Send
                    </Button>
                    {q.status !== "negotiation" && q.status !== "approved" && q.status !== "expired" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] h-6 px-2 text-orange-600"
                        onClick={() => updateMutation.mutate({ id: q.id, data: { status: "negotiation" } })}
                        data-testid={`button-negotiate-${q.id}`}
                      >
                        <Flame className="w-3 h-3 mr-0.5" />
                        Hot Lead
                      </Button>
                    )}
                    {q.status !== "expired" && q.status !== "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] h-6 px-2 text-red-600"
                        onClick={() => updateMutation.mutate({ id: q.id, data: { status: "expired" } })}
                        data-testid={`button-expire-${q.id}`}
                      >
                        Expire
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function QuotePortalPage() {
  const [matchView] = useRoute("/quote/:number");
  const { user } = useAuth();

  if (matchView) return <QuoteViewer />;

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="w-10 h-10 mx-auto mb-2 text-primary" />
            <h2 className="font-bold text-sm mb-1">Admin Access Required</h2>
            <p className="text-xs text-muted-foreground">Login as admin to manage quotations.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminQuotationPanel />;
}
