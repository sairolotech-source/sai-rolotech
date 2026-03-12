import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Factory,
  Calculator,
  Gauge,
  TrendingUp,
  Zap,
  Users,
  Landmark,
  Package,
  Wrench,
  IndianRupee,
  CheckCircle2,
  ExternalLink,
  Phone,
  MapPin,
  Star,
  Shield,
  BarChart3,
  Lightbulb,
  Target,
  Award,
  Cog,
  Droplets,
  Ruler,
  AlertTriangle,
} from "lucide-react";
import { useLocation } from "wouter";

function ScrollReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const sections = [
  { id: "overview", label: "Business Overview", labelHi: "व्यापार परिचय", icon: Factory },
  { id: "investment", label: "Investment Calculator", labelHi: "निवेश कैलकुलेटर", icon: Calculator },
  { id: "production", label: "Production Calculator", labelHi: "उत्पादन कैलकुलेटर", icon: Gauge },
  { id: "profit", label: "Profit Estimator", labelHi: "लाभ अनुमान", icon: TrendingUp },
  { id: "electricity", label: "Electricity Requirement", labelHi: "बिजली आवश्यकता", icon: Zap },
  { id: "manpower", label: "Manpower Guide", labelHi: "कर्मचारी गाइड", icon: Users },
  { id: "loans", label: "Loan & Subsidy Guide", labelHi: "लोन और सब्सिडी", icon: Landmark },
  { id: "suppliers", label: "Raw Material Suppliers", labelHi: "कच्चा माल सप्लायर", icon: Package },
  { id: "maintenance", label: "Maintenance Tips", labelHi: "रखरखाव टिप्स", icon: Wrench },
];

function SectionNav({ activeSection, onSelect }: { activeSection: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
      {sections.map((s, i) => {
        const isActive = activeSection === s.id;
        return (
          <motion.button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl shrink-0 transition-all text-xs font-medium ${
              isActive
                ? "bg-primary text-white shadow-lg"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            whileTap={{ scale: 0.95 }}
            data-testid={`tab-${s.id}`}
          >
            <s.icon className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{s.label} <span className="text-[9px] opacity-70">({s.labelHi})</span></span>
          </motion.button>
        );
      })}
    </div>
  );
}

function BusinessOverview() {
  const benefits = [
    { icon: Target, title: "High Demand / ज़बरदस्त माँग", desc: "Construction boom across India — roofing sheets, shutters, purlins needed everywhere." },
    { icon: TrendingUp, title: "Profit Margin 25-40%", desc: "Raw material cost ₹50-65/kg, finished product sells at ₹70-95/kg." },
    { icon: Clock, title: "Quick ROI / जल्दी पैसा वापस", desc: "Most businesses recover full investment within 12-18 months." },
    { icon: Award, title: "Low Competition / कम प्रतिस्पर्धा", desc: "Many regions have very few local roll forming units — huge opportunity." },
    { icon: Lightbulb, title: "Easy to Learn / सीखने में आसान", desc: "Operators can be trained in 2-3 days. No heavy technical knowledge required." },
    { icon: BarChart3, title: "Scalable / बढ़ाना आसान", desc: "Start with 1 machine, add more profiles as demand grows." },
  ];

  return (
    <div className="space-y-4" data-testid="section-overview">
      <GlassCard className="relative overflow-hidden mx-4">
        <div
          className="relative py-8 px-5"
          style={{
            background: "linear-gradient(-45deg, #0055CC, #0077FF, #00D4FF, #7B2FFF)",
            backgroundSize: "300% 300%",
            animation: "mesh-shift 12s ease infinite",
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, rgba(0,212,255,0.8) 0%, transparent 70%)" }} />
          </div>
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 text-[10px] mb-3">Business Guide / व्यापार गाइड</Badge>
            <h2 className="text-2xl font-extrabold text-white leading-tight mb-2">
              Roll Forming Machine Business
            </h2>
            <p className="text-sm text-white/80 mb-1">रोल फॉर्मिंग मशीन का बिज़नेस कैसे शुरू करें?</p>
            <p className="text-xs text-white/60">Complete startup guide for entrepreneurs</p>
          </div>
        </div>
      </GlassCard>

      <div className="px-4">
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
            <Factory className="w-4 h-4 text-primary" />
            What is Roll Forming? / रोल फॉर्मिंग क्या है?
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Roll forming is a continuous metal bending process where a flat steel coil (GP/CR coil)
            passes through a series of rollers to form a specific profile shape — like roofing sheets,
            C purlins, door frames, or shutter pattis.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            रोल फॉर्मिंग एक ऐसी प्रक्रिया है जिसमें स्टील कॉइल को रोलर्स से गुज़ारकर
            विभिन्न प्रोफाइल बनाई जाती हैं — जैसे छत की शीट, सी पर्लिन, डोर फ्रेम, शटर पट्टी आदि।
          </p>
        </GlassCard>
      </div>

      <div className="px-4 grid grid-cols-2 gap-3">
        {benefits.map((b, i) => (
          <ScrollReveal key={b.title} delay={i * 0.05}>
            <GlassCard className="p-3 h-full">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <b.icon className="w-4 h-4 text-primary" />
              </div>
              <h4 className="text-[11px] font-bold mb-1">{b.title}</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{b.desc}</p>
            </GlassCard>
          </ScrollReveal>
        ))}
      </div>

      <div className="px-4">
        <GlassCard className="p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Popular Machine Types / लोकप्रिय मशीनें
          </h3>
          <div className="space-y-2">
            {[
              { name: "Roof Sheet Machine", nameHi: "छत शीट मशीन", range: "₹8-15 Lakh" },
              { name: "C/Z Purlin Machine", nameHi: "सी/ज़ेड पर्लिन मशीन", range: "₹10-18 Lakh" },
              { name: "Shutter Patti Machine", nameHi: "शटर पट्टी मशीन", range: "₹2.7-8 Lakh" },
              { name: "Door Frame Machine", nameHi: "डोर फ्रेम मशीन", range: "₹5-12 Lakh" },
              { name: "False Ceiling Machine", nameHi: "फॉल्स सीलिंग मशीन", range: "₹3.5-15 Lakh" },
            ].map((m) => (
              <div key={m.name} className="flex items-center justify-between p-2 rounded-xl bg-accent/30">
                <div>
                  <p className="text-xs font-medium">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground">{m.nameHi}</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">{m.range}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function InvestmentCalculator() {
  const [machineType, setMachineType] = useState("roof_sheet");
  const [machineCost, setMachineCost] = useState(1000000);
  const [spaceCost, setSpaceCost] = useState(300000);
  const [powerSetup, setPowerSetup] = useState(100000);
  const [rawMaterial, setRawMaterial] = useState(500000);
  const [miscCost, setMiscCost] = useState(100000);

  const machinePresets: Record<string, { label: string; cost: number }> = {
    roof_sheet: { label: "Roof Sheet / छत शीट", cost: 1000000 },
    c_purlin: { label: "C/Z Purlin / पर्लिन", cost: 1200000 },
    shutter_patti: { label: "Shutter Patti / शटर पट्टी", cost: 400000 },
    door_frame: { label: "Door Frame / डोर फ्रेम", cost: 800000 },
    false_ceiling: { label: "False Ceiling / फॉल्स सीलिंग", cost: 600000 },
  };

  const handleMachineChange = (type: string) => {
    setMachineType(type);
    setMachineCost(machinePresets[type]?.cost || 1000000);
  };

  const totalInvestment = machineCost + spaceCost + powerSetup + rawMaterial + miscCost;

  return (
    <div className="px-4 space-y-4" data-testid="section-investment">
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          Investment Calculator / निवेश कैलकुलेटर
        </h3>
        <p className="text-[10px] text-muted-foreground mb-4">Estimate your total startup cost / कुल शुरुआती लागत</p>

        <div className="space-y-3">
          <div>
            <Label className="text-[10px]">Machine Type / मशीन प्रकार</Label>
            <select
              value={machineType}
              onChange={(e) => handleMachineChange(e.target.value)}
              className="w-full h-9 rounded-xl border border-input/50 bg-background/50 backdrop-blur-sm px-3 text-xs mt-1"
              data-testid="select-machine-type"
            >
              {Object.entries(machinePresets).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-[10px]">Machine Cost / मशीन की कीमत (₹)</Label>
            <Input
              type="number"
              value={machineCost}
              onChange={(e) => setMachineCost(Number(e.target.value))}
              className="h-9 text-xs mt-1"
              data-testid="input-machine-cost"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Space/Shed Rent / जगह किराया (₹)</Label>
              <Input type="number" value={spaceCost} onChange={(e) => setSpaceCost(Number(e.target.value))} className="h-9 text-xs mt-1" data-testid="input-space-cost" />
            </div>
            <div>
              <Label className="text-[10px]">Power Setup / बिजली सेटअप (₹)</Label>
              <Input type="number" value={powerSetup} onChange={(e) => setPowerSetup(Number(e.target.value))} className="h-9 text-xs mt-1" data-testid="input-power-cost" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Raw Material Stock / कच्चा माल (₹)</Label>
              <Input type="number" value={rawMaterial} onChange={(e) => setRawMaterial(Number(e.target.value))} className="h-9 text-xs mt-1" data-testid="input-raw-material" />
            </div>
            <div>
              <Label className="text-[10px]">Misc / अन्य खर्चे (₹)</Label>
              <Input type="number" value={miscCost} onChange={(e) => setMiscCost(Number(e.target.value))} className="h-9 text-xs mt-1" data-testid="input-misc-cost" />
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4 border-primary/20">
        <h4 className="text-xs font-bold mb-3 text-primary">Investment Breakdown / निवेश विवरण</h4>
        <div className="space-y-2">
          {[
            { label: "Machine Cost / मशीन", value: machineCost },
            { label: "Space/Shed / जगह", value: spaceCost },
            { label: "Power Setup / बिजली", value: powerSetup },
            { label: "Raw Material / कच्चा माल", value: rawMaterial },
            { label: "Miscellaneous / अन्य", value: miscCost },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">₹{item.value.toLocaleString("en-IN")}</span>
            </div>
          ))}
          <div className="border-t border-white/10 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">Total Investment / कुल निवेश</span>
              <span className="text-lg font-bold text-primary" data-testid="text-total-investment">
                ₹{totalInvestment.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Typical range: ₹20-35 Lakh / सामान्य सीमा: ₹20-35 लाख
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function ProductionCalculator() {
  const [machineSpeed, setMachineSpeed] = useState(15);
  const [shiftHours, setShiftHours] = useState(8);
  const [sheetWeight, setSheetWeight] = useState(5);
  const [workingDays, setWorkingDays] = useState(26);

  const sheetsPerHour = machineSpeed * 60 / 3;
  const dailySheets = Math.floor(sheetsPerHour * shiftHours * 0.85);
  const dailyTonnage = (dailySheets * sheetWeight) / 1000;
  const monthlyTonnage = dailyTonnage * workingDays;

  return (
    <div className="px-4 space-y-4" data-testid="section-production">
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-primary" />
          Production Calculator / उत्पादन कैलकुलेटर
        </h3>
        <p className="text-[10px] text-muted-foreground mb-4">Estimate daily & monthly output / दैनिक और मासिक उत्पादन</p>

        <div className="space-y-3">
          <div>
            <Label className="text-[10px]">Machine Speed / मशीन स्पीड (meters/min)</Label>
            <Input type="number" value={machineSpeed} onChange={(e) => setMachineSpeed(Number(e.target.value))} className="h-9 text-xs mt-1" data-testid="input-machine-speed" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Shift Hours / शिफ्ट (घंटे)</Label>
              <Input type="number" value={shiftHours} onChange={(e) => setShiftHours(Number(e.target.value))} className="h-9 text-xs mt-1" data-testid="input-shift-hours" />
            </div>
            <div>
              <Label className="text-[10px]">Sheet Weight / शीट वज़न (kg)</Label>
              <Input type="number" value={sheetWeight} onChange={(e) => setSheetWeight(Number(e.target.value))} className="h-9 text-xs mt-1" data-testid="input-sheet-weight" />
            </div>
          </div>
          <div>
            <Label className="text-[10px]">Working Days/Month / महीने में कार्यदिवस</Label>
            <Input type="number" value={workingDays} onChange={(e) => setWorkingDays(Number(e.target.value))} className="h-9 text-xs mt-1" data-testid="input-working-days" />
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 text-center">
          <Gauge className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-primary" data-testid="text-daily-sheets">{dailySheets}</p>
          <p className="text-[10px] text-muted-foreground">Sheets/Day / शीट प्रतिदिन</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <BarChart3 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-emerald-500" data-testid="text-daily-tonnage">{dailyTonnage.toFixed(1)}</p>
          <p className="text-[10px] text-muted-foreground">Tons/Day / टन प्रतिदिन</p>
        </GlassCard>
        <GlassCard className="p-4 text-center col-span-2">
          <TrendingUp className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-amber-500" data-testid="text-monthly-tonnage">{monthlyTonnage.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Tons/Month / टन प्रति माह</p>
          <p className="text-[10px] text-muted-foreground mt-1">(85% efficiency factor applied / 85% कार्यक्षमता)</p>
        </GlassCard>
      </div>
    </div>
  );
}

function ProfitEstimator() {
  const [sellingPrice, setSellingPrice] = useState(75);
  const [rawMaterialCost, setRawMaterialCost] = useState(55);
  const [dailyProduction, setDailyProduction] = useState(2000);
  const [workingDays, setWorkingDays] = useState(26);
  const [operatingCost, setOperatingCost] = useState(5000);

  const marginPerKg = sellingPrice - rawMaterialCost;
  const marginPercent = sellingPrice > 0 ? ((marginPerKg / sellingPrice) * 100) : 0;
  const dailyRevenue = sellingPrice * dailyProduction;
  const dailyRawCost = rawMaterialCost * dailyProduction;
  const dailyProfit = (marginPerKg * dailyProduction) - operatingCost;
  const monthlyProfit = dailyProfit * workingDays;

  return (
    <div className="px-4 space-y-4" data-testid="section-profit">
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Profit Estimator / लाभ अनुमान
        </h3>
        <p className="text-[10px] text-muted-foreground mb-4">Calculate your margins / अपना मार्जिन जानें</p>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Selling Price / बिक्री मूल्य (₹/kg)</Label>
              <Input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} className="h-9 text-xs mt-1" data-testid="input-selling-price" />
            </div>
            <div>
              <Label className="text-[10px]">Raw Material / कच्चा माल (₹/kg)</Label>
              <Input type="number" value={rawMaterialCost} onChange={(e) => setRawMaterialCost(Number(e.target.value))} className="h-9 text-xs mt-1" data-testid="input-raw-cost" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px]">Daily Production / दैनिक उत्पादन (kg)</Label>
              <Input type="number" value={dailyProduction} onChange={(e) => setDailyProduction(Number(e.target.value))} className="h-9 text-xs mt-1" data-testid="input-daily-prod" />
            </div>
            <div>
              <Label className="text-[10px]">Operating Cost / संचालन खर्चा (₹/day)</Label>
              <Input type="number" value={operatingCost} onChange={(e) => setOperatingCost(Number(e.target.value))} className="h-9 text-xs mt-1" data-testid="input-operating-cost" />
            </div>
          </div>
          <div>
            <Label className="text-[10px]">Working Days/Month / महीने में कार्यदिवस</Label>
            <Input type="number" value={workingDays} onChange={(e) => setWorkingDays(Number(e.target.value))} className="h-9 text-xs mt-1" data-testid="input-profit-working-days" />
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Margin/kg</p>
          <p className="text-xl font-bold text-primary" data-testid="text-margin-per-kg">₹{marginPerKg.toFixed(1)}</p>
          <Badge className={`text-[9px] mt-1 ${marginPercent > 25 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"} border-0`}>
            {marginPercent.toFixed(1)}% margin
          </Badge>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">Daily Profit / दैनिक लाभ</p>
          <p className={`text-xl font-bold ${dailyProfit >= 0 ? "text-emerald-500" : "text-red-500"}`} data-testid="text-daily-profit">
            ₹{dailyProfit.toLocaleString("en-IN")}
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-4 border-emerald-500/20">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Monthly Profit / मासिक लाभ ({workingDays} days)</p>
          <p className={`text-3xl font-bold ${monthlyProfit >= 0 ? "text-emerald-500" : "text-red-500"}`} data-testid="text-monthly-profit">
            ₹{monthlyProfit.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">
            Daily Revenue: ₹{dailyRevenue.toLocaleString("en-IN")} | Raw Cost: ₹{dailyRawCost.toLocaleString("en-IN")}
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

function ElectricityRequirement() {
  const machines = [
    { name: "Roof Sheet Machine", nameHi: "छत शीट मशीन", hp: "7.5-10 HP", kw: "5.5-7.5 kW", phase: "3 Phase", connection: "20 kVA" },
    { name: "C/Z Purlin Machine", nameHi: "सी/ज़ेड पर्लिन मशीन", hp: "10-15 HP", kw: "7.5-11 kW", phase: "3 Phase", connection: "25 kVA" },
    { name: "Shutter Patti Machine", nameHi: "शटर पट्टी मशीन", hp: "3-5 HP", kw: "2.2-3.7 kW", phase: "3 Phase", connection: "10 kVA" },
    { name: "Door Frame Machine", nameHi: "डोर फ्रेम मशीन", hp: "7.5 HP", kw: "5.5 kW", phase: "3 Phase", connection: "15 kVA" },
    { name: "False Ceiling Machine", nameHi: "फॉल्स सीलिंग मशीन", hp: "5-7.5 HP", kw: "3.7-5.5 kW", phase: "3 Phase", connection: "15 kVA" },
    { name: "Decoiler", nameHi: "डीकॉइलर", hp: "2-3 HP", kw: "1.5-2.2 kW", phase: "3 Phase", connection: "5 kVA" },
  ];

  return (
    <div className="px-4 space-y-4" data-testid="section-electricity">
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Electricity Requirement / बिजली आवश्यकता
        </h3>
        <p className="text-[10px] text-muted-foreground mb-4">Power needs by machine type / मशीन के अनुसार बिजली</p>

        <div className="space-y-2">
          {machines.map((m) => (
            <Card key={m.name} className="p-3 bg-accent/20 border-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs font-bold">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground">{m.nameHi}</p>
                </div>
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 text-[9px]">{m.phase}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-background/50 rounded-lg p-1.5">
                  <p className="text-[9px] text-muted-foreground">HP</p>
                  <p className="text-xs font-bold">{m.hp}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-1.5">
                  <p className="text-[9px] text-muted-foreground">kW</p>
                  <p className="text-xs font-bold">{m.kw}</p>
                </div>
                <div className="bg-background/50 rounded-lg p-1.5">
                  <p className="text-[9px] text-muted-foreground">Connection</p>
                  <p className="text-xs font-bold">{m.connection}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-4 border-amber-500/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold mb-1">Important Tips / महत्वपूर्ण</h4>
            <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
              <li>Always get 3-phase industrial connection / हमेशा 3-फेज कनेक्शन लें</li>
              <li>Keep 20% buffer in your power setup / 20% बफ़र रखें</li>
              <li>Install proper earthing for safety / उचित अर्थिंग करवाएं</li>
              <li>Monthly bill estimate: ₹8,000-15,000 / मासिक बिल अनुमान</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function ManpowerGuide() {
  const roles = [
    { role: "Machine Operator", roleHi: "मशीन ऑपरेटर", count: "1-2", salary: "₹12,000-18,000/month", desc: "Runs the machine, sets profiles, monitors quality" },
    { role: "Helper", roleHi: "हेल्पर", count: "1-2", salary: "₹8,000-12,000/month", desc: "Feeds coil, collects finished product, assists operator" },
    { role: "Packing Staff", roleHi: "पैकिंग स्टाफ़", count: "1", salary: "₹8,000-10,000/month", desc: "Bundles, packs, and labels finished products" },
    { role: "Supervisor", roleHi: "सुपरवाइज़र", count: "1", salary: "₹15,000-25,000/month", desc: "Oversees production, quality checks, manages workers" },
    { role: "Loading/Unloading", roleHi: "लोडिंग/अनलोडिंग", count: "1-2", salary: "₹8,000-10,000/month", desc: "Handles raw material and dispatch" },
    { role: "Accountant (Part-time)", roleHi: "अकाउंटेंट (पार्ट-टाइम)", count: "1", salary: "₹5,000-8,000/month", desc: "Invoicing, GST returns, bookkeeping" },
  ];

  const totalMin = 12000 + 8000 + 8000 + 15000 + 8000 + 5000;
  const totalMax = 18000 + 12000 + 10000 + 25000 + 10000 + 8000;

  return (
    <div className="px-4 space-y-4" data-testid="section-manpower">
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Manpower Guide / कर्मचारी गाइड
        </h3>
        <p className="text-[10px] text-muted-foreground mb-4">Roles & headcount required / भूमिकाएं और संख्या</p>

        <div className="space-y-2">
          {roles.map((r) => (
            <Card key={r.role} className="p-3 bg-accent/20 border-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="text-xs font-bold">{r.role}</p>
                  <p className="text-[10px] text-muted-foreground">{r.roleHi}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="secondary" className="text-[9px]">{r.count} person(s)</Badge>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mb-1">{r.desc}</p>
              <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{r.salary}</p>
            </Card>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-4 border-primary/20">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Monthly Salary Estimate / कुल मासिक वेतन</p>
          <p className="text-xl font-bold text-primary">
            ₹{totalMin.toLocaleString("en-IN")} - ₹{totalMax.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">For a single-machine unit with 5-8 workers</p>
        </div>
      </GlassCard>
    </div>
  );
}

function LoanSubsidyGuide() {
  const schemes = [
    {
      name: "PMEGP (PM Employment Generation)",
      nameHi: "पीएमईजीपी",
      subsidy: "15-35% of project cost",
      maxAmount: "₹50 Lakh (Manufacturing)",
      eligibility: "18+ years, VIII pass minimum",
      link: "https://www.kviconline.gov.in/pmegpeportal/",
    },
    {
      name: "Mudra Loan (Shishu/Kishore/Tarun)",
      nameHi: "मुद्रा लोन",
      subsidy: "No collateral needed",
      maxAmount: "Up to ₹10 Lakh",
      eligibility: "Any Indian citizen with business plan",
      link: "https://www.mudra.org.in/",
    },
    {
      name: "MSME/Udyam Registration",
      nameHi: "एमएसएमई/उद्यम पंजीकरण",
      subsidy: "Lower interest rates, priority lending",
      maxAmount: "Various benefits",
      eligibility: "Manufacturing unit with Udyam certificate",
      link: "https://udyamregistration.gov.in/",
    },
    {
      name: "CLCSS (Credit Linked Capital Subsidy)",
      nameHi: "सीएलसीएसएस",
      subsidy: "15% capital subsidy on plant & machinery",
      maxAmount: "Up to ₹15 Lakh subsidy",
      eligibility: "Existing MSEs for technology upgradation",
      link: "https://msme.gov.in/",
    },
    {
      name: "State Industrial Subsidies",
      nameHi: "राज्य औद्योगिक सब्सिडी",
      subsidy: "Varies by state (5-25%)",
      maxAmount: "State specific",
      eligibility: "New manufacturing units in the state",
      link: "#",
    },
    {
      name: "Stand-Up India Scheme",
      nameHi: "स्टैंड अप इंडिया",
      subsidy: "Loans between ₹10 Lakh - ₹1 Crore",
      maxAmount: "₹1 Crore",
      eligibility: "SC/ST/Women entrepreneurs",
      link: "https://www.standupmitra.in/",
    },
  ];

  return (
    <div className="px-4 space-y-4" data-testid="section-loans">
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-primary" />
          Loan & Subsidy Guide / लोन और सब्सिडी गाइड
        </h3>
        <p className="text-[10px] text-muted-foreground mb-4">Government schemes for startups / सरकारी योजनाएं</p>

        <div className="space-y-3">
          {schemes.map((s) => (
            <Card key={s.name} className="p-4 bg-accent/20 border-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-xs font-bold">{s.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{s.nameHi}</p>
                </div>
              </div>
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="text-[10px]">{s.subsidy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-3 h-3 text-primary shrink-0" />
                  <span className="text-[10px]">{s.maxAmount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="text-[10px]">{s.eligibility}</span>
                </div>
              </div>
              {s.link !== "#" && (
                <Button size="sm" variant="outline" className="text-[10px] h-7 w-full" onClick={() => window.open(s.link, "_blank")}>
                  <ExternalLink className="w-3 h-3 mr-1" /> Visit Website / वेबसाइट देखें
                </Button>
              )}
            </Card>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function RawMaterialSuppliers() {
  const suppliers = [
    { name: "Tata Steel BSL", location: "Pan India", materials: "GP Coil, CR Coil, HR Coil", phone: "1800-209-8282", rating: 5 },
    { name: "JSW Steel", location: "Pan India", materials: "GP Coil, CR Coil, Color Coated", phone: "1800-102-2244", rating: 5 },
    { name: "SAIL (Steel Authority of India)", location: "Pan India", materials: "GP/CR/HR Coil, TMT Bars", phone: "1800-114-000", rating: 4.5 },
    { name: "Jindal Steel & Power", location: "Pan India", materials: "GP Coil, CR Coil", phone: "011-4111-2800", rating: 4.5 },
    { name: "Uttam Galva Steels", location: "Mumbai, Delhi, Kolkata", materials: "GP Coil, GI Coil", phone: "", rating: 4 },
    { name: "Mundka Steel Market", location: "Delhi-Mundka", materials: "GP/CR Coil (Local Dealers)", phone: "+91 9090-486-262 (Refer)", rating: 4 },
    { name: "Bhushan Steel (now Tata)", location: "Pan India", materials: "GP Coil, CR Coil", phone: "1800-209-8282", rating: 4.5 },
  ];

  return (
    <div className="px-4 space-y-4" data-testid="section-suppliers">
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          Raw Material Suppliers / कच्चा माल सप्लायर
        </h3>
        <p className="text-[10px] text-muted-foreground mb-4">GP/CR coil suppliers across India / भारत में सप्लायर</p>

        <div className="space-y-2">
          {suppliers.map((s) => (
            <Card key={s.name} className="p-3 bg-accent/20 border-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-xs font-bold">{s.name}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={`w-2.5 h-2.5 ${i <= Math.floor(s.rating) ? "text-amber-400 fill-amber-400" : "text-zinc-300 dark:text-zinc-600"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <MapPin className="w-2.5 h-2.5" /> {s.location}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Package className="w-2.5 h-2.5" /> {s.materials}
                </div>
                {s.phone && (
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Phone className="w-2.5 h-2.5 text-muted-foreground" />
                    <button onClick={() => window.open(`tel:${s.phone.replace(/[^0-9+]/g, "")}`)} className="text-primary underline">{s.phone}</button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function MaintenanceTips() {
  const tips = [
    {
      category: "Roller Cleaning / रोलर सफ़ाई",
      icon: Cog,
      color: "text-blue-500",
      items: [
        "Clean rollers daily after shift with a dry cloth / शिफ्ट के बाद सूखे कपड़े से साफ करें",
        "Remove metal dust and debris from roller gaps / रोलर गैप से धातु की धूल हटाएं",
        "Use WD-40 spray for stubborn deposits / जिद्दी जमाव के लिए WD-40 स्प्रे करें",
        "Never use water directly on rollers / रोलर पर सीधे पानी न डालें",
      ],
    },
    {
      category: "Lubrication / ग्रीसिंग",
      icon: Droplets,
      color: "text-emerald-500",
      items: [
        "Grease bearings every 15 days / हर 15 दिन में बेयरिंग ग्रीस करें",
        "Use EP-2 or EP-3 grade grease / EP-2 या EP-3 ग्रेड ग्रीस इस्तेमाल करें",
        "Oil chain drive weekly / चेन ड्राइव में हफ्ते में तेल लगाएं",
        "Check gearbox oil level monthly / गियरबॉक्स ऑयल लेवल मासिक जांचें",
      ],
    },
    {
      category: "Alignment / अलाइनमेंट",
      icon: Ruler,
      color: "text-amber-500",
      items: [
        "Check roller alignment every month / हर महीने रोलर अलाइनमेंट जांचें",
        "Ensure proper gap between rollers / रोलर के बीच उचित गैप रखें",
        "Inspect guide rollers for wear / गाइड रोलर की घिसावट जांचें",
        "Tighten loose bolts and nuts weekly / ढीले बोल्ट और नट हफ्ते में कसें",
      ],
    },
    {
      category: "Electrical / इलेक्ट्रिकल",
      icon: Zap,
      color: "text-red-500",
      items: [
        "Check motor temperature during operation / ऑपरेशन में मोटर तापमान जांचें",
        "Inspect wiring connections quarterly / तारों के कनेक्शन तिमाही जांचें",
        "Test emergency stop button daily / इमरजेंसी स्टॉप बटन रोज़ टेस्ट करें",
        "Keep control panel clean and dust-free / कंट्रोल पैनल साफ रखें",
      ],
    },
    {
      category: "General / सामान्य",
      icon: Shield,
      color: "text-purple-500",
      items: [
        "Maintain a daily log of production and issues / उत्पादन और समस्याओं का दैनिक लॉग रखें",
        "Schedule professional servicing every 6 months / हर 6 महीने में प्रोफेशनल सर्विसिंग कराएं",
        "Keep spare parts stock (bearings, belts, cutters) / स्पेयर पार्ट्स स्टॉक रखें",
        "Train operators on basic troubleshooting / ऑपरेटर्स को बेसिक ट्रबलशूटिंग सिखाएं",
      ],
    },
  ];

  return (
    <div className="px-4 space-y-4" data-testid="section-maintenance">
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-primary" />
          Maintenance Tips / रखरखाव टिप्स
        </h3>
        <p className="text-[10px] text-muted-foreground mb-4">Keep your machines running smoothly / मशीनें सुचारू रखें</p>

        <div className="space-y-3">
          {tips.map((t) => (
            <Card key={t.category} className="p-3 bg-accent/20 border-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg bg-accent/50 flex items-center justify-center`}>
                  <t.icon className={`w-3.5 h-3.5 ${t.color}`} />
                </div>
                <h4 className="text-xs font-bold">{t.category}</h4>
              </div>
              <ul className="space-y-1.5">
                {t.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

export default function BusinessGuide() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("overview");

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "overview": return <BusinessOverview />;
      case "investment": return <InvestmentCalculator />;
      case "production": return <ProductionCalculator />;
      case "profit": return <ProfitEstimator />;
      case "electricity": return <ElectricityRequirement />;
      case "manpower": return <ManpowerGuide />;
      case "loans": return <LoanSubsidyGuide />;
      case "suppliers": return <RawMaterialSuppliers />;
      case "maintenance": return <MaintenanceTips />;
      default: return <BusinessOverview />;
    }
  };

  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <div className="pb-24" data-testid="page-business-guide">
      <div className="sticky top-0 z-30 glass-header border-b border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="sm" className="p-1.5 h-auto" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold truncate">Business Startup Guide</h1>
            <p className="text-[10px] text-muted-foreground truncate">
              {currentSection?.label} — {currentSection?.labelHi}
            </p>
          </div>
          <Badge variant="secondary" className="text-[9px] shrink-0">
            {sections.findIndex((s) => s.id === activeSection) + 1}/{sections.length}
          </Badge>
        </div>
        <SectionNav activeSection={activeSection} onSelect={handleSectionChange} />
      </div>

      <div className="pt-4">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {renderSection()}
        </motion.div>
      </div>

      <div className="px-4 mt-6">
        <GlassCard className="p-4">
          <div className="text-center">
            <h4 className="text-xs font-bold mb-1">Need Help Starting? / शुरू करने में मदद चाहिए?</h4>
            <p className="text-[10px] text-muted-foreground mb-3">
              Contact Sai Rolotech for machine consultation and best pricing
            </p>
            <div className="flex gap-2 justify-center">
              <Button size="sm" className="text-xs" onClick={() => window.open("tel:+919090486262")} data-testid="button-call-cta">
                <Phone className="w-3 h-3 mr-1" /> Call Now
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => window.open("https://wa.me/919090486262?text=Hi%20I%20want%20to%20start%20a%20roll%20forming%20business")} data-testid="button-whatsapp-cta">
                WhatsApp
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
