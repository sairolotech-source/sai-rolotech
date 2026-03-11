import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SupportTicket } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, AlertTriangle, CheckCircle2, Clock, Wrench,
  Camera, Video, Send, Ticket, Copy, Phone
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const PROBLEM_TYPES = [
  "Machine Not Starting",
  "Abnormal Noise / Vibration",
  "Profile Dimension Issue",
  "Cutting Problem",
  "Motor / Electrical Issue",
  "Hydraulic Leak",
  "PLC / Control Error",
  "Roller Wear / Damage",
  "Speed / Production Issue",
  "Other",
];

const urgencyColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-700",
  normal: "bg-green-100 text-green-700",
  high: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

function TicketForm({ onSuccess }: { onSuccess: (ticket: SupportTicket) => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    buyerName: "",
    buyerPhone: "",
    buyerEmail: "",
    machineName: "",
    problemType: "",
    description: "",
    videoUrl: "",
    urgency: "normal",
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const body = {
        ...data,
        buyerEmail: data.buyerEmail || undefined,
        videoUrl: data.videoUrl || undefined,
      };
      const res = await apiRequest("POST", "/api/support-tickets", body);
      return res.json();
    },
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      onSuccess(ticket);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const isValid = form.buyerName && form.buyerPhone.length >= 10 && form.machineName && form.problemType && form.description.length >= 10;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" /> Report a Problem
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Your Name *</Label>
              <Input
                value={form.buyerName}
                onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                placeholder="Enter your name"
                data-testid="input-buyer-name"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Phone *</Label>
                <Input
                  value={form.buyerPhone}
                  onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
                  placeholder="10-digit number"
                  data-testid="input-buyer-phone"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  value={form.buyerEmail}
                  onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
                  placeholder="Optional"
                  data-testid="input-buyer-email"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-3">Machine Details</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Machine Name / Model *</Label>
              <Input
                value={form.machineName}
                onChange={(e) => setForm({ ...form, machineName: e.target.value })}
                placeholder="e.g. POP Channel Machine"
                data-testid="input-machine-name"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Problem Type *</Label>
              <Select value={form.problemType} onValueChange={(v) => setForm({ ...form, problemType: v })}>
                <SelectTrigger data-testid="select-problem-type">
                  <SelectValue placeholder="Select problem type" />
                </SelectTrigger>
                <SelectContent>
                  {PROBLEM_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Problem Description * (min 10 chars)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue in detail..."
                rows={4}
                data-testid="input-description"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Urgency Level *</Label>
              <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v })}>
                <SelectTrigger data-testid="select-urgency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Can wait a few days</SelectItem>
                  <SelectItem value="normal">Normal - Need help soon</SelectItem>
                  <SelectItem value="high">High - Production affected</SelectItem>
                  <SelectItem value="critical">Critical - Machine completely stopped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Video className="w-4 h-4 text-primary" /> Video / Photos
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-accent/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1 font-medium">Best way to share video:</p>
              <p className="text-xs text-muted-foreground">Upload to YouTube as "Unlisted" and paste the link below. This saves storage and loads faster.</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">YouTube Video Link (Preferred)</Label>
              <Input
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                data-testid="input-video-url"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        onClick={() => mutation.mutate(form)}
        disabled={!isValid || mutation.isPending}
        data-testid="button-submit-ticket"
      >
        {mutation.isPending ? (
          "Submitting..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Support Ticket
          </>
        )}
      </Button>
    </div>
  );
}

function TicketSuccess({ ticket }: { ticket: SupportTicket }) {
  const { toast } = useToast();

  const copyTicketNumber = () => {
    navigator.clipboard.writeText(ticket.ticketNumber);
    toast({ title: "Copied!", description: "Ticket number copied to clipboard" });
  };

  const shareWhatsApp = () => {
    const text = `Support Ticket Raised\n\nTicket: ${ticket.ticketNumber}\nMachine: ${ticket.machineName}\nProblem: ${ticket.problemType}\nUrgency: ${ticket.urgency.toUpperCase()}\n\nDescription: ${ticket.description}\n\nSai Rolotech Support: +91 9090-486-262`;
    window.open(`https://wa.me/919090486262?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h2 className="font-bold text-lg mb-1" data-testid="text-ticket-success">Ticket Submitted!</h2>
          <p className="text-xs text-muted-foreground mb-4">Our team will review your issue and get back to you soon.</p>

          <div className="bg-background rounded-lg p-4 border mb-3">
            <p className="text-[10px] text-muted-foreground mb-1">Ticket Number</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-mono font-bold text-primary" data-testid="text-ticket-number">
                {ticket.ticketNumber}
              </span>
              <button onClick={copyTicketNumber} className="p-1.5 rounded-md hover:bg-accent" data-testid="button-copy-ticket">
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Machine:</span>
              <span className="font-medium">{ticket.machineName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Problem:</span>
              <span className="font-medium">{ticket.problemType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Urgency:</span>
              <Badge className={`text-[9px] ${urgencyColors[ticket.urgency]}`}>{ticket.urgency.toUpperCase()}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className="text-[9px] bg-blue-100 text-blue-700">OPEN</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={shareWhatsApp} data-testid="button-share-whatsapp">
          <SiWhatsapp className="w-4 h-4 mr-2" />
          Share via WhatsApp
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => window.open("tel:+919090486262")} data-testid="button-call-support">
          <Phone className="w-4 h-4 mr-2" />
          Call Support
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-2">What happens next?</h3>
          <div className="space-y-2">
            {[
              { step: "1", text: "Our team reviews your ticket", time: "Within 2 hours" },
              { step: "2", text: "Service partner assigned", time: "Same day" },
              { step: "3", text: "Partner contacts you for diagnosis", time: "Within 24 hours" },
              { step: "4", text: "On-site visit if needed", time: "As scheduled" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">{item.text}</p>
                  <p className="text-[10px] text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MyTickets() {
  const [lookupPhone, setLookupPhone] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const { data: tickets, isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets", searchPhone],
    queryFn: async () => {
      const res = await fetch(`/api/support-tickets?phone=${encodeURIComponent(searchPhone)}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json();
    },
    enabled: searchPhone.length >= 10,
  });

  if (!searchPhone) {
    return (
      <div className="space-y-3">
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold text-sm mb-2">Track Your Tickets</h3>
            <p className="text-xs text-muted-foreground mb-3">Enter the phone number you used while raising the ticket.</p>
            <div className="flex gap-2">
              <Input
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                placeholder="Enter 10-digit phone"
                data-testid="input-lookup-phone"
              />
              <Button
                onClick={() => setSearchPhone(lookupPhone)}
                disabled={lookupPhone.length < 10}
                data-testid="button-lookup-tickets"
              >
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <Card><CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">Loading tickets...</CardContent></Card>;
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="space-y-3">
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <Ticket className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No tickets found for {searchPhone}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setSearchPhone("")} data-testid="button-search-again">
              Search Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{tickets.length} ticket(s) for {searchPhone}</p>
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSearchPhone("")}>Change</Button>
      </div>
      {tickets.map((ticket) => (
        <Card key={ticket.id} data-testid={`card-ticket-${ticket.id}`}>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <p className="text-xs font-mono font-semibold text-primary">{ticket.ticketNumber}</p>
                <p className="text-sm font-medium mt-0.5">{ticket.machineName}</p>
              </div>
              <Badge className={`text-[9px] ${statusColors[ticket.status]}`}>
                {ticket.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-1.5">{ticket.problemType}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
            <div className="flex items-center justify-between mt-2">
              <Badge className={`text-[9px] ${urgencyColors[ticket.urgency]}`}>{ticket.urgency}</Badge>
              {ticket.createdAt && (
                <span className="text-[10px] text-muted-foreground">
                  {new Date(ticket.createdAt).toLocaleDateString("en-IN")}
                </span>
              )}
            </div>
            {ticket.resolution && (
              <div className="mt-2 p-2 bg-green-50 rounded-md">
                <p className="text-[10px] font-medium text-green-700">Resolution:</p>
                <p className="text-xs text-green-600">{ticket.resolution}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SupportTicketPage() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<"form" | "success" | "tickets">("form");
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

  return (
    <div className="pb-24 px-4">
      <div className="flex items-center gap-3 pt-4 pb-3">
        <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold" data-testid="text-support-title">
            {view === "tickets" ? "My Tickets" : "Machine Support"}
          </h1>
          <p className="text-xs text-muted-foreground">Troubleshooting & service support</p>
        </div>
      </div>

      {view !== "success" && (
        <div className="flex gap-1 mb-4 bg-accent/50 p-1 rounded-lg">
          <button
            onClick={() => setView("form")}
            className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${
              view === "form" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
            }`}
            data-testid="tab-new-ticket"
          >
            New Ticket
          </button>
          <button
            onClick={() => setView("tickets")}
            className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${
              view === "tickets" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
            }`}
            data-testid="tab-my-tickets"
          >
            My Tickets
          </button>
        </div>
      )}

      {view === "form" && (
        <TicketForm
          onSuccess={(ticket) => {
            setSubmittedTicket(ticket);
            setView("success");
          }}
        />
      )}
      {view === "success" && submittedTicket && (
        <>
          <TicketSuccess ticket={submittedTicket} />
          <Button variant="outline" className="w-full mt-4" onClick={() => setView("form")} data-testid="button-new-ticket">
            <Ticket className="w-4 h-4 mr-2" />
            Submit Another Ticket
          </Button>
        </>
      )}
      {view === "tickets" && <MyTickets />}
    </div>
  );
}
