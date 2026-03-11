import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Calculator, IndianRupee, MessageCircle,
  TrendingDown, Calendar, Percent, Phone
} from "lucide-react";

function formatINR(num: number): string {
  return num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function EMICalculator() {
  const [, setLocation] = useLocation();
  const [machinePrice, setMachinePrice] = useState("500000");
  const [downPayment, setDownPayment] = useState("150000");
  const [interestRate, setInterestRate] = useState("12");
  const [tenure, setTenure] = useState("36");

  const price = parseInt(machinePrice) || 0;
  const down = parseInt(downPayment) || 0;
  const rate = parseFloat(interestRate) || 0;
  const months = parseInt(tenure) || 1;

  const loanAmount = Math.max(price - down, 0);
  const monthlyRate = rate / 12 / 100;
  const emi = monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    : loanAmount / months;
  const totalPayable = emi * months;
  const totalInterest = totalPayable - loanAmount;
  const downPercent = price > 0 ? ((down / price) * 100).toFixed(0) : "0";

  const tenureOptions = [
    { label: "12 mo", value: "12" },
    { label: "24 mo", value: "24" },
    { label: "36 mo", value: "36" },
    { label: "48 mo", value: "48" },
    { label: "60 mo", value: "60" },
  ];

  const quickPrices = [
    { label: "3L", value: "300000" },
    { label: "5L", value: "500000" },
    { label: "7L", value: "700000" },
    { label: "10L", value: "1000000" },
  ];

  const shareText = `Machine EMI Calculation\n\nMachine Price: Rs ${formatINR(price)}\nDown Payment: Rs ${formatINR(down)} (${downPercent}%)\nLoan Amount: Rs ${formatINR(loanAmount)}\nInterest Rate: ${rate}%\nTenure: ${months} months\n\nMonthly EMI: Rs ${formatINR(Math.round(emi))}\nTotal Interest: Rs ${formatINR(Math.round(totalInterest))}\nTotal Payable: Rs ${formatINR(Math.round(totalPayable))}\n\nSai Rolotech: +91 9090-486-262`;

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation("/tools")} className="p-1" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-sm" data-testid="text-emi-title">EMI Calculator</h1>
          <p className="text-[10px] text-muted-foreground">Calculate machine loan EMI</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label className="text-xs flex items-center gap-1.5 mb-1.5">
                <IndianRupee className="w-3.5 h-3.5" /> Machine Price
              </Label>
              <Input
                type="number"
                value={machinePrice}
                onChange={(e) => setMachinePrice(e.target.value)}
                placeholder="Enter machine price"
                data-testid="input-machine-price"
              />
              <div className="flex gap-2 mt-2">
                {quickPrices.map((qp) => (
                  <button
                    key={qp.value}
                    onClick={() => setMachinePrice(qp.value)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${machinePrice === qp.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
                    data-testid={`button-quick-${qp.label}`}
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs flex items-center gap-1.5 mb-1.5">
                <TrendingDown className="w-3.5 h-3.5" /> Down Payment
              </Label>
              <Input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                placeholder="Down payment amount"
                data-testid="input-down-payment"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{downPercent}% of machine price</p>
            </div>

            <div>
              <Label className="text-xs flex items-center gap-1.5 mb-1.5">
                <Percent className="w-3.5 h-3.5" /> Interest Rate (% per annum)
              </Label>
              <Input
                type="number"
                step="0.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="e.g. 12"
                data-testid="input-interest-rate"
              />
            </div>

            <div>
              <Label className="text-xs flex items-center gap-1.5 mb-2">
                <Calendar className="w-3.5 h-3.5" /> Tenure
              </Label>
              <div className="flex gap-2">
                {tenureOptions.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTenure(t.value)}
                    className={`flex-1 text-xs py-2 rounded-md border font-medium transition-all ${tenure === t.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
                    data-testid={`button-tenure-${t.value}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {loanAmount > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-4">
              <div className="text-center mb-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Monthly EMI</p>
                <p className="text-3xl font-bold text-primary" data-testid="text-emi-amount">
                  <span className="text-lg">Rs </span>{formatINR(Math.round(emi))}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Loan Amount</span>
                  <span className="font-semibold" data-testid="text-loan-amount">Rs {formatINR(loanAmount)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Interest</span>
                  <span className="font-semibold text-amber-600" data-testid="text-total-interest">Rs {formatINR(Math.round(totalInterest))}</span>
                </div>
                <div className="flex justify-between text-xs border-t pt-2">
                  <span className="text-muted-foreground">Total Payable</span>
                  <span className="font-bold" data-testid="text-total-payable">Rs {formatINR(Math.round(totalPayable))}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t" data-testid="chart-emi-breakdown">
                <div className="flex rounded-full overflow-hidden h-2 bg-muted">
                  <div className="bg-primary" style={{ width: `${(loanAmount / totalPayable) * 100}%` }} data-testid="bar-principal" />
                  <div className="bg-amber-500" style={{ width: `${(totalInterest / totalPayable) * 100}%` }} data-testid="bar-interest" />
                </div>
                <div className="flex justify-between mt-1.5 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1" data-testid="text-legend-principal">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block" /> Principal
                  </span>
                  <span className="flex items-center gap-1" data-testid="text-legend-interest">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Interest
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open(`https://wa.me/919090486262?text=${encodeURIComponent(shareText)}`, "_blank")}
            data-testid="button-share-whatsapp"
          >
            <MessageCircle className="w-4 h-4 mr-1.5" />
            Share
          </Button>
          <Button
            className="flex-1"
            onClick={() => setLocation("/quotation")}
            data-testid="button-get-quote"
          >
            Get Machine Quote
          </Button>
        </div>

        <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="pt-3 pb-3">
            <h4 className="font-semibold text-xs mb-1 text-blue-800 dark:text-blue-300">Need Loan Assistance?</h4>
            <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80 mb-2">
              We help with bank loan documentation and approval. Talk to our finance team.
            </p>
            <a href="tel:+919090486262" className="text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1" data-testid="link-finance-call">
              <Phone className="w-3.5 h-3.5" /> +91 9090-486-262
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
