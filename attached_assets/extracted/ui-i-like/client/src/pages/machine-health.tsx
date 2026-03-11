import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { HealthCheck } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Activity, Volume2, Vibrate, Droplets, Target, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

const CATEGORIES = ["Rolling Shutter", "POP Channel", "Gypsum Channel", "T-Grid", "Roofing Sheet", "Door Frame", "Z/C Purlin", "Guard Rail"];
const MODELS = ["Basic", "Medium", "Advance"];

function ScoreGauge({ score }: { score: number }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="10" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}%</span>
        <span className="text-[10px] text-muted-foreground font-medium">
          {score >= 80 ? "Healthy" : score >= 50 ? "Warning" : "Critical"}
        </span>
      </div>
    </div>
  );
}

function RatingSlider({ value, onChange, label, icon: Icon, description }: {
  value: number; onChange: (v: number) => void; label: string; icon: any; description: string;
}) {
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];
  const labels = ["Very Poor", "Poor", "Average", "Good", "Excellent"];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <Label className="text-xs font-medium">{label}</Label>
        </div>
        <Badge variant="outline" className="text-[10px]">{labels[value - 1]}</Badge>
      </div>
      <p className="text-[10px] text-muted-foreground">{description}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`flex-1 h-8 rounded-md text-xs font-bold transition-all ${
              v <= value ? `${colors[v - 1]} text-white` : "bg-muted/50 text-muted-foreground"
            }`}
            data-testid={`button-rating-${label.toLowerCase().replace(/\s/g, "-")}-${v}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MachineHealthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(true);
  const [form, setForm] = useState({
    operatorName: "",
    operatorPhone: "",
    machineModel: "Basic",
    machineCategory: "Rolling Shutter",
    noiseLevel: 3,
    vibration: 3,
    oilLeakage: 3,
    productionAccuracy: 3,
    notes: "",
  });
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  const { data: checks, isLoading } = useQuery<HealthCheck[]>({
    queryKey: ["/api/health-checks"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/health-checks", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-checks"] });
      setSubmittedScore(data.overallScore);
      setShowForm(false);
      toast({ title: `Health Score: ${data.overallScore}%` });
    },
    onError: () => toast({ title: "Failed to submit", variant: "destructive" }),
  });

  const handleSubmit = () => {
    if (!form.operatorName) {
      toast({ title: "Enter operator name", variant: "destructive" });
      return;
    }
    const overallScore = Math.round(((form.noiseLevel + form.vibration + form.oilLeakage + form.productionAccuracy) / 20) * 100);
    submitMutation.mutate({ ...form, overallScore });
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (score >= 50) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation("/")} data-testid="button-back-health">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-bold" data-testid="text-page-title">Machine Health Score</h1>
          <p className="text-[10px] text-muted-foreground">Daily operator checklist</p>
        </div>
        <Activity className="w-5 h-5 text-green-500 ml-auto" />
      </div>

      <div className="p-4 space-y-4">
        {submittedScore !== null && !showForm && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-primary/30" data-testid="card-health-result">
              <CardContent className="pt-6 pb-4">
                <h3 className="text-sm font-bold text-center mb-4">Machine Health Report</h3>
                <ScoreGauge score={submittedScore} />
                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    {submittedScore >= 80 ? "Machine is running smoothly. Keep up the maintenance!" :
                     submittedScore >= 50 ? "Some attention needed. Schedule maintenance soon." :
                     "Immediate attention required! Stop and inspect machine."}
                  </p>
                  <Button
                    size="sm"
                    className="mt-4 text-xs"
                    onClick={() => { setShowForm(true); setSubmittedScore(null); setForm(f => ({ ...f, noiseLevel: 3, vibration: 3, oilLeakage: 3, productionAccuracy: 3, notes: "" })); }}
                    data-testid="button-new-check"
                  >
                    New Check
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {showForm && (
          <Card data-testid="card-health-form">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Daily Health Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px]">Operator Name *</Label>
                  <Input value={form.operatorName} onChange={e => setForm(f => ({...f, operatorName: e.target.value}))} className="h-8 text-xs" placeholder="Your name" data-testid="input-operator-name" />
                </div>
                <div>
                  <Label className="text-[10px]">Phone</Label>
                  <Input value={form.operatorPhone} onChange={e => setForm(f => ({...f, operatorPhone: e.target.value}))} className="h-8 text-xs" placeholder="Phone" data-testid="input-operator-phone" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px]">Machine Category</Label>
                  <select
                    value={form.machineCategory}
                    onChange={e => setForm(f => ({...f, machineCategory: e.target.value}))}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                    data-testid="select-machine-category"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-[10px]">Model</Label>
                  <select
                    value={form.machineModel}
                    onChange={e => setForm(f => ({...f, machineModel: e.target.value}))}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                    data-testid="select-machine-model"
                  >
                    {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <RatingSlider
                  value={form.noiseLevel}
                  onChange={v => setForm(f => ({...f, noiseLevel: v}))}
                  label="Noise Level"
                  icon={Volume2}
                  description="1 = Very loud/abnormal, 5 = Quiet/normal operation"
                />
                <RatingSlider
                  value={form.vibration}
                  onChange={v => setForm(f => ({...f, vibration: v}))}
                  label="Vibration"
                  icon={Vibrate}
                  description="1 = Heavy shaking, 5 = Smooth/stable"
                />
                <RatingSlider
                  value={form.oilLeakage}
                  onChange={v => setForm(f => ({...f, oilLeakage: v}))}
                  label="Oil Leakage"
                  icon={Droplets}
                  description="1 = Major leaks, 5 = No leaks at all"
                />
                <RatingSlider
                  value={form.productionAccuracy}
                  onChange={v => setForm(f => ({...f, productionAccuracy: v}))}
                  label="Production Accuracy"
                  icon={Target}
                  description="1 = Poor quality output, 5 = Perfect dimensions"
                />
              </div>

              <div className="pt-1 px-1">
                <div className="bg-accent/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-muted-foreground">Live Score Preview</span>
                    <span className="text-xs font-bold">
                      {Math.round(((form.noiseLevel + form.vibration + form.oilLeakage + form.productionAccuracy) / 20) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        Math.round(((form.noiseLevel + form.vibration + form.oilLeakage + form.productionAccuracy) / 20) * 100) >= 80 ? "bg-green-500" :
                        Math.round(((form.noiseLevel + form.vibration + form.oilLeakage + form.productionAccuracy) / 20) * 100) >= 50 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      animate={{ width: `${Math.round(((form.noiseLevel + form.vibration + form.oilLeakage + form.productionAccuracy) / 20) * 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-[10px]">Notes (optional)</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} className="text-xs min-h-[50px]" placeholder="Any observations..." data-testid="input-health-notes" />
              </div>

              <Button className="w-full" onClick={handleSubmit} disabled={submitMutation.isPending} data-testid="button-submit-health">
                <Activity className="w-4 h-4 mr-2" />
                {submitMutation.isPending ? "Submitting..." : "Submit Health Check"}
              </Button>
            </CardContent>
          </Card>
        )}

        <div>
          <h3 className="text-sm font-bold mb-3 px-1">Recent Health Checks</h3>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : checks && checks.length > 0 ? (
            <div className="space-y-2">
              {checks.slice(0, 10).map((check: any) => (
                <Card key={check.id} data-testid={`card-check-${check.id}`}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getScoreIcon(check.overallScore)}
                        <div>
                          <p className="text-xs font-medium">{check.operatorName}</p>
                          <p className="text-[10px] text-muted-foreground">{check.machineCategory} - {check.machineModel}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          check.overallScore >= 80 ? "text-green-600" :
                          check.overallScore >= 50 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {check.overallScore}%
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {new Date(check.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-2 text-[9px] text-muted-foreground">
                      <span>Noise: {check.noiseLevel}/5</span>
                      <span>Vibration: {check.vibration}/5</span>
                      <span>Oil: {check.oilLeakage}/5</span>
                      <span>Accuracy: {check.productionAccuracy}/5</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No health checks yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
