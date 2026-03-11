import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AmcPlan, AmcSubscription } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Shield, CheckCircle2, Star, Crown, Zap, Calendar,
  Phone, Copy, Clock, Wrench, Users
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

type ViewType = "plans" | "buy" | "success";

const tierColors: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  basic: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Shield },
  standard: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Star },
  premium: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: Crown },
};

function PlanCard({ plan, onSelect }: { plan: AmcPlan; onSelect: () => void }) {
  const colors = tierColors[plan.tier] || tierColors.basic;
  const TierIcon = colors.icon;

  return (
    <Card
      className={`relative ${plan.isPopular ? `${colors.border} ${colors.bg}` : ""}`}
      data-testid={`card-plan-${plan.tier}`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-amber-500 text-white text-[10px] shadow-sm">Most Popular</Badge>
        </div>
      )}
      <CardContent className={`pt-5 ${plan.isPopular ? "pt-7" : ""}`}>
        <div className="text-center mb-4">
          <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${colors.bg} ${colors.text}`}>
            <TierIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base" data-testid={`text-plan-name-${plan.tier}`}>{plan.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{plan.visitsPerYear} visits/year</p>
        </div>

        <div className="text-center mb-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-bold">₹{plan.price1Year}</span>
            <span className="text-xs text-muted-foreground">/year</span>
          </div>
          {plan.price2Year && (
            <p className="text-xs text-muted-foreground mt-0.5">
              2 Year: ₹{plan.price2Year} <span className="text-green-600 font-medium">(Save more)</span>
            </p>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {plan.features?.map((feature, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${colors.text}`} />
              <span className="text-xs">{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {plan.phoneSupport && (
            <Badge variant="secondary" className="text-[9px] gap-0.5"><Phone className="w-2.5 h-2.5" /> Phone</Badge>
          )}
          {plan.prioritySupport && (
            <Badge variant="secondary" className="text-[9px] gap-0.5"><Zap className="w-2.5 h-2.5" /> Priority</Badge>
          )}
          {plan.emergencySupport && (
            <Badge variant="secondary" className="text-[9px] gap-0.5"><Clock className="w-2.5 h-2.5" /> 24/7</Badge>
          )}
          {plan.freeLabor && (
            <Badge variant="secondary" className="text-[9px] gap-0.5"><Wrench className="w-2.5 h-2.5" /> Free Labor</Badge>
          )}
          {plan.dedicatedPartner && (
            <Badge variant="secondary" className="text-[9px] gap-0.5"><Users className="w-2.5 h-2.5" /> Dedicated</Badge>
          )}
        </div>

        <Button
          className="w-full"
          variant={plan.isPopular ? "default" : "outline"}
          onClick={onSelect}
          data-testid={`button-select-${plan.tier}`}
        >
          Select {plan.name}
        </Button>
      </CardContent>
    </Card>
  );
}

function BuyAmcForm({ plan, onSuccess }: { plan: AmcPlan; onSuccess: (sub: AmcSubscription) => void }) {
  const { toast } = useToast();
  const [duration, setDuration] = useState<"1_year" | "2_year">("1_year");
  const [form, setForm] = useState({
    buyerName: "",
    buyerPhone: "",
    buyerEmail: "",
    companyName: "",
    machineName: "",
    machineModel: "",
    installationDate: "",
  });

  const amount = duration === "1_year" ? plan.price1Year : (plan.price2Year || plan.price1Year);
  const today = new Date();
  const startDate = today.toISOString().split("T")[0];
  const endDate = new Date(today.getFullYear() + (duration === "2_year" ? 2 : 1), today.getMonth(), today.getDate()).toISOString().split("T")[0];

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/amc-subscriptions", {
        ...form,
        planId: plan.id,
        duration,
        startDate,
        endDate,
        amount,
        buyerEmail: form.buyerEmail || undefined,
        companyName: form.companyName || undefined,
        machineModel: form.machineModel || undefined,
        installationDate: form.installationDate || undefined,
        paymentMethod: "offline",
        status: "pending",
      });
      return res.json();
    },
    onSuccess: (sub) => {
      queryClient.invalidateQueries({ queryKey: ["/api/amc-subscriptions"] });
      onSuccess(sub);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const isValid = form.buyerName && form.buyerPhone.length >= 10 && form.machineName;

  const colors = tierColors[plan.tier] || tierColors.basic;

  return (
    <div className="space-y-4">
      <Card className={`${colors.border} ${colors.bg}`}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg} ${colors.text}`}>
              {plan.tier === "premium" ? <Crown className="w-5 h-5" /> : plan.tier === "standard" ? <Star className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm">{plan.name}</h3>
              <p className="text-xs text-muted-foreground">{plan.visitsPerYear} visits/year</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-3">Duration & Pricing</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDuration("1_year")}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                duration === "1_year" ? "border-primary bg-primary/5" : "border-border"
              }`}
              data-testid="button-1-year"
            >
              <p className="text-xs font-medium">1 Year</p>
              <p className="text-lg font-bold mt-1">₹{plan.price1Year}</p>
            </button>
            {plan.price2Year && (
              <button
                onClick={() => setDuration("2_year")}
                className={`p-3 rounded-lg border-2 text-center transition-all relative ${
                  duration === "2_year" ? "border-primary bg-primary/5" : "border-border"
                }`}
                data-testid="button-2-year"
              >
                <Badge className="absolute -top-2 right-1 text-[8px] bg-green-500 text-white">Save</Badge>
                <p className="text-xs font-medium">2 Years</p>
                <p className="text-lg font-bold mt-1">₹{plan.price2Year}</p>
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-3">Your Details</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Name *</Label>
              <Input
                value={form.buyerName}
                onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                placeholder="Your full name"
                data-testid="input-amc-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Phone *</Label>
                <Input
                  value={form.buyerPhone}
                  onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
                  placeholder="10-digit"
                  data-testid="input-amc-phone"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  value={form.buyerEmail}
                  onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
                  placeholder="Optional"
                  data-testid="input-amc-email"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Company Name</Label>
              <Input
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Optional"
                data-testid="input-amc-company"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-3">Machine Details</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Machine Name *</Label>
              <Input
                value={form.machineName}
                onChange={(e) => setForm({ ...form, machineName: e.target.value })}
                placeholder="e.g. POP Channel Machine"
                data-testid="input-amc-machine"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Model</Label>
                <Input
                  value={form.machineModel}
                  onChange={(e) => setForm({ ...form, machineModel: e.target.value })}
                  placeholder="Optional"
                  data-testid="input-amc-model"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Installation Date</Label>
                <Input
                  type="date"
                  value={form.installationDate}
                  onChange={(e) => setForm({ ...form, installationDate: e.target.value })}
                  data-testid="input-amc-install-date"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total Amount</span>
            <span className="text-xl font-bold text-primary">₹{amount}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {duration === "1_year" ? "1 Year" : "2 Years"} | {plan.name} | Starts {startDate}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Payment will be collected offline. Our team will contact you.
          </p>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        onClick={() => mutation.mutate()}
        disabled={!isValid || mutation.isPending}
        data-testid="button-submit-amc"
      >
        {mutation.isPending ? "Processing..." : `Buy ${plan.name} - ₹${amount}`}
      </Button>
    </div>
  );
}

function SubscriptionSuccess({ sub, plan }: { sub: AmcSubscription; plan: AmcPlan }) {
  const { toast } = useToast();

  const copySubNumber = () => {
    navigator.clipboard.writeText(sub.subscriptionNumber);
    toast({ title: "Copied!", description: "Subscription number copied" });
  };

  const shareWhatsApp = () => {
    const text = `AMC Subscription Request\n\nSubscription: ${sub.subscriptionNumber}\nPlan: ${plan.name}\nMachine: ${sub.machineName}\nDuration: ${sub.duration === "2_year" ? "2 Years" : "1 Year"}\nAmount: ₹${sub.amount}\n\nSai Rolotech: +91 9090-486-262`;
    window.open(`https://wa.me/919090486262?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h2 className="font-bold text-lg mb-1" data-testid="text-amc-success">AMC Request Submitted!</h2>
          <p className="text-xs text-muted-foreground mb-4">Our team will contact you to finalize the contract.</p>

          <div className="bg-background rounded-lg p-4 border mb-3">
            <p className="text-[10px] text-muted-foreground mb-1">Subscription Number</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-mono font-bold text-primary" data-testid="text-amc-number">
                {sub.subscriptionNumber}
              </span>
              <button onClick={copySubNumber} className="p-1.5 rounded-md hover:bg-accent" data-testid="button-copy-amc">
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Machine:</span>
              <span className="font-medium">{sub.machineName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{sub.duration === "2_year" ? "2 Years" : "1 Year"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold text-primary">₹{sub.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Period:</span>
              <span className="font-medium">{sub.startDate} to {sub.endDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className="text-[9px] bg-amber-100 text-amber-700">PENDING CONFIRMATION</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={shareWhatsApp} data-testid="button-amc-whatsapp">
          <SiWhatsapp className="w-4 h-4 mr-2" />
          Share via WhatsApp
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => window.open("tel:+919090486262")} data-testid="button-amc-call">
          <Phone className="w-4 h-4 mr-2" />
          Call to Confirm
        </Button>
      </div>
    </div>
  );
}

export default function AmcPlansPage() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<ViewType>("plans");
  const [selectedPlan, setSelectedPlan] = useState<AmcPlan | null>(null);
  const [submittedSub, setSubmittedSub] = useState<AmcSubscription | null>(null);

  const { data: plans, isLoading } = useQuery<AmcPlan[]>({
    queryKey: ["/api/amc-plans"],
  });

  return (
    <div className="pb-24 px-4">
      <div className="flex items-center gap-3 pt-4 pb-3">
        <button
          onClick={() => {
            if (view === "buy") { setView("plans"); return; }
            setLocation("/");
          }}
          className="p-2 rounded-lg hover:bg-accent"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold" data-testid="text-amc-title">
            {view === "buy" ? "Buy AMC" : view === "success" ? "AMC Confirmed" : "AMC Plans"}
          </h1>
          <p className="text-xs text-muted-foreground">Annual Maintenance Contracts</p>
        </div>
      </div>

      {view === "plans" && (
        <>
          <Card className="mb-4 border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <h3 className="font-semibold text-sm mb-1">Protect Your Machine Investment</h3>
              <p className="text-xs text-muted-foreground">
                Regular maintenance extends machine life, reduces downtime, and ensures peak performance. Choose a plan that fits your needs.
              </p>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6 pb-6">
                    <div className="h-32 bg-accent rounded-lg animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {plans?.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={() => {
                    setSelectedPlan(plan);
                    setView("buy");
                  }}
                />
              ))}
            </div>
          )}

          <Card className="mt-4">
            <CardContent className="pt-4">
              <h3 className="font-semibold text-sm mb-2">Why Choose AMC?</h3>
              <div className="space-y-2">
                {[
                  { icon: Wrench, text: "Prevent costly breakdowns" },
                  { icon: Clock, text: "Minimize production downtime" },
                  { icon: Calendar, text: "Scheduled maintenance visits" },
                  { icon: Phone, text: "Priority support access" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {view === "buy" && selectedPlan && (
        <BuyAmcForm
          plan={selectedPlan}
          onSuccess={(sub) => {
            setSubmittedSub(sub);
            setView("success");
          }}
        />
      )}

      {view === "success" && submittedSub && selectedPlan && (
        <>
          <SubscriptionSuccess sub={submittedSub} plan={selectedPlan} />
          <Button variant="outline" className="w-full mt-4" onClick={() => { setView("plans"); setSelectedPlan(null); }} data-testid="button-view-plans">
            <Calendar className="w-4 h-4 mr-2" />
            View All Plans
          </Button>
        </>
      )}
    </div>
  );
}
