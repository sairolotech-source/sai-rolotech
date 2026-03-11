import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, IndianRupee, ArrowDown, ArrowUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function GSTCalculator() {
  const [amount, setAmount] = useState("100000");
  const [gstRate, setGstRate] = useState("18");
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive");

  const results = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    const rate = parseFloat(gstRate) || 0;

    if (mode === "exclusive") {
      const gstAmount = (amt * rate) / 100;
      const totalAmount = amt + gstAmount;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      return { baseAmount: amt, gstAmount, totalAmount, cgst, sgst, igst: gstAmount };
    } else {
      const baseAmount = (amt * 100) / (100 + rate);
      const gstAmount = amt - baseAmount;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      return { baseAmount, gstAmount, totalAmount: amt, cgst, sgst, igst: gstAmount };
    }
  }, [amount, gstRate, mode]);

  const formatCurrency = (val: number) =>
    val.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-3">
        <h1 className="text-xl font-bold mb-1 flex items-center gap-2" data-testid="text-gst-title">
          <Calculator className="w-5 h-5 text-primary" />
          GST Calculator
        </h1>
        <p className="text-sm text-muted-foreground">Calculate GST for your transactions</p>
      </div>

      <Card className="p-4 mb-4">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "exclusive" | "inclusive")}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="exclusive" className="flex-1" data-testid="tab-exclusive">
              <ArrowUp className="w-3 h-3 mr-1" />
              Add GST
            </TabsTrigger>
            <TabsTrigger value="inclusive" className="flex-1" data-testid="tab-inclusive">
              <ArrowDown className="w-3 h-3 mr-1" />
              Remove GST
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              {mode === "exclusive" ? "Amount (Before GST)" : "Amount (Including GST)"}
            </Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-gst-amount"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">GST Rate (%)</Label>
            <Select value={gstRate} onValueChange={setGstRate}>
              <SelectTrigger data-testid="select-gst-rate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="12">12%</SelectItem>
                <SelectItem value="18">18% (Standard)</SelectItem>
                <SelectItem value="28">28%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm" data-testid="text-gst-breakdown">Breakdown</h3>

        <div className="flex justify-between items-center py-2 border-b border-dashed">
          <span className="text-sm text-muted-foreground">Base Amount</span>
          <span className="text-sm font-semibold" data-testid="text-base-amount">{formatCurrency(results.baseAmount)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-dashed">
          <span className="text-sm text-muted-foreground">CGST ({parseFloat(gstRate) / 2}%)</span>
          <span className="text-sm font-semibold" data-testid="text-cgst">{formatCurrency(results.cgst)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-dashed">
          <span className="text-sm text-muted-foreground">SGST ({parseFloat(gstRate) / 2}%)</span>
          <span className="text-sm font-semibold" data-testid="text-sgst">{formatCurrency(results.sgst)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-dashed">
          <span className="text-sm text-muted-foreground">IGST ({gstRate}%)</span>
          <span className="text-sm font-semibold" data-testid="text-igst">{formatCurrency(results.igst)}</span>
        </div>

        <div className="flex justify-between items-center py-3 bg-primary/5 rounded-md px-3 -mx-1">
          <span className="text-sm font-semibold">Total Amount</span>
          <span className="text-lg font-bold text-primary" data-testid="text-total-amount">
            {formatCurrency(results.totalAmount)}
          </span>
        </div>
      </Card>
    </div>
  );
}
