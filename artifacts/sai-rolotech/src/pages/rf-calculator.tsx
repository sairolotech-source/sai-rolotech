import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Cog, Zap, Weight, Gauge, Layers, Activity
} from "lucide-react";

export default function RFCalculator() {
  const [, setLocation] = useLocation();
  const [thickness, setThickness] = useState("0.5");
  const [coilWidth, setCoilWidth] = useState("200");
  const [machineSpeed, setMachineSpeed] = useState("15");

  const thicknessPresets = [
    { label: "0.4", value: "0.4" },
    { label: "0.5", value: "0.5" },
    { label: "0.8", value: "0.8" },
    { label: "1.0", value: "1.0" },
    { label: "1.2", value: "1.2" },
  ];

  const widthPresets = [
    { label: "150", value: "150" },
    { label: "200", value: "200" },
    { label: "300", value: "300" },
    { label: "500", value: "500" },
  ];

  const results = useMemo(() => {
    const t = parseFloat(thickness);
    const w = parseFloat(coilWidth);
    const speed = parseFloat(machineSpeed);

    if (isNaN(t) || isNaN(w) || isNaN(speed) || t <= 0 || w <= 0 || speed <= 0) return null;

    const sheetLengthM = 3.0;
    const metersPerMin = speed;
    const metersPerHour = metersPerMin * 60 * 0.85;
    const sheetsPerHour = Math.round(metersPerHour / sheetLengthM);

    const tMm = t;
    const wMm = w;
    const rollerDiameter = 150;
    const numPasses = Math.ceil(wMm / 25);
    const yieldStrength = 250;

    const bendForcePerPass = (yieldStrength * wMm * tMm * tMm) / (4 * rollerDiameter);
    const totalRollerLoad = (bendForcePerPass * numPasses) / 1000;

    const motorKW = (totalRollerLoad * speed) / (60 * 0.85);
    const estimatedPower = Math.max(motorKW, 2.2);

    return {
      sheetsPerHour,
      metersPerHour: Math.round(metersPerHour),
      estimatedPower: estimatedPower.toFixed(1),
      rollerLoad: totalRollerLoad.toFixed(1),
      numPasses,
      dailyOutput8hr: sheetsPerHour * 8,
    };
  }, [thickness, coilWidth, machineSpeed]);

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation("/tools")} className="p-1" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-sm" data-testid="text-rf-calc-title">RF Calculator</h1>
          <p className="text-[10px] text-muted-foreground">Roll forming production calculator</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label className="text-xs flex items-center gap-1.5 mb-1.5">
                <Layers className="w-3.5 h-3.5" /> Sheet Thickness (mm)
              </Label>
              <Input
                type="number"
                step="0.1"
                value={thickness}
                onChange={(e) => setThickness(e.target.value)}
                placeholder="e.g. 0.5"
                data-testid="input-thickness"
              />
              <div className="flex gap-2 mt-2">
                {thicknessPresets.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setThickness(p.value)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${thickness === p.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
                    data-testid={`button-thickness-${p.label}`}
                  >
                    {p.label} mm
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs flex items-center gap-1.5 mb-1.5">
                <Gauge className="w-3.5 h-3.5" /> Coil Width (mm)
              </Label>
              <Input
                type="number"
                value={coilWidth}
                onChange={(e) => setCoilWidth(e.target.value)}
                placeholder="e.g. 200"
                data-testid="input-coil-width"
              />
              <div className="flex gap-2 mt-2">
                {widthPresets.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setCoilWidth(p.value)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${coilWidth === p.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
                    data-testid={`button-width-${p.label}`}
                  >
                    {p.label} mm
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs flex items-center gap-1.5 mb-1.5">
                <Activity className="w-3.5 h-3.5" /> Machine Speed (m/min)
              </Label>
              <Input
                type="number"
                value={machineSpeed}
                onChange={(e) => setMachineSpeed(e.target.value)}
                placeholder="e.g. 15"
                data-testid="input-machine-speed"
              />
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={machineSpeed}
                  onChange={(e) => setMachineSpeed(e.target.value)}
                  className="flex-1 accent-primary h-1.5"
                  data-testid="slider-machine-speed"
                />
                <span className="text-[10px] text-muted-foreground w-14 text-right">{machineSpeed} m/min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {results && (
          <>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-4">
                <div className="text-center mb-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Production Output</p>
                  <p className="text-3xl font-bold text-primary" data-testid="text-sheets-per-hour">
                    {results.sheetsPerHour.toLocaleString()}
                    <span className="text-lg ml-1">sheets/hr</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Based on 3m sheet length, 85% efficiency
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background rounded-lg p-3 text-center">
                    <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground mb-0.5">Est. Power</p>
                    <p className="text-sm font-bold" data-testid="text-power">
                      {results.estimatedPower} kW
                    </p>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <Weight className="w-4 h-4 text-red-500 mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground mb-0.5">Roller Load</p>
                    <p className="text-sm font-bold" data-testid="text-roller-load">
                      {results.rollerLoad} kN
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" data-testid="text-details-heading">
                  <Cog className="w-4 h-4 text-primary" />
                  Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-sm text-muted-foreground">Line Speed</span>
                    <span className="text-sm font-semibold" data-testid="text-meters-per-hour">{results.metersPerHour} m/hr</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-sm text-muted-foreground">Forming Passes</span>
                    <span className="text-sm font-semibold" data-testid="text-num-passes">{results.numPasses}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed">
                    <span className="text-sm text-muted-foreground">Daily Output (8 hrs)</span>
                    <span className="text-sm font-semibold" data-testid="text-daily-output">{results.dailyOutput8hr.toLocaleString()} sheets</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Motor Recommendation</span>
                    <Badge variant="secondary" data-testid="badge-motor">
                      {parseFloat(results.estimatedPower) <= 3.7 ? "5 HP" :
                       parseFloat(results.estimatedPower) <= 5.5 ? "7.5 HP" :
                       parseFloat(results.estimatedPower) <= 7.5 ? "10 HP" :
                       parseFloat(results.estimatedPower) <= 11 ? "15 HP" : "20 HP"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
              <CardContent className="pt-3 pb-3">
                <h4 className="font-semibold text-xs mb-1 text-blue-800 dark:text-blue-300">Note</h4>
                <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80">
                  Calculations are estimates based on standard mild steel (yield strength 250 MPa) and 85% machine efficiency. Actual values may vary based on material grade, profile complexity, and machine condition.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}