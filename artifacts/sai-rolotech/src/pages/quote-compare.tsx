import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Scale, Trophy, Star, ChevronRight, Minus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

interface QuotationInput {
  vendorName: string;
  plateThickness: string;
  shaftSize: string;
  rollerMaterial: string;
  gearboxType: string;
  motorPower: string;
  price: string;
  warranty: string;
  deliveryDays: string;
  stations: string;
  automation: string;
}

const EMPTY_QUOTATION: QuotationInput = {
  vendorName: "", plateThickness: "", shaftSize: "", rollerMaterial: "",
  gearboxType: "", motorPower: "", price: "", warranty: "", deliveryDays: "",
  stations: "", automation: "Semi-Automatic",
};

const ROLLER_MATERIALS = ["EN8", "EN31", "D3", "Alloy Steel", "Chrome Plated"];
const GEARBOX_TYPES = ["Worm Gear", "Helical Gear", "Planetary", "Chain Drive"];
const AUTOMATION_TYPES = ["Manual", "Semi-Automatic", "Fully Automatic"];

function ComparisonField({ label, val1, val2, winner }: { label: string; val1: string; val2: string; winner: number }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center py-2 border-b border-dashed last:border-0">
      <div className={`text-xs text-right ${winner === 1 ? "font-bold text-green-600" : ""}`}>
        {val1 || "-"}
        {winner === 1 && <Star className="w-3 h-3 inline ml-1 text-green-500" />}
      </div>
      <div className="text-[10px] text-muted-foreground font-medium text-center min-w-[80px]">{label}</div>
      <div className={`text-xs ${winner === 2 ? "font-bold text-green-600" : ""}`}>
        {val2 || "-"}
        {winner === 2 && <Star className="w-3 h-3 inline ml-1 text-green-500" />}
      </div>
    </div>
  );
}

export default function QuoteComparePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [q1, setQ1] = useState<QuotationInput>({ ...EMPTY_QUOTATION });
  const [q2, setQ2] = useState<QuotationInput>({ ...EMPTY_QUOTATION });
  const [result, setResult] = useState<any>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const compareMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/quotation-compare", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      setResult(data);
      toast({ title: "Comparison ready!" });
    },
    onError: () => toast({ title: "Comparison failed", variant: "destructive" }),
  });

  const formatQ = (q: QuotationInput) => ({
    vendorName: q.vendorName,
    plateThickness: parseFloat(q.plateThickness) || 16,
    shaftSize: parseFloat(q.shaftSize) || 35,
    rollerMaterial: q.rollerMaterial || "EN8",
    gearbox: q.gearboxType || "Worm Gear",
    warranty: parseFloat(q.warranty) || 12,
    price: parseFloat(q.price) * 100000,
    deliveryDays: parseInt(q.deliveryDays) || 30,
    motorPower: parseFloat(q.motorPower) || 5,
    stations: parseInt(q.stations) || 10,
    automation: q.automation || "Semi-Automatic",
  });

  const handleCompare = () => {
    if (!q1.vendorName || !q2.vendorName) {
      toast({ title: "Enter vendor names for both quotations", variant: "destructive" });
      return;
    }
    if (!q1.price || !q2.price) {
      toast({ title: "Enter price for both quotations", variant: "destructive" });
      return;
    }
    compareMutation.mutate({
      clientName, clientPhone,
      quotation1: formatQ(q1), quotation2: formatQ(q2),
    });
  };

  function QuotationForm({ q, setQ, num }: { q: QuotationInput; setQ: (q: QuotationInput) => void; num: number }) {
    return (
      <Card className={num === 1 ? "border-blue-300/50" : "border-orange-300/50"} data-testid={`card-quotation-${num}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${num === 1 ? "bg-blue-500" : "bg-orange-500"}`}>
              {num}
            </div>
            Quotation {num}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label className="text-[10px]">Vendor Name *</Label>
            <Input value={q.vendorName} onChange={e => setQ({...q, vendorName: e.target.value})} className="h-7 text-xs" placeholder={`Vendor ${num} name`} data-testid={`input-vendor-${num}`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Price (₹ Lakh) *</Label>
              <Input value={q.price} onChange={e => setQ({...q, price: e.target.value})} className="h-7 text-xs" placeholder="5.50" type="number" step="0.1" data-testid={`input-price-${num}`} />
            </div>
            <div>
              <Label className="text-[10px]">Warranty (months)</Label>
              <Input value={q.warranty} onChange={e => setQ({...q, warranty: e.target.value})} className="h-7 text-xs" placeholder="12" type="number" data-testid={`input-warranty-${num}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Plate Thickness (mm)</Label>
              <Input value={q.plateThickness} onChange={e => setQ({...q, plateThickness: e.target.value})} className="h-7 text-xs" placeholder="16mm" data-testid={`input-plate-${num}`} />
            </div>
            <div>
              <Label className="text-[10px]">Shaft Size (mm)</Label>
              <Input value={q.shaftSize} onChange={e => setQ({...q, shaftSize: e.target.value})} className="h-7 text-xs" placeholder="45mm" data-testid={`input-shaft-${num}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Roller Material</Label>
              <select value={q.rollerMaterial} onChange={e => setQ({...q, rollerMaterial: e.target.value})} className="w-full h-7 rounded-md border border-input bg-background px-2 text-[10px]" data-testid={`select-roller-${num}`}>
                <option value="">Select</option>
                {ROLLER_MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-[10px]">Gearbox</Label>
              <select value={q.gearboxType} onChange={e => setQ({...q, gearboxType: e.target.value})} className="w-full h-7 rounded-md border border-input bg-background px-2 text-[10px]" data-testid={`select-gearbox-${num}`}>
                <option value="">Select</option>
                {GEARBOX_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-[10px]">Motor (HP)</Label>
              <Input value={q.motorPower} onChange={e => setQ({...q, motorPower: e.target.value})} className="h-7 text-xs" placeholder="7.5" data-testid={`input-motor-${num}`} />
            </div>
            <div>
              <Label className="text-[10px]">Stations</Label>
              <Input value={q.stations} onChange={e => setQ({...q, stations: e.target.value})} className="h-7 text-xs" placeholder="12" data-testid={`input-stations-${num}`} />
            </div>
            <div>
              <Label className="text-[10px]">Delivery (days)</Label>
              <Input value={q.deliveryDays} onChange={e => setQ({...q, deliveryDays: e.target.value})} className="h-7 text-xs" placeholder="30" data-testid={`input-delivery-${num}`} />
            </div>
          </div>
          <div>
            <Label className="text-[10px]">Automation</Label>
            <select value={q.automation} onChange={e => setQ({...q, automation: e.target.value})} className="w-full h-7 rounded-md border border-input bg-background px-2 text-[10px]" data-testid={`select-automation-${num}`}>
              {AUTOMATION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation("/")} data-testid="button-back-compare">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-bold" data-testid="text-page-title">Quotation Comparison</h1>
          <p className="text-[10px] text-muted-foreground">Compare 2 vendor quotations side-by-side</p>
        </div>
        <Scale className="w-5 h-5 text-purple-500 ml-auto" />
      </div>

      <div className="p-4 space-y-4">
        {!result && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">Your Name</Label>
                <Input value={clientName} onChange={e => setClientName(e.target.value)} className="h-7 text-xs" placeholder="Client name" data-testid="input-client-name" />
              </div>
              <div>
                <Label className="text-[10px]">Phone</Label>
                <Input value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="h-7 text-xs" placeholder="Phone" data-testid="input-client-phone" />
              </div>
            </div>

            <QuotationForm q={q1} setQ={setQ1} num={1} />
            <QuotationForm q={q2} setQ={setQ2} num={2} />

            <Button className="w-full" onClick={handleCompare} disabled={compareMutation.isPending} data-testid="button-compare">
              <Scale className="w-4 h-4 mr-2" />
              {compareMutation.isPending ? "Comparing..." : "Compare Quotations"}
            </Button>
          </>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="border-primary/30" data-testid="card-comparison-result">
              <CardContent className="pt-5 pb-4">
                <div className="text-center mb-4">
                  <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="text-sm font-bold">Comparison Result</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={`text-center p-3 rounded-lg border-2 ${result.score1 >= result.score2 ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-muted"}`}>
                    <p className="text-xs font-medium mb-1 truncate">{result.quotation1?.vendorName || "Vendor 1"}</p>
                    <p className={`text-2xl font-bold ${result.score1 >= result.score2 ? "text-green-600" : "text-muted-foreground"}`}>
                      {result.score1}
                    </p>
                    <p className="text-[10px] text-muted-foreground">points</p>
                    {result.score1 > result.score2 && (
                      <Badge className="mt-1 text-[9px] bg-green-500">Winner</Badge>
                    )}
                  </div>
                  <div className={`text-center p-3 rounded-lg border-2 ${result.score2 > result.score1 ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-muted"}`}>
                    <p className="text-xs font-medium mb-1 truncate">{result.quotation2?.vendorName || "Vendor 2"}</p>
                    <p className={`text-2xl font-bold ${result.score2 > result.score1 ? "text-green-600" : "text-muted-foreground"}`}>
                      {result.score2}
                    </p>
                    <p className="text-[10px] text-muted-foreground">points</p>
                    {result.score2 > result.score1 && (
                      <Badge className="mt-1 text-[9px] bg-green-500">Winner</Badge>
                    )}
                  </div>
                </div>

                {result.score1 !== result.score2 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center mb-4">
                    <p className="text-[11px] text-primary font-medium">
                      {result.score1 > result.score2 ? result.quotation1?.vendorName : result.quotation2?.vendorName} wins by {Math.abs(result.score1 - result.score2)} points
                    </p>
                  </div>
                )}
                {result.score1 === result.score2 && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center mb-4">
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Both quotations scored equally!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-detail-comparison">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Detailed Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 mb-2">
                  <p className="text-[10px] font-bold text-blue-600 text-right">{result.quotation1?.vendorName || "Q1"}</p>
                  <p className="text-[10px] font-bold text-muted-foreground text-center">VS</p>
                  <p className="text-[10px] font-bold text-orange-600">{result.quotation2?.vendorName || "Q2"}</p>
                </div>

                {result.comparisonResult && Object.values(result.comparisonResult).map((d: any, i: number) => (
                  <ComparisonField key={i} label={d.label} val1={String(d.q1)} val2={String(d.q2)} winner={d.winner} />
                ))}
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full text-xs" onClick={() => { setResult(null); }} data-testid="button-new-comparison">
              <Scale className="w-3 h-3 mr-2" /> New Comparison
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
