import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Calculator, TrendingUp, IndianRupee, Clock, BarChart3, ChevronDown, ChevronUp } from "lucide-react";

export default function ROICalculator() {
  const [machinePrice, setMachinePrice] = useState("13.5");
  const [productionSpeed, setProductionSpeed] = useState("40");
  const [hoursPerDay, setHoursPerDay] = useState("10");
  const [daysPerMonth, setDaysPerMonth] = useState("26");
  const [sellingRate, setSellingRate] = useState("95");
  const [coilRate, setCoilRate] = useState("74.5");
  const [gauge, setGauge] = useState("0.50");
  const [weightPerMeter, setWeightPerMeter] = useState("0.45");
  const [electricityCost, setElectricityCost] = useState("8");
  const [motorHP, setMotorHP] = useState("7.5");
  const [laborCost, setLaborCost] = useState("15000");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const results = useMemo(() => {
    const price = parseFloat(machinePrice) * 100000;
    const speed = parseFloat(productionSpeed);
    const hours = parseFloat(hoursPerDay);
    const days = parseFloat(daysPerMonth);
    const sell = parseFloat(sellingRate);
    const coil = parseFloat(coilRate);
    const weight = parseFloat(weightPerMeter);
    const elecRate = parseFloat(electricityCost);
    const hp = parseFloat(motorHP);
    const labor = parseFloat(laborCost);

    if (isNaN(price) || isNaN(speed) || isNaN(hours) || isNaN(days)) return null;

    const metersPerDay = speed * 60 * hours * 0.8;
    const metersPerMonth = metersPerDay * days;

    const rawMaterialCostPerMeter = weight * coil;
    const monthlyRawMaterial = rawMaterialCostPerMeter * metersPerMonth;
    const monthlyRevenue = (sell / 1000) * weight * metersPerMonth;

    const motorKW = hp * 0.746;
    const monthlyElectricity = motorKW * hours * days * elecRate;

    const monthlyExpenses = monthlyRawMaterial + monthlyElectricity + labor;
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    const roiMonths = monthlyProfit > 0 ? price / monthlyProfit : Infinity;

    return {
      metersPerDay: Math.round(metersPerDay),
      metersPerMonth: Math.round(metersPerMonth),
      monthlyRevenue: Math.round(monthlyRevenue),
      monthlyExpenses: Math.round(monthlyExpenses),
      monthlyRawMaterial: Math.round(monthlyRawMaterial),
      monthlyElectricity: Math.round(monthlyElectricity),
      monthlyProfit: Math.round(monthlyProfit),
      roiMonths: roiMonths === Infinity ? "N/A" : `${roiMonths.toFixed(1)} months`,
      dailyProfit: Math.round(monthlyProfit / days),
    };
  }, [machinePrice, productionSpeed, hoursPerDay, daysPerMonth, sellingRate, coilRate, weightPerMeter, electricityCost, motorHP, laborCost]);

  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-3">
        <h1 className="text-xl font-bold mb-1 flex items-center gap-2" data-testid="text-roi-title">
          <Calculator className="w-5 h-5 text-primary" />
          ROI Calculator
        </h1>
        <p className="text-sm text-muted-foreground">Calculate your return on investment for roll forming machines</p>
      </div>

      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-sm mb-4" data-testid="text-basic-inputs">Machine Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Machine Price (Lakh)</Label>
            <Input
              type="number"
              value={machinePrice}
              onChange={(e) => setMachinePrice(e.target.value)}
              data-testid="input-machine-price"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Speed (m/min)</Label>
            <Input
              type="number"
              value={productionSpeed}
              onChange={(e) => setProductionSpeed(e.target.value)}
              data-testid="input-speed"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Hours/Day</Label>
            <Input
              type="number"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              data-testid="input-hours"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Days/Month</Label>
            <Input
              type="number"
              value={daysPerMonth}
              onChange={(e) => setDaysPerMonth(e.target.value)}
              data-testid="input-days"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-sm mb-4" data-testid="text-material-inputs">Material & Pricing</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Coil Rate (per kg)</Label>
            <Input
              type="number"
              value={coilRate}
              onChange={(e) => setCoilRate(e.target.value)}
              data-testid="input-coil-rate"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Selling Rate (per ton)</Label>
            <Input
              type="number"
              value={sellingRate}
              onChange={(e) => setSellingRate(e.target.value)}
              data-testid="input-selling-rate"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Weight/Meter (kg)</Label>
            <Input
              type="number"
              value={weightPerMeter}
              onChange={(e) => setWeightPerMeter(e.target.value)}
              data-testid="input-weight"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Motor HP</Label>
            <Input
              type="number"
              value={motorHP}
              onChange={(e) => setMotorHP(e.target.value)}
              data-testid="input-motor-hp"
            />
          </div>
        </div>
      </Card>

      <button
        className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-4 px-1"
        onClick={() => setShowAdvanced(!showAdvanced)}
        data-testid="button-toggle-advanced"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        Advanced Settings
      </button>

      {showAdvanced && (
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Electricity (per unit)</Label>
              <Input
                type="number"
                value={electricityCost}
                onChange={(e) => setElectricityCost(e.target.value)}
                data-testid="input-electricity"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Labor Cost/Month</Label>
              <Input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                data-testid="input-labor"
              />
            </div>
          </div>
        </Card>
      )}

      {results && (
        <div className="space-y-3">
          <Card className="p-4 bg-primary/5 border-primary/10">
            <div className="flex items-center justify-between gap-1 mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2" data-testid="text-roi-results">
                <TrendingUp className="w-4 h-4 text-primary" />
                ROI Summary
              </h3>
              <Badge variant="default" data-testid="badge-roi-months">{results.roiMonths}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Monthly Revenue</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-monthly-revenue">
                  {results.monthlyRevenue.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-background rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Monthly Expenses</p>
                <p className="text-lg font-bold text-red-500" data-testid="text-monthly-expenses">
                  {results.monthlyExpenses.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-background rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Monthly Profit</p>
                <p className={`text-lg font-bold ${results.monthlyProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`} data-testid="text-monthly-profit">
                  {results.monthlyProfit.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-background rounded-md p-3">
                <p className="text-xs text-muted-foreground mb-1">Daily Profit</p>
                <p className={`text-lg font-bold ${results.dailyProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`} data-testid="text-daily-profit">
                  {results.dailyProfit.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" data-testid="text-production-stats">
              <BarChart3 className="w-4 h-4 text-primary" />
              Production Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-sm text-muted-foreground">Daily Production</span>
                <span className="text-sm font-semibold" data-testid="text-daily-production">{results.metersPerDay.toLocaleString()} meters</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-sm text-muted-foreground">Monthly Production</span>
                <span className="text-sm font-semibold" data-testid="text-monthly-production">{results.metersPerMonth.toLocaleString()} meters</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <span className="text-sm text-muted-foreground">Raw Material Cost</span>
                <span className="text-sm font-semibold">{results.monthlyRawMaterial.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Electricity Cost</span>
                <span className="text-sm font-semibold">{results.monthlyElectricity.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
