import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Calendar, Clock, MapPin, Phone, QrCode, Share2, CheckCircle2, Copy,
  TrainFront, Navigation, Car, CircleDot
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function VisitBooking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);
  const [formData, setFormData] = useState({
    buyerName: "",
    buyerPhone: "",
    buyerEmail: "",
    purpose: "Machine Demo",
    preferredDate: "",
    preferredTime: "10:00 AM",
    notes: "",
  });

  const bookMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/appointments", data);
      return res.json();
    },
    onSuccess: (data) => {
      setBookedAppointment(data);
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({ title: "Visit booked!", description: "You will receive confirmation shortly." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookMutation.mutate(formData);
  };

  const shareOnWhatsApp = () => {
    if (!bookedAppointment) return;
    const msg = encodeURIComponent(
      `Factory Visit Pass - Sai Rolotech\n\nPass Code: ${bookedAppointment.passCode}\nName: ${bookedAppointment.buyerName}\nDate: ${bookedAppointment.preferredDate}\nTime: ${bookedAppointment.preferredTime}\nPurpose: ${bookedAppointment.purpose}\n\nAddress: Ground Floor Mdk052, Kh.no.575/1, Udyog Nagar, South Side Industrial Area, Mundka, New Delhi, Delhi - 110041\n\nContact: +91 9090-486-262`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const copyPassCode = () => {
    if (bookedAppointment?.passCode) {
      navigator.clipboard.writeText(bookedAppointment.passCode);
      toast({ title: "Pass code copied!" });
    }
  };

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  ];

  const purposes = [
    "Machine Demo", "Factory Tour", "Purchase Discussion",
    "After-Sales Service", "Spare Parts Pickup", "Other",
  ];

  if (bookedAppointment) {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Visit Pass</h1>
        </div>

        <Card className="border-2 border-primary/20" data-testid="card-visit-pass">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-lg">Visit Confirmed!</CardTitle>
            <p className="text-sm text-muted-foreground">Your factory visit has been booked</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/10">
              <p className="text-xs text-muted-foreground mb-1">Digital Pass Code</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-2xl font-bold font-mono text-primary tracking-wider" data-testid="text-pass-code">
                  {bookedAppointment.passCode}
                </p>
                <button onClick={copyPassCode} className="p-1.5 hover:bg-primary/10 rounded-md" data-testid="button-copy-pass">
                  <Copy className="w-4 h-4 text-primary" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Show this code at entry gate</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Date</p>
                  <p className="font-medium" data-testid="text-visit-date">{bookedAppointment.preferredDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Time</p>
                  <p className="font-medium" data-testid="text-visit-time">{bookedAppointment.preferredTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Location</p>
                  <p className="font-medium">Udyog Nagar, South Side Industrial Area, Mundka, New Delhi</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={shareOnWhatsApp} variant="outline" className="flex-1" data-testid="button-share-whatsapp">
                <SiWhatsapp className="w-4 h-4 mr-2 text-green-600" />
                Share Pass
              </Button>
              <Button onClick={() => window.open("tel:+919090486262")} variant="outline" className="flex-1" data-testid="button-call">
                <Phone className="w-4 h-4 mr-2" />
                Call Factory
              </Button>
            </div>

            <Button onClick={() => setBookedAppointment(null)} variant="ghost" className="w-full" data-testid="button-book-another">
              Book Another Visit
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-sm mb-2">How to Reach</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Nearest Metro: Mundka Metro Station (Green Line)</p>
              <p>From Metro: Auto/E-Rickshaw to Udyog Nagar (~5 min)</p>
              <p>By Road: Rohtak Road, Near Mundka Industrial Area</p>
            </div>
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => window.open("https://maps.google.com/?q=Udyog+Nagar+Mundka+Delhi", "_blank")}
              data-testid="button-open-maps"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Open in Google Maps
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold" data-testid="text-page-title">Book Factory Visit</h1>
      </div>

      <Card className="mb-4 bg-primary/5 border-primary/10">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Digital Visit Pass</p>
              <p className="text-xs text-muted-foreground">Get a unique pass code after booking. Show at entry gate for quick access.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visitor Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buyerName">Full Name</Label>
              <Input
                id="buyerName"
                value={formData.buyerName}
                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                placeholder="Enter your full name"
                required
                data-testid="input-buyer-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerPhone">Phone Number</Label>
              <Input
                id="buyerPhone"
                value={formData.buyerPhone}
                onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                placeholder="Enter 10-digit phone number"
                required
                data-testid="input-buyer-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerEmail">Email (Optional)</Label>
              <Input
                id="buyerEmail"
                type="email"
                value={formData.buyerEmail}
                onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                placeholder="your@email.com"
                data-testid="input-buyer-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Visit</Label>
              <Select value={formData.purpose} onValueChange={(val) => setFormData({ ...formData, purpose: val })}>
                <SelectTrigger data-testid="select-purpose">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {purposes.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredDate">Preferred Date</Label>
              <Input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                required
                data-testid="input-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredTime">Preferred Time Slot</Label>
              <Select value={formData.preferredTime} onValueChange={(val) => setFormData({ ...formData, preferredTime: val })}>
                <SelectTrigger data-testid="select-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any specific requirements or questions..."
                rows={3}
                data-testid="input-notes"
              />
            </div>

            <Button type="submit" className="w-full" disabled={bookMutation.isPending} data-testid="button-book-visit">
              {bookMutation.isPending ? "Booking..." : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Factory Visit
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-4" data-testid="card-how-to-reach">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            How to Reach - Factory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-start gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Sai Rolotech</p>
                <p className="text-xs text-muted-foreground">Ground Floor Mdk052, Kh.no.575/1, Udyog Nagar, South Side Industrial Area, Mundka, New Delhi, Delhi - 110041</p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-2">
              <TrainFront className="w-3.5 h-3.5" /> Metro Se Aana Hai (Step by Step)
            </p>
            <div className="relative pl-5 space-y-3">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-red-200" />
              <div className="relative flex items-start gap-2">
                <CircleDot className="w-3.5 h-3.5 text-red-500 shrink-0 bg-background" />
                <div>
                  <p className="text-xs font-medium">Mundka Metro Station (Green Line)</p>
                  <p className="text-[11px] text-muted-foreground">Nearest metro station — Green Line pe aana hai</p>
                </div>
              </div>
              <div className="relative flex items-start gap-2">
                <CircleDot className="w-3.5 h-3.5 text-orange-500 shrink-0 bg-background" />
                <div>
                  <p className="text-xs font-medium">Gate No. 1 se bahar aao</p>
                  <p className="text-[11px] text-muted-foreground">Main road side — Auto/E-Rickshaw stand milega</p>
                </div>
              </div>
              <div className="relative flex items-start gap-2">
                <CircleDot className="w-3.5 h-3.5 text-yellow-500 shrink-0 bg-background" />
                <div>
                  <p className="text-xs font-medium">Auto/E-Rickshaw lo — "Udyog Nagar, South Side" bolo</p>
                  <p className="text-[11px] text-muted-foreground">~5 min ride, ₹10-20 auto fare</p>
                </div>
              </div>
              <div className="relative flex items-start gap-2">
                <CircleDot className="w-3.5 h-3.5 text-green-500 shrink-0 bg-background" />
                <div>
                  <p className="text-xs font-medium">Mdk052, Kh.no.575/1 — Ground Floor</p>
                  <p className="text-[11px] text-muted-foreground">Sai Rolotech factory board dikhega — entry gate pe pass code dikhao</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex items-start gap-2">
              <Car className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">By Road:</span> Rohtak Road, Near Mundka Industrial Area, Udyog Nagar</p>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Lost?</span> Call +91 9090-486-262 — hum guide karenge</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => window.open("https://maps.google.com/?q=Udyog+Nagar+Mundka+Delhi", "_blank")}
              data-testid="button-open-maps"
            >
              <MapPin className="w-3.5 h-3.5 mr-1" />
              Google Maps
            </Button>
            <Button
              className="flex-1 text-xs bg-green-600"
              onClick={() => window.open("tel:+919090486262")}
              data-testid="button-call-factory"
            >
              <Phone className="w-3.5 h-3.5 mr-1" />
              Call Factory
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
