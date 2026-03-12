import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Video, Calendar, Clock, CheckCircle2, Copy,
  ExternalLink, XCircle, AlertCircle, Loader2, Phone, User, Mail
} from "lucide-react";

interface VideoCallSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxBookings: number;
  currentBookings: number;
  engineerName: string | null;
  isActive: boolean | null;
}

interface VideoCallBooking {
  id: string;
  bookingNumber: string;
  userName: string;
  userPhone: string;
  userEmail: string | null;
  machineType: string;
  problemDescription: string;
  slotId: string;
  slotDate: string;
  slotTime: string;
  status: string;
  meetingLink: string | null;
  adminNotes: string | null;
  cancelReason: string | null;
  createdAt: string | null;
}

const MACHINE_TYPES = [
  "Rolling Shutter Machine",
  "False Ceiling Machine",
  "Roofing Sheet Machine",
  "Door Frame Machine",
  "C/Z Purlin Machine",
  "Gypsum Channel Machine",
  "Other",
];

export default function VideoCallBooking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<"book" | "my-bookings">("book");
  const [confirmedBooking, setConfirmedBooking] = useState<VideoCallBooking | null>(null);
  const [formData, setFormData] = useState({
    userName: "",
    userPhone: "",
    userEmail: "",
    machineType: "",
    problemDescription: "",
    slotId: "",
  });

  const { data: slots = [], isLoading: slotsLoading } = useQuery<VideoCallSlot[]>({
    queryKey: ["/api/video-call-slots"],
  });

  const { data: myBookings = [], isLoading: bookingsLoading } = useQuery<VideoCallBooking[]>({
    queryKey: ["/api/video-call-bookings"],
    enabled: activeView === "my-bookings" && !!user,
  });

  const bookMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/video-call-bookings", {
        ...data,
        userId: user?.id || null,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setConfirmedBooking(data);
      queryClient.invalidateQueries({ queryKey: ["/api/video-call-slots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/video-call-bookings"] });
      import("@/lib/google-analytics").then((m) => m.trackVideoCallBooking());
      toast({ title: "Booking confirmed!", description: "Your video call session has been scheduled." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await apiRequest("PATCH", `/api/video-call-bookings/${bookingId}/cancel`, {
        reason: "Cancelled by user",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-call-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/video-call-slots"] });
      toast({ title: "Booking cancelled" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slotId) {
      toast({ title: "Please select a time slot", variant: "destructive" });
      return;
    }
    bookMutation.mutate(formData);
  };

  const copyMeetingLink = () => {
    if (confirmedBooking?.meetingLink) {
      navigator.clipboard.writeText(confirmedBooking.meetingLink);
      toast({ title: "Meeting link copied!" });
    }
  };

  const groupedSlots = slots.reduce<Record<string, VideoCallSlot[]>>((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  if (confirmedBooking) {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Booking Confirmed</h1>
        </div>

        <Card className="border-2 border-primary/20" data-testid="card-booking-confirmed">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-lg">Video Call Scheduled!</CardTitle>
            <p className="text-sm text-muted-foreground">Your support session has been booked</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/10">
              <p className="text-xs text-muted-foreground mb-1">Booking Number</p>
              <p className="text-xl font-bold font-mono text-primary tracking-wider" data-testid="text-booking-number">
                {confirmedBooking.bookingNumber}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">{formatDate(confirmedBooking.slotDate)}</p>
                  <p className="text-xs text-muted-foreground">{confirmedBooking.slotTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Video className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Meeting Link</p>
                  <p className="text-xs text-primary truncate">{confirmedBooking.meetingLink}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={copyMeetingLink} className="h-7 px-2" data-testid="button-copy-link">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" asChild className="h-7 px-2" data-testid="button-open-link">
                    <a href={confirmedBooking.meetingLink || "#"} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{confirmedBooking.machineType}</p>
                  <p className="text-xs text-muted-foreground">{confirmedBooking.problemDescription}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Join the meeting link at the scheduled time. Our engineer will connect with you for troubleshooting support.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => { setConfirmedBooking(null); setActiveView("my-bookings"); }} variant="outline" className="flex-1" data-testid="button-view-bookings">
                My Bookings
              </Button>
              <Button onClick={() => setLocation("/")} className="flex-1" data-testid="button-go-home">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Video Call Support
          </h1>
          <p className="text-xs text-muted-foreground">Book a video call with our engineer</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={activeView === "book" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveView("book")}
          className="flex-1"
          data-testid="button-tab-book"
        >
          Book a Call
        </Button>
        <Button
          variant={activeView === "my-bookings" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveView("my-bookings")}
          className="flex-1"
          data-testid="button-tab-my-bookings"
        >
          My Bookings
        </Button>
      </div>

      {activeView === "book" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Full Name *</Label>
                <Input
                  required
                  value={formData.userName}
                  onChange={e => setFormData(p => ({ ...p, userName: e.target.value }))}
                  placeholder="Enter your name"
                  className="mt-1"
                  data-testid="input-user-name"
                />
              </div>
              <div>
                <Label className="text-xs">Phone Number *</Label>
                <Input
                  required
                  value={formData.userPhone}
                  onChange={e => setFormData(p => ({ ...p, userPhone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="mt-1"
                  data-testid="input-user-phone"
                />
              </div>
              <div>
                <Label className="text-xs">Email (Optional)</Label>
                <Input
                  value={formData.userEmail}
                  onChange={e => setFormData(p => ({ ...p, userEmail: e.target.value }))}
                  placeholder="Enter email"
                  className="mt-1"
                  data-testid="input-user-email"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Machine Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Machine Type *</Label>
                <Select
                  value={formData.machineType}
                  onValueChange={v => setFormData(p => ({ ...p, machineType: v }))}
                >
                  <SelectTrigger className="mt-1" data-testid="select-machine-type">
                    <SelectValue placeholder="Select machine type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MACHINE_TYPES.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Problem Description *</Label>
                <Textarea
                  required
                  value={formData.problemDescription}
                  onChange={e => setFormData(p => ({ ...p, problemDescription: e.target.value }))}
                  placeholder="Describe the problem you're facing with the machine..."
                  className="mt-1 min-h-[80px]"
                  data-testid="input-problem-description"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Select Time Slot
              </CardTitle>
            </CardHeader>
            <CardContent>
              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : Object.keys(groupedSlots).length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No available slots at the moment</p>
                  <p className="text-xs text-muted-foreground mt-1">Please check back later or contact us directly</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                    <div key={date}>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">{formatDate(date)}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {dateSlots.map(slot => {
                          const isSelected = formData.slotId === slot.id;
                          const spotsLeft = slot.maxBookings - slot.currentBookings;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setFormData(p => ({ ...p, slotId: slot.id }))}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                              data-testid={`button-slot-${slot.id}`}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-semibold">{slot.startTime} - {slot.endTime}</span>
                              </div>
                              {slot.engineerName && (
                                <p className="text-[10px] text-muted-foreground">{slot.engineerName}</p>
                              )}
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full"
            disabled={bookMutation.isPending || !formData.slotId || !formData.machineType}
            data-testid="button-confirm-booking"
          >
            {bookMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Booking...
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Confirm Booking
              </>
            )}
          </Button>
        </form>
      )}

      {activeView === "my-bookings" && (
        <div className="space-y-3">
          {bookingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : myBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Video className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">No bookings yet</p>
                <p className="text-xs text-muted-foreground mt-1">Book a video call session for machine support</p>
                <Button size="sm" onClick={() => setActiveView("book")} className="mt-3" data-testid="button-book-now">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            myBookings.map(booking => (
              <Card key={booking.id} data-testid={`card-booking-${booking.id}`}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{booking.bookingNumber}</span>
                    <Badge
                      variant={
                        booking.status === "confirmed" ? "default" :
                        booking.status === "cancelled" ? "destructive" :
                        booking.status === "completed" ? "secondary" : "outline"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{formatDate(booking.slotDate)} | {booking.slotTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{booking.machineType}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-5.5">{booking.problemDescription}</p>
                  </div>
                  {booking.meetingLink && booking.status === "confirmed" && (
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-primary bg-primary/5 rounded-lg p-2"
                      data-testid={`link-meeting-${booking.id}`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span className="truncate flex-1">{booking.meetingLink}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                  {booking.adminNotes && (
                    <p className="text-xs text-muted-foreground bg-accent/50 rounded-lg p-2">
                      Admin: {booking.adminNotes}
                    </p>
                  )}
                  {booking.cancelReason && (
                    <p className="text-xs text-destructive bg-destructive/5 rounded-lg p-2">
                      Cancelled: {booking.cancelReason}
                    </p>
                  )}
                  {booking.status === "confirmed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={() => cancelMutation.mutate(booking.id)}
                      disabled={cancelMutation.isPending}
                      data-testid={`button-cancel-${booking.id}`}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Cancel Booking
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
