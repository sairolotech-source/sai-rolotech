import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, ChevronRight, CheckCircle2, Star, Phone,
  MessageCircle, Factory, Zap, Shield, Crown, Settings,
  Layers, Gauge, Copy, ExternalLink, Calculator, Minus, Plus,
  Truck, IndianRupee, Package
} from "lucide-react";

const machineModels = [
  { model: "SAI-4.5/LD", width: '4.5" / 115 mm', thickness: "0.4 to 0.9", formed: '3" / 76 mm', motor: "5 HP", weight: "950 / 1300", dimension: "2.7–3.5 x 1.0 x 1.2", shipping: "4.0" },
  { model: "SAI-4.5", width: '4.5" / 115 mm', thickness: "0.7 to 1.2", formed: '3" / 76 mm', motor: "5 HP", weight: "950 / 1300", dimension: "2.7–3.5 x 1.0 x 1.2", shipping: "4.0" },
  { model: "SAI-5.0/LD", width: '5.0" / 127 mm', thickness: "0.4 to 0.9", formed: '3.35" / 85 mm', motor: "5 HP", weight: "1100 / 1450", dimension: "2.7–3.5 x 1.0 x 1.2", shipping: "5.0" },
  { model: "SAI-5.0", width: '5.0" / 127 mm', thickness: "0.7 to 1.2", formed: '3.35" / 85 mm', motor: "5 HP", weight: "1100 / 1450", dimension: "2.7–3.5 x 1.0 x 1.2", shipping: "5.0" },
  { model: "SAI-6.0/LD", width: '6.0" / 152 mm', thickness: "0.4 to 0.9", formed: '3.75" / 95 mm', motor: "5 HP", weight: "1200 / 1600", dimension: "2.7–3.5 x 1.0 x 1.2", shipping: "6.0" },
  { model: "SAI-6.0", width: '6.0" / 152 mm', thickness: "0.7 to 1.2", formed: '3.75" / 95 mm', motor: "7.5 HP", weight: "1200 / 1600", dimension: "2.7–3.5 x 1.0 x 1.2", shipping: "6.0" },
];

const tierComparison = [
  { part: "Plate Thickness", basic: "16mm", medium: "20mm", advance: "25mm" },
  { part: "Rolls Material", basic: "En8", medium: "En31", advance: "D3" },
  { part: "Machining", basic: "Lathe", medium: "CNC", advance: "CNC + Advance" },
  { part: "Shaft Material", basic: "Em. S", medium: "En8", advance: "En8" },
  { part: "Shaft Thickness", basic: "35mm", medium: "45mm", advance: "50mm" },
  { part: "Gear Box", basic: "Open Box", medium: "Reduction 1pc", advance: "Reduction 2pc" },
  { part: "Bearing", basic: "1pc (NSK)", medium: "2pc (FLT)", advance: "2pc FAG (German)" },
  { part: "Side Gear", basic: "No", medium: "Single Side", advance: "Double Side" },
  { part: "Heat Treatment", basic: "45 HRC", medium: "55 HRC", advance: "60 HRC" },
  { part: "Finish", basic: "Temper", medium: "Temper + Nickel", advance: "Hard Chrome + Polish" },
  { part: "De-Coiler", basic: "Vertical", medium: "Horizontal", advance: "Horizontal (Adv)" },
  { part: "Power", basic: "Chain Drive", medium: "Worm Gear", advance: "Worm Gear" },
  { part: "Warranty", basic: "1 Year", medium: "2 Years", advance: "3+2 = 5 Years" },
  { part: "Structure", basic: "Light", medium: "Medium", advance: "Heavy" },
  { part: "Side Plate", basic: "Welding", medium: "Welding + Lathe", advance: "VMC" },
  { part: "Panel", basic: "5 inch", medium: "5 inch", advance: "7 inch Touch" },
  { part: "Cutting", basic: "Punch Scrap", medium: "Ultra Cut", advance: "Ultra Cut" },
  { part: "Machine Service", basic: "6-7 Days", medium: "3-5 Days", advance: "1-3 Days" },
];

const basicPricing = [
  { rolls: 6, raw: "2,40,000", semi: "2,80,000", auto: "4,80,000" },
  { rolls: 7, raw: "2,80,000", semi: "3,20,000", auto: "5,20,000" },
  { rolls: 8, raw: "3,20,000", semi: "3,60,000", auto: "5,60,000" },
  { rolls: 9, raw: "3,60,000", semi: "4,00,000", auto: "6,00,000" },
  { rolls: 10, raw: "4,00,000", semi: "4,40,000", auto: "6,40,000" },
  { rolls: 11, raw: "4,40,000", semi: "4,80,000", auto: "6,80,000" },
  { rolls: 12, raw: "4,80,000", semi: "5,20,000", auto: "7,20,000" },
  { rolls: 13, raw: "5,20,000", semi: "5,60,000", auto: "7,60,000" },
];

const mediumPricing = [
  { rolls: 6, raw: "2,85,000", semi: "3,30,000", auto: "5,30,000" },
  { rolls: 7, raw: "3,35,000", semi: "3,80,000", auto: "5,80,000" },
  { rolls: 8, raw: "3,85,000", semi: "4,30,000", auto: "6,30,000" },
  { rolls: 9, raw: "4,30,000", semi: "4,75,000", auto: "6,75,000" },
  { rolls: 10, raw: "4,80,000", semi: "5,25,000", auto: "7,25,000" },
  { rolls: 11, raw: "5,30,000", semi: "5,75,000", auto: "7,75,000" },
  { rolls: 12, raw: "5,80,000", semi: "6,25,000", auto: "8,25,000" },
  { rolls: 13, raw: "5,30,000", semi: "6,75,000", auto: "8,75,000" },
];

const advancePricing = [
  { rolls: 6, raw: "3,25,000", semi: "3,70,000", auto: "5,70,000" },
  { rolls: 7, raw: "3,80,000", semi: "4,25,000", auto: "6,25,000" },
  { rolls: 8, raw: "4,35,000", semi: "4,80,000", auto: "6,80,000" },
  { rolls: 9, raw: "4,85,000", semi: "5,30,000", auto: "7,30,000" },
  { rolls: 10, raw: "5,40,000", semi: "5,85,000", auto: "7,85,000" },
  { rolls: 11, raw: "5,95,000", semi: "6,40,000", auto: "8,40,000" },
  { rolls: 12, raw: "6,50,000", semi: "6,95,000", auto: "8,95,000" },
  { rolls: 13, raw: "7,05,000", semi: "7,50,000", auto: "9,50,000" },
];

type Tab = "models" | "tiers" | "pricing" | "calculator" | "quote";

const pricingNumeric: Record<string, Record<number, { raw: number; semi: number; auto: number }>> = {
  basic: {
    6: { raw: 240000, semi: 280000, auto: 480000 },
    7: { raw: 280000, semi: 320000, auto: 520000 },
    8: { raw: 320000, semi: 360000, auto: 560000 },
    9: { raw: 360000, semi: 400000, auto: 600000 },
    10: { raw: 400000, semi: 440000, auto: 640000 },
    11: { raw: 440000, semi: 480000, auto: 680000 },
    12: { raw: 480000, semi: 520000, auto: 720000 },
    13: { raw: 520000, semi: 560000, auto: 760000 },
  },
  medium: {
    6: { raw: 285000, semi: 330000, auto: 530000 },
    7: { raw: 335000, semi: 380000, auto: 580000 },
    8: { raw: 385000, semi: 430000, auto: 630000 },
    9: { raw: 430000, semi: 475000, auto: 675000 },
    10: { raw: 480000, semi: 525000, auto: 725000 },
    11: { raw: 530000, semi: 575000, auto: 775000 },
    12: { raw: 580000, semi: 625000, auto: 825000 },
    13: { raw: 530000, semi: 675000, auto: 875000 },
  },
  advance: {
    6: { raw: 325000, semi: 370000, auto: 570000 },
    7: { raw: 380000, semi: 425000, auto: 625000 },
    8: { raw: 435000, semi: 480000, auto: 680000 },
    9: { raw: 485000, semi: 530000, auto: 730000 },
    10: { raw: 540000, semi: 585000, auto: 785000 },
    11: { raw: 595000, semi: 640000, auto: 840000 },
    12: { raw: 650000, semi: 695000, auto: 895000 },
    13: { raw: 705000, semi: 750000, auto: 950000 },
  },
};

function formatINR(num: number): string {
  return num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const machineCategories = [
  {
    category: "Rolling Shutter",
    profiles: ["Shutter Patti", "Guide Rail", "Bottom Lock"],
    cuttingOptions: ["Punch Scrap", "Ultra Cut"],
    decoilerOptions: ["Vertical", "Horizontal"],
  },
  {
    category: "False Ceiling",
    profiles: ["POP Channel", "Main Channel", "Furring Channel", "T-Grid", "Cross Tee", "Ceiling Angle", "Multi Profile"],
    cuttingOptions: ["Ultra Cut"],
    decoilerOptions: ["Horizontal", "Horizontal (Advanced)"],
  },
  {
    category: "Drywall & Partition",
    profiles: ["C-Channel / Stud", "Track", "Partition Section"],
    cuttingOptions: ["Punch Scrap", "Ultra Cut"],
    decoilerOptions: ["Horizontal"],
  },
  {
    category: "Structural",
    profiles: ["Z-Purlin", "C-Purlin", "Sigma Purlin"],
    cuttingOptions: ["Hydraulic Cut"],
    decoilerOptions: ["Horizontal (5 Ton)", "Horizontal (10 Ton)"],
  },
  {
    category: "Door & Window",
    profiles: ["Door Frame (Chaukhat)", "Window Section"],
    cuttingOptions: ["Ultra Cut"],
    decoilerOptions: ["Horizontal"],
  },
  {
    category: "Roofing & Cladding",
    profiles: ["Trapezoidal Sheet", "Corrugated Sheet", "Ridge Cap"],
    cuttingOptions: ["Hydraulic Cut"],
    decoilerOptions: ["Horizontal (3 Ton)", "Horizontal (5 Ton)"],
  },
  {
    category: "Solar & Infrastructure",
    profiles: ["Solar Mounting Channel", "Guard Rail (W-Beam)"],
    cuttingOptions: ["Ultra Cut", "Hydraulic Cut"],
    decoilerOptions: ["Horizontal", "Horizontal (10 Ton)"],
  },
];

function PriceCalculator() {
  const [selectedCategory, setSelectedCategory] = useState("Rolling Shutter");
  const [selectedProfile, setSelectedProfile] = useState("Shutter Patti");
  const [selectedCutting, setSelectedCutting] = useState("Ultra Cut");
  const [selectedDecoiler, setSelectedDecoiler] = useState("Horizontal");
  const [tier, setTier] = useState<"basic" | "medium" | "advance">("medium");
  const [rolls, setRolls] = useState(8);
  const [automation, setAutomation] = useState<"raw" | "semi" | "auto">("semi");
  const [quantity, setQuantity] = useState(1);

  const catData = machineCategories.find(c => c.category === selectedCategory);

  const tierData = pricingNumeric[tier]?.[rolls];
  const singlePrice = tierData ? tierData[automation] : 0;

  const bulkDiscount = quantity >= 3 ? 0.02 : 0;
  const totalBeforeDiscount = singlePrice * quantity;
  const discountAmount = Math.round(totalBeforeDiscount * bulkDiscount);
  const totalAfterDiscount = totalBeforeDiscount - discountAmount;
  const gstAmount = Math.round(totalAfterDiscount * 0.18);
  const grandTotal = totalAfterDiscount + gstAmount;

  const baseDeliveryDays = 30;
  const extraPerMachine = 7;
  const deliveryDays = baseDeliveryDays + extraPerMachine * (quantity - 1);

  const tierLabels = { basic: "Basic", medium: "Medium", advance: "Advance" };
  const autoLabels = { raw: "Raw", semi: "Semi-Automatic", auto: "Automatic" };

  const shareText = `Machine Quotation Estimate\n\nCategory: ${selectedCategory}\nProfile: ${selectedProfile}\nCutting: ${selectedCutting}\nDecoiler: ${selectedDecoiler}\nTier: ${tierLabels[tier]}\nStations/Rolls: ${rolls}\nAutomation: ${autoLabels[automation]}\nQuantity: ${quantity}\n\nSingle Machine: Rs ${formatINR(singlePrice)}\nTotal (${quantity} machines): Rs ${formatINR(totalBeforeDiscount)}${discountAmount > 0 ? `\nBulk Discount (2%): -Rs ${formatINR(discountAmount)}` : ""}\nGST 18%: Rs ${formatINR(gstAmount)}\nGrand Total: Rs ${formatINR(grandTotal)}\n\nEst. Delivery: ${deliveryDays} days\n\nSai Rolotech: +91 9090-486-262`;

  return (
    <div className="space-y-4">
      <div className="mb-3">
        <h2 className="font-bold text-base mb-1">Machine Configurator</h2>
        <p className="text-xs text-muted-foreground">Select category, profile, and configuration for instant price estimate</p>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label className="text-xs font-semibold mb-2 block">Machine Category</Label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                const cat = machineCategories.find(c => c.category === e.target.value);
                setSelectedCategory(e.target.value);
                if (cat) {
                  setSelectedProfile(cat.profiles[0]);
                  setSelectedCutting(cat.cuttingOptions[0]);
                  setSelectedDecoiler(cat.decoilerOptions[0]);
                }
              }}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              data-testid="select-category"
            >
              {machineCategories.map(c => (
                <option key={c.category} value={c.category}>{c.category}</option>
              ))}
            </select>
          </div>

          {catData && (
            <>
              <div>
                <Label className="text-xs font-semibold mb-2 block">Profile Type</Label>
                <div className="flex flex-wrap gap-1.5">
                  {catData.profiles.map(p => (
                    <button
                      key={p}
                      onClick={() => setSelectedProfile(p)}
                      className={`px-3 py-1.5 rounded-md border text-[11px] font-medium transition-all ${
                        selectedProfile === p ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                      }`}
                      data-testid={`button-profile-${p}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Cutting Type</Label>
                  <select
                    value={selectedCutting}
                    onChange={(e) => setSelectedCutting(e.target.value)}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                    data-testid="select-cutting"
                  >
                    {catData.cuttingOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Decoiler</Label>
                  <select
                    value={selectedDecoiler}
                    onChange={(e) => setSelectedDecoiler(e.target.value)}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                    data-testid="select-decoiler"
                  >
                    {catData.decoilerOptions.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label className="text-xs font-semibold mb-2 block">Machine Tier</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["basic", "medium", "advance"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`p-2.5 rounded-md border text-center transition-all ${
                    tier === t
                      ? t === "basic" ? "border-zinc-400 bg-zinc-100 dark:bg-zinc-800"
                        : t === "medium" ? "border-blue-400 bg-blue-50 dark:bg-blue-950"
                        : "border-amber-400 bg-amber-50 dark:bg-amber-950"
                      : "hover:bg-muted"
                  }`}
                  data-testid={`button-tier-${t}`}
                >
                  <p className={`text-xs font-semibold ${t === "medium" ? "text-blue-700 dark:text-blue-400" : t === "advance" ? "text-amber-700 dark:text-amber-400" : ""}`}>
                    {tierLabels[t]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-2 block">Number of Rolls/Stations</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {[6, 7, 8, 9, 10, 11, 12, 13].map((r) => (
                <button
                  key={r}
                  onClick={() => setRolls(r)}
                  className={`py-2 rounded-md border text-xs font-medium transition-all ${
                    rolls === r ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                  }`}
                  data-testid={`button-rolls-${r}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-2 block">Automation Level</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["raw", "semi", "auto"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAutomation(a)}
                  className={`p-2.5 rounded-md border text-center transition-all ${
                    automation === a ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                  }`}
                  data-testid={`button-auto-${a}`}
                >
                  <p className="text-xs font-medium">{autoLabels[a]}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-2 block">Quantity (No. of Machines)</Label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-md border flex items-center justify-center hover:bg-muted transition-all"
                disabled={quantity <= 1}
                data-testid="button-qty-minus"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold" data-testid="text-quantity">{quantity}</span>
                <p className="text-[10px] text-muted-foreground">{quantity === 1 ? "Machine" : "Machines"}</p>
              </div>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-md border flex items-center justify-center hover:bg-muted transition-all"
                data-testid="button-qty-plus"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {quantity >= 3 && (
              <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[9px]" data-testid="badge-bulk-discount">
                2% Bulk Discount Applied
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {singlePrice > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4" /> Price Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Single Machine Price</span>
                <span className="font-semibold" data-testid="text-single-price">Rs {formatINR(singlePrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Package className="w-3 h-3" /> {quantity} {quantity === 1 ? "Machine" : "Machines"}
                </span>
                <span className="font-semibold" data-testid="text-total-machines">Rs {formatINR(totalBeforeDiscount)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Bulk Discount (2%)</span>
                  <span className="font-semibold" data-testid="text-discount">- Rs {formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium" data-testid="text-subtotal">Rs {formatINR(totalAfterDiscount)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (18%)</span>
                <span className="font-medium" data-testid="text-gst">Rs {formatINR(gstAmount)}</span>
              </div>

              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Grand Total</span>
                <span className="font-bold text-primary text-base" data-testid="text-grand-total">Rs {formatINR(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t flex items-center gap-2 text-xs">
              <Truck className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-muted-foreground">Est. Delivery: </span>
                <span className="font-semibold" data-testid="text-delivery">{deliveryDays} days</span>
                {quantity > 1 && (
                  <span className="text-[10px] text-muted-foreground ml-1">(Base 30 + {extraPerMachine * (quantity - 1)} extra)</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/30">
        <CardContent className="pt-3 pb-3">
          <h4 className="font-semibold text-xs mb-1">Configuration Summary</h4>
          <p className="text-[10px] text-muted-foreground">
            {selectedCategory} → {selectedProfile}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {tierLabels[tier]} | {rolls} Stations | {autoLabels[automation]} | {selectedCutting} | {selectedDecoiler}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">
            Qty: {quantity} {quantity === 1 ? "Machine" : "Machines"}
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.open(`https://wa.me/919090486262?text=${encodeURIComponent(shareText)}`, "_blank")}
          data-testid="button-calc-whatsapp"
        >
          <MessageCircle className="w-4 h-4 mr-1.5" />
          Share
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            navigator.clipboard.writeText(shareText);
          }}
          data-testid="button-calc-copy"
        >
          <Copy className="w-4 h-4 mr-1.5" />
          Copy
        </Button>
      </div>
    </div>
  );
}

function PricingTable({ title, data, color }: { title: string; data: typeof basicPricing; color: string }) {
  return (
    <div className="mb-6">
      <h3 className={`font-bold text-sm mb-2 ${color}`}>{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-2 border font-semibold">Rolls</th>
              <th className="text-right p-2 border font-semibold">Raw</th>
              <th className="text-right p-2 border font-semibold">Semi-Auto</th>
              <th className="text-right p-2 border font-semibold">Automatic</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.rolls} className="hover:bg-muted/30">
                <td className="p-2 border font-medium">{row.rolls}</td>
                <td className="p-2 border text-right">{row.raw}</td>
                <td className="p-2 border text-right">{row.semi}</td>
                <td className="p-2 border text-right font-semibold">{row.auto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RequestQuoteForm({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "", phone: "", location: "",
    interest: "Shutter Patti Machine",
    machineModel: "", financeRequired: false,
    financeStage: "", expectedAmount: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const confidence = data.financeRequired
        ? data.financeStage === "inquiry" ? 20
          : data.financeStage === "discussion" ? 40
          : data.financeStage === "docs_submitted" ? 60
          : data.financeStage === "sanctioned" ? 80
          : data.financeStage === "disbursement" ? 95
          : 10
        : 50;

      const res = await apiRequest("POST", "/api/leads", {
        name: data.name,
        phone: data.phone,
        location: data.location,
        interest: data.interest,
        machineModel: data.machineModel,
        financeRequired: data.financeRequired,
        financeStage: data.financeRequired ? data.financeStage : null,
        confidenceScore: confidence,
        expectedAmount: data.expectedAmount,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Quote Requested!", description: "Our team will contact you shortly with a detailed quotation." });
    },
  });

  const financeStages = [
    { value: "inquiry", label: "Just Inquiry" },
    { value: "discussion", label: "Bank Discussion" },
    { value: "docs_submitted", label: "Documents Submitted" },
    { value: "sanctioned", label: "Loan Sanctioned" },
    { value: "disbursement", label: "Disbursement Pending" },
  ];

  if (mutation.isSuccess) {
    const whatsappText = `Hi, I'm interested in a Shutter Patti Machine quotation.\n\nName: ${formData.name}\nModel: ${formData.machineModel || "To be decided"}\n${formData.financeRequired ? `Finance: ${formData.financeStage}\n` : ""}Location: ${formData.location}\n\nPlease share the detailed quotation.`;
    return (
      <div className="space-y-4">
        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h2 className="font-bold text-lg mb-1" data-testid="text-quote-success">Quote Request Submitted!</h2>
            <p className="text-xs text-muted-foreground mb-4">Our team will prepare a detailed quotation and contact you soon.</p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => window.open(`https://wa.me/919090486262?text=${encodeURIComponent(whatsappText)}`, "_blank")}
                className="bg-green-600 hover:bg-green-700 w-full"
                data-testid="button-quote-whatsapp"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Get Quote on WhatsApp
              </Button>
              <Button variant="outline" onClick={() => window.open("tel:+919090486262")} className="w-full" data-testid="button-quote-call">
                <Phone className="w-4 h-4 mr-2" />
                Call: +91 9090-486-262
              </Button>
            </div>
          </CardContent>
        </Card>
        <Button variant="ghost" className="w-full" onClick={onBack} data-testid="button-back-to-specs">
          Back to Specifications
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-4">
        <h3 className="font-bold text-sm">Request Quotation</h3>
        <p className="text-xs text-muted-foreground">Fill your details and our team will prepare a customized quotation.</p>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Name *</Label>
            <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Your name" data-testid="input-quote-name" />
          </div>
          <div>
            <Label className="text-xs">Phone *</Label>
            <Input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="10-digit phone" data-testid="input-quote-phone" />
          </div>
          <div>
            <Label className="text-xs">Location</Label>
            <Input value={formData.location} onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="City / State" data-testid="input-quote-location" />
          </div>
          <div>
            <Label className="text-xs">Machine Model</Label>
            <select
              value={formData.machineModel}
              onChange={(e) => setFormData(p => ({ ...p, machineModel: e.target.value }))}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              data-testid="select-quote-model"
            >
              <option value="">Select model (optional)</option>
              {machineModels.map(m => <option key={m.model} value={m.model}>{m.model} — {m.width}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">Expected Budget</Label>
            <Input value={formData.expectedAmount} onChange={(e) => setFormData(p => ({ ...p, expectedAmount: e.target.value }))} placeholder="e.g. 5,00,000" data-testid="input-quote-budget" />
          </div>

          <div className="p-3 rounded-md bg-muted/30 border space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="finance"
                checked={formData.financeRequired}
                onChange={(e) => setFormData(p => ({ ...p, financeRequired: e.target.checked }))}
                className="rounded"
                data-testid="checkbox-finance"
              />
              <Label htmlFor="finance" className="text-xs font-medium cursor-pointer">I need machine on loan / finance</Label>
            </div>

            {formData.financeRequired && (
              <div>
                <Label className="text-xs mb-1.5 block">Finance Stage</Label>
                <div className="space-y-1.5">
                  {financeStages.map((stage) => (
                    <label key={stage.value} className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer text-xs transition-all ${formData.financeStage === stage.value ? "border-primary bg-primary/5" : "border-transparent bg-background"}`}>
                      <input
                        type="radio"
                        name="financeStage"
                        value={stage.value}
                        checked={formData.financeStage === stage.value}
                        onChange={(e) => setFormData(p => ({ ...p, financeStage: e.target.value }))}
                        className="accent-primary"
                        data-testid={`radio-finance-${stage.value}`}
                      />
                      {stage.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          className="w-full"
          disabled={!formData.name || !formData.phone || formData.phone.length < 10 || (formData.financeRequired && !formData.financeStage) || mutation.isPending}
          onClick={() => mutation.mutate(formData)}
          data-testid="button-submit-quote"
        >
          {mutation.isPending ? "Submitting..." : "Request Quotation"}
        </Button>
        {formData.financeRequired && !formData.financeStage && (
          <p className="text-[10px] text-destructive text-center" data-testid="text-finance-error">Please select your finance stage</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function QuotationPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("models");

  const tabs: { key: Tab; label: string; icon: typeof Factory }[] = [
    { key: "models", label: "Models", icon: Factory },
    { key: "tiers", label: "Tiers", icon: Layers },
    { key: "pricing", label: "Pricing", icon: Gauge },
    { key: "calculator", label: "Calc", icon: Calculator },
    { key: "quote", label: "Quote", icon: MessageCircle },
  ];

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation("/")} className="p-1" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-sm" data-testid="text-quotation-title">Shutter Patti Machine</h1>
          <p className="text-[10px] text-muted-foreground">Complete Quotation & Specifications</p>
        </div>
      </div>

      <div className="flex border-b px-2 bg-background sticky top-[53px] z-20">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-all ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
            data-testid={`tab-${tab.key}`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        {activeTab === "models" && (
          <div className="space-y-4">
            <div className="mb-3">
              <h2 className="font-bold text-base mb-1">Roll Forming Machine Models</h2>
              <p className="text-xs text-muted-foreground">Standard Three Profile Type — Knurling Type also available</p>
            </div>

            <div className="grid gap-3">
              {machineModels.map((m) => (
                <Card key={m.model} data-testid={`card-model-${m.model}`}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-sm">{m.model}</h3>
                        <p className="text-[10px] text-muted-foreground">Shutter Patti Roll Forming</p>
                      </div>
                      <Badge variant="secondary" className="text-[9px]">
                        {m.model.includes("/LD") ? "Light Duty" : "Heavy Duty"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Width:</span>
                        <span className="font-medium">{m.width}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Thickness:</span>
                        <span className="font-medium">{m.thickness} mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Formed:</span>
                        <span className="font-medium">{m.formed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Motor:</span>
                        <span className="font-medium">{m.motor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="font-medium">{m.weight} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Speed:</span>
                        <span className="font-medium">6 m/min</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">6-13 pairs of rolls | Length: No Limit</span>
                      <Button variant="ghost" size="sm" className="text-xs h-7 text-primary" onClick={() => setActiveTab("pricing")} data-testid={`button-pricing-${m.model}`}>
                        View Pricing <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
              <CardContent className="pt-3 pb-3 text-xs text-amber-800 dark:text-amber-300">
                <p className="font-semibold mb-1">Custom Profiles Available</p>
                <p className="text-[11px]">Custom knurling type and profile designs available on request. Contact us for specialized requirements.</p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Machine Videos</h3>
              <a href="https://youtube.com/shorts/LPEQldD5c6g" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary" data-testid="link-video-basic">
                <ExternalLink className="w-3.5 h-3.5" /> Basic Machine Demo
              </a>
              <a href="https://youtube.com/shorts/1DbpzyxH6sw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary" data-testid="link-video-medium">
                <ExternalLink className="w-3.5 h-3.5" /> Medium Machine Demo
              </a>
              <a href="https://youtu.be/Q8kiahPsCe0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary" data-testid="link-video-advance">
                <ExternalLink className="w-3.5 h-3.5" /> Advance Machine Demo
              </a>
            </div>
          </div>
        )}

        {activeTab === "tiers" && (
          <div className="space-y-4">
            <div className="mb-3">
              <h2 className="font-bold text-base mb-1">Basic vs Medium vs Advance</h2>
              <p className="text-xs text-muted-foreground">Technical specifications comparison across all three machine tiers</p>
            </div>

            <div className="flex gap-2 mb-4">
              <Card className="flex-1 p-3 text-center border-zinc-300">
                <Settings className="w-5 h-5 mx-auto mb-1 text-zinc-500" />
                <p className="text-[10px] font-semibold">Basic</p>
                <p className="text-[9px] text-muted-foreground">Budget</p>
              </Card>
              <Card className="flex-1 p-3 text-center border-blue-300 bg-blue-50/30 dark:bg-blue-950/20">
                <Star className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-400">Medium</p>
                <p className="text-[9px] text-muted-foreground">Popular</p>
              </Card>
              <Card className="flex-1 p-3 text-center border-amber-300 bg-amber-50/30 dark:bg-amber-950/20">
                <Crown className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">Advance</p>
                <p className="text-[9px] text-muted-foreground">Premium</p>
              </Card>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse min-w-[360px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 border font-semibold">Part</th>
                    <th className="text-center p-2 border font-semibold">Basic</th>
                    <th className="text-center p-2 border font-semibold text-blue-600 dark:text-blue-400">Medium</th>
                    <th className="text-center p-2 border font-semibold text-amber-600 dark:text-amber-400">Advance</th>
                  </tr>
                </thead>
                <tbody>
                  {tierComparison.map((row, i) => (
                    <tr key={row.part} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                      <td className="p-2 border font-medium">{row.part}</td>
                      <td className="p-2 border text-center">{row.basic}</td>
                      <td className="p-2 border text-center">{row.medium}</td>
                      <td className="p-2 border text-center font-semibold">{row.advance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="space-y-4">
            <div className="mb-3">
              <h2 className="font-bold text-base mb-1">Pricing (All Models)</h2>
              <p className="text-xs text-muted-foreground">Prices in INR. GST 18% extra. Custom machines also available.</p>
            </div>

            <PricingTable title="Basic Machine" data={basicPricing} color="text-zinc-700 dark:text-zinc-300" />
            <PricingTable title="Medium Machine" data={mediumPricing} color="text-blue-700 dark:text-blue-400" />
            <PricingTable title="Advance Machine" data={advancePricing} color="text-amber-700 dark:text-amber-400" />

            <Card className="bg-muted/30">
              <CardContent className="pt-3 pb-3">
                <h4 className="font-semibold text-xs mb-2">Terms & Conditions</h4>
                <ul className="text-[10px] text-muted-foreground space-y-1">
                  <li>GST 18% extra on total bill value</li>
                  <li>Machine Delivery: 20 to 60 days</li>
                  <li>Rates valid for 1 month only</li>
                  <li>Packaging & transportation extra</li>
                  <li>Payment: 50% advance, 30% on progress, 20% on delivery</li>
                  <li>Trial material arrangement by owner</li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setActiveTab("calculator")} data-testid="button-goto-calc">
                <Calculator className="w-4 h-4 mr-1" />
                Price Calculator
              </Button>
              <Button className="flex-1" onClick={() => setActiveTab("quote")} data-testid="button-goto-quote">
                Request Quote
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {activeTab === "calculator" && <PriceCalculator />}

        {activeTab === "quote" && (
          <RequestQuoteForm onBack={() => setActiveTab("models")} />
        )}
      </div>
    </div>
  );
}
