import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, IndianRupee, Phone, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CoilRate() {
  const { data: settings } = useQuery<any>({
    queryKey: ["/api/settings"],
  });

  const currentRate = settings?.currentCoilRate ? parseFloat(settings.currentCoilRate) : 74.50;

  const rateHistory = [
    { date: "Today", rate: currentRate, change: 0.5 },
    { date: "Yesterday", rate: currentRate - 0.5, change: -0.3 },
    { date: "2 days ago", rate: currentRate - 0.2, change: 0.8 },
    { date: "3 days ago", rate: currentRate - 1.0, change: -0.2 },
    { date: "4 days ago", rate: currentRate - 0.8, change: 0.4 },
    { date: "5 days ago", rate: currentRate - 1.2, change: -0.6 },
    { date: "1 week ago", rate: currentRate - 0.6, change: 0.1 },
  ];

  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-3">
        <h1 className="text-xl font-bold mb-1 flex items-center gap-2" data-testid="text-coil-title">
          <IndianRupee className="w-5 h-5 text-primary" />
          Coil Rate Tracker
        </h1>
        <p className="text-sm text-muted-foreground">Daily steel coil market rates</p>
      </div>

      <Card className="p-5 mb-4 bg-primary/5 border-primary/10">
        <div className="flex items-center justify-between gap-1 mb-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Current Rate</p>
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Updated Today
          </Badge>
        </div>
        <div className="flex items-end gap-2">
          <p className="text-4xl font-bold" data-testid="text-current-rate">{currentRate.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mb-1">/kg</p>
          <div className="flex items-center gap-1 mb-1 ml-auto">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-500">+0.50</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Standard gauge 0.50mm GP/GC coil - Loha Mandi rates
        </p>
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-sm mb-3" data-testid="text-rate-history">Rate History</h3>
        <div className="space-y-1">
          {rateHistory.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2.5 border-b border-dashed last:border-0">
              <div>
                <p className="text-sm font-medium">{item.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold">{item.rate.toFixed(2)}/kg</p>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${item.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {item.change > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : item.change < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  {item.change > 0 ? "+" : ""}{item.change.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Rates are approximate and based on Loha Mandi, Delhi wholesale market.
              For exact rates, contact dealers directly from the Directory.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 mt-4">
        <h3 className="font-semibold text-sm mb-2" data-testid="text-quick-calc">Quick Calculation</h3>
        <p className="text-xs text-muted-foreground mb-3">Estimate raw material cost per coil</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-md p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">1 Ton (1000 kg)</p>
            <p className="font-bold" data-testid="text-per-ton">{(currentRate * 1000).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-muted/50 rounded-md p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">500 kg</p>
            <p className="font-bold">{(currentRate * 500).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
