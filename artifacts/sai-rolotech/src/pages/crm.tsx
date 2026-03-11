import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Phone, MapPin, Flame, Thermometer, Snowflake, Ban,
  Plus, Bell, Calendar, ChevronRight, Check, Trash2, X,
  TrendingUp, Clock, Factory, IndianRupee, MessageSquare,
  ArrowLeft, Edit3, AlertCircle, Star, RefreshCw
} from "lucide-react";

type Lead = {
  id: string;
  name: string;
  phone: string;
  city?: string;
  machineType?: string;
  source?: string;
  status?: string;
  notes?: string;
  nextFollowupDate?: string;
  visitScheduledAt?: string;
  visitNotes?: string;
  isStopList?: boolean;
  createdAt?: string;
};

type Reminder = {
  id: string;
  leadId: string;
  reminderDate: string;
  reminderTime?: string;
  message?: string;
  isCompleted?: boolean;
};

type Stats = {
  total: number;
  hot: number;
  normal: number;
  cold: number;
  stop: number;
  todayFollowups: number;
  upcomingVisits: number;
};

const STATUS_CONFIG = {
  HOT:    { label: "HOT",    icon: Flame,        color: "bg-red-500",    textColor: "text-red-600",    bg: "bg-red-50 dark:bg-red-950/30",    border: "border-red-200 dark:border-red-800" },
  NORMAL: { label: "NORMAL", icon: Thermometer,  color: "bg-amber-500",  textColor: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-950/30",  border: "border-amber-200 dark:border-amber-800" },
  COLD:   { label: "COLD",   icon: Snowflake,    color: "bg-blue-500",   textColor: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/30",   border: "border-blue-200 dark:border-blue-800" },
  STOP:   { label: "STOP",   icon: Ban,          color: "bg-gray-500",   textColor: "text-gray-600",   bg: "bg-gray-50 dark:bg-gray-950/30",   border: "border-gray-200 dark:border-gray-800" },
};

const SOURCE_LABELS: Record<string, string> = {
  indiamart: "IndiaMART",
  tradeindia: "TradeIndia",
  justdial: "Justdial",
  phone: "Phone Call",
};

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function showNotification(title: string, body: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function CRM() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"dashboard" | "leads" | "add" | "reminders" | "stop">("dashboard");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", phone: "", city: "", machineType: "", source: "phone", status: "NORMAL", notes: "" });
  const [editLead, setEditLead] = useState<Partial<Lead>>({});
  const [newReminder, setNewReminder] = useState({ reminderDate: todayStr(), reminderTime: "10:00", message: "" });

  useEffect(() => { requestNotificationPermission(); }, []);

  const { data: stats } = useQuery<Stats>({ queryKey: ["/api/leads/stats"] });
  const { data: allLeads = [], isLoading: leadsLoading } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });
  const { data: todayLeads = [] } = useQuery<Lead[]>({ queryKey: ["/api/leads/today"] });
  const { data: reminders = [] } = useQuery<Reminder[]>({ queryKey: ["/api/reminders"] });
  const { data: stopList = [] } = useQuery<Lead[]>({ queryKey: ["/api/leads", "stop"], queryFn: () => apiRequest("GET", "/api/leads?stop=true") });

  const filteredLeads = statusFilter === "ALL" ? allLeads.filter(l => !l.isStopList) : allLeads.filter(l => l.status === statusFilter && !l.isStopList);

  const upcomingVisits = allLeads.filter(l => l.visitScheduledAt && new Date(l.visitScheduledAt) >= new Date());

  const createLead = useMutation({
    mutationFn: (data: typeof newLead) => apiRequest("POST", "/api/leads", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({ title: "Lead add ho gaya!", description: `${newLead.name} ke liye auto follow-up schedule bhi set ho gaya.` });
      setNewLead({ name: "", phone: "", city: "", machineType: "", source: "phone", status: "NORMAL", notes: "" });
      setShowAddForm(false);
    },
    onError: () => toast({ title: "Error", description: "Lead add nahi ho saka.", variant: "destructive" }),
  });

  const updateLead = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => apiRequest("PATCH", `/api/leads/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({ title: "Updated!", description: "Lead update ho gaya." });
      setShowEditForm(false);
      setSelectedLead(null);
    },
  });

  const deleteLead = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({ title: "Deleted", description: "Lead delete ho gaya." });
      setSelectedLead(null);
    },
  });

  const moveToStop = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/leads/${id}`, { isStopList: true, status: "STOP" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({ title: "STOP List mein add kiya", description: "Saare pending reminders bhi hata diye." });
      setSelectedLead(null);
    },
  });

  const unblockLead = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/leads/${id}`, { isStopList: false, status: "COLD" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({ title: "Unblocked!", description: "Lead active ho gaya, naye reminders set ho gaye." });
    },
  });

  const createReminder = useMutation({
    mutationFn: (data: typeof newReminder & { leadId: string }) => apiRequest("POST", "/api/reminders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({ title: "Reminder set!", description: "Aapko yaad dilaya jayega." });
      setShowReminderForm(false);
      setNewReminder({ reminderDate: todayStr(), reminderTime: "10:00", message: "" });
    },
  });

  const completeReminder = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/reminders/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      showNotification("Follow-up Complete!", "Reminder mark kar diya gaya.");
    },
  });

  const deleteReminder = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/reminders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/reminders"] }),
  });

  const pendingReminders = reminders.filter(r => !r.isCompleted);
  const todayReminders = pendingReminders.filter(r => r.reminderDate === todayStr());

  return (
    <div className="pb-24 min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">AI Sales CRM</h1>
            <p className="text-xs text-muted-foreground">Sai Rolotech Lead Manager</p>
          </div>
          <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-1">
            <Plus className="w-4 h-4" /> New Lead
          </Button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {([
            { id: "dashboard", label: "Dashboard", icon: TrendingUp },
            { id: "leads", label: "Leads", icon: Users },
            { id: "reminders", label: "Reminders", badge: todayReminders.length, icon: Bell },
            { id: "stop", label: "STOP List", icon: Ban },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all relative ${
                tab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {"badge" in t && t.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* ===== DASHBOARD ===== */}
        {tab === "dashboard" && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Users} label="Total Leads" value={stats?.total ?? 0} color="text-primary" bg="bg-primary/10" />
              <StatCard icon={Flame} label="HOT Leads" value={stats?.hot ?? 0} color="text-red-600" bg="bg-red-100 dark:bg-red-950/30" />
              <StatCard icon={Bell} label="Aaj Follow-up" value={stats?.todayFollowups ?? 0} color="text-amber-600" bg="bg-amber-100 dark:bg-amber-950/30" />
              <StatCard icon={Calendar} label="Visits (7 din)" value={stats?.upcomingVisits ?? 0} color="text-green-600" bg="bg-green-100 dark:bg-green-950/30" />
            </div>

            {/* Today's Follow-ups */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  Aaj ka Follow-up ({todayLeads.length})
                </h2>
              </div>
              {todayLeads.length === 0 ? (
                <Card className="p-4 text-center text-muted-foreground text-sm">
                  Aaj koi follow-up nahi hai 🎉
                </Card>
              ) : (
                <div className="space-y-2">
                  {todayLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onSelect={setSelectedLead} compact />
                  ))}
                </div>
              )}
            </div>

            {/* HOT Leads */}
            <div>
              <h2 className="font-semibold flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-red-500" />
                HOT Leads ({stats?.hot ?? 0})
              </h2>
              {allLeads.filter(l => l.status === "HOT" && !l.isStopList).length === 0 ? (
                <Card className="p-4 text-center text-muted-foreground text-sm">Koi HOT lead nahi</Card>
              ) : (
                <div className="space-y-2">
                  {allLeads.filter(l => l.status === "HOT" && !l.isStopList).slice(0, 5).map(lead => (
                    <LeadCard key={lead.id} lead={lead} onSelect={setSelectedLead} compact />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Visits */}
            <div>
              <h2 className="font-semibold flex items-center gap-2 mb-2">
                <Factory className="w-4 h-4 text-green-500" />
                Upcoming Factory Visits ({upcomingVisits.length})
              </h2>
              {upcomingVisits.length === 0 ? (
                <Card className="p-4 text-center text-muted-foreground text-sm">Koi visit schedule nahi</Card>
              ) : (
                <div className="space-y-2">
                  {upcomingVisits.map(lead => (
                    <Card key={lead.id} className="p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {lead.visitScheduledAt ? new Date(lead.visitScheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                          {lead.visitNotes ? ` — ${lead.visitNotes}` : ""}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedLead(lead)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== LEADS ===== */}
        {tab === "leads" && (
          <div className="space-y-3">
            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {["ALL", "HOT", "NORMAL", "COLD"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === s
                      ? s === "HOT" ? "bg-red-500 text-white"
                        : s === "NORMAL" ? "bg-amber-500 text-white"
                        : s === "COLD" ? "bg-blue-500 text-white"
                        : "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s === "ALL" ? `All (${allLeads.filter(l => !l.isStopList).length})` : `${s} (${allLeads.filter(l => l.status === s && !l.isStopList).length})`}
                </button>
              ))}
            </div>

            {leadsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredLeads.length === 0 ? (
              <Card className="p-6 text-center">
                <Users className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground text-sm">Koi lead nahi mila</p>
                <Button size="sm" className="mt-3" onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Lead Add Karo
                </Button>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onSelect={setSelectedLead} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== REMINDERS ===== */}
        {tab === "reminders" && (
          <div className="space-y-3">
            {pendingReminders.length === 0 ? (
              <Card className="p-6 text-center">
                <Bell className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground text-sm">Koi pending reminder nahi</p>
                <p className="text-xs text-muted-foreground mt-1">Lead open karke reminder set karo</p>
              </Card>
            ) : (
              pendingReminders.map(r => {
                const lead = allLeads.find(l => l.id === r.leadId);
                const isToday = r.reminderDate === todayStr();
                return (
                  <Card key={r.id} className={`p-3 ${isToday ? "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20" : ""}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isToday ? "bg-amber-100 dark:bg-amber-900/30" : "bg-muted"}`}>
                        <Bell className={`w-4 h-4 ${isToday ? "text-amber-600" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {isToday && <Badge className="text-[10px] mb-1 bg-amber-500">AAJ</Badge>}
                        <p className="font-medium text-sm">{lead?.name ?? "Unknown Lead"}</p>
                        <p className="text-xs text-muted-foreground">{r.message || "Follow-up karo"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.reminderDate} at {r.reminderTime}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => completeReminder.mutate(r.id)}>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-7 h-7" onClick={() => deleteReminder.mutate(r.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* ===== STOP LIST ===== */}
        {tab === "stop" && (
          <div className="space-y-3">
            <Card className="p-3 bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Yeh clients "Not Interested" hain. Zaroorat par unblock kar sakte ho.
              </p>
            </Card>
            {stopList.length === 0 ? (
              <Card className="p-6 text-center">
                <Ban className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground text-sm">STOP list khaali hai</p>
              </Card>
            ) : (
              stopList.map(lead => (
                <Card key={lead.id} className="p-3 flex items-center gap-3 opacity-70">
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0 text-sm font-bold">
                    {lead.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.phone} · {lead.city}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => unblockLead.mutate(lead.id)}>
                    Unblock
                  </Button>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* ===== ADD LEAD MODAL ===== */}
      <AnimatePresence>
        {showAddForm && (
          <Modal title="New Lead Add Karo" onClose={() => setShowAddForm(false)}>
            <div className="space-y-3">
              <Field label="Client Ka Naam *">
                <Input placeholder="Mr. Sharma" value={newLead.name} onChange={e => setNewLead(p => ({ ...p, name: e.target.value }))} />
              </Field>
              <Field label="Phone Number *">
                <Input placeholder="9876543210" type="tel" value={newLead.phone} onChange={e => setNewLead(p => ({ ...p, phone: e.target.value }))} />
              </Field>
              <Field label="City">
                <Input placeholder="Delhi, Mumbai..." value={newLead.city} onChange={e => setNewLead(p => ({ ...p, city: e.target.value }))} />
              </Field>
              <Field label="Machine Type">
                <Input placeholder="Shutter Patti, POP Channel..." value={newLead.machineType} onChange={e => setNewLead(p => ({ ...p, machineType: e.target.value }))} />
              </Field>
              <Field label="Lead Source">
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={newLead.source}
                  onChange={e => setNewLead(p => ({ ...p, source: e.target.value }))}
                >
                  <option value="indiamart">IndiaMART</option>
                  <option value="tradeindia">TradeIndia</option>
                  <option value="justdial">Justdial</option>
                  <option value="phone">Phone Call</option>
                </select>
              </Field>
              <Field label="Status">
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={newLead.status}
                  onChange={e => setNewLead(p => ({ ...p, status: e.target.value }))}
                >
                  <option value="HOT">🔥 HOT</option>
                  <option value="NORMAL">🌡️ NORMAL</option>
                  <option value="COLD">❄️ COLD</option>
                </select>
              </Field>
              <Field label="Notes">
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[70px] resize-none"
                  placeholder="Baat kya hui..."
                  value={newLead.notes}
                  onChange={e => setNewLead(p => ({ ...p, notes: e.target.value }))}
                />
              </Field>
              <Button className="w-full" onClick={() => createLead.mutate(newLead)} disabled={!newLead.name || !newLead.phone || createLead.isPending}>
                {createLead.isPending ? "Saving..." : "Lead Save Karo"}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ===== LEAD DETAIL / EDIT MODAL ===== */}
      <AnimatePresence>
        {selectedLead && !showEditForm && !showReminderForm && (
          <Modal title={selectedLead.name} onClose={() => setSelectedLead(null)}>
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {(["HOT", "NORMAL", "COLD"] as const).map(s => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => updateLead.mutate({ id: selectedLead.id, data: { status: s } })}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all border-2 ${selectedLead.status === s ? `${cfg.color} text-white border-transparent` : `border-muted ${cfg.textColor}`}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm">
                <Row icon={Phone} label="Phone" value={<a href={`tel:${selectedLead.phone}`} className="text-primary font-medium">{selectedLead.phone}</a>} />
                {selectedLead.city && <Row icon={MapPin} label="City" value={selectedLead.city} />}
                {selectedLead.machineType && <Row icon={Factory} label="Machine" value={selectedLead.machineType} />}
                {selectedLead.source && <Row icon={Star} label="Source" value={SOURCE_LABELS[selectedLead.source] ?? selectedLead.source} />}
                {selectedLead.nextFollowupDate && <Row icon={Clock} label="Next Follow-up" value={selectedLead.nextFollowupDate} />}
                {selectedLead.visitScheduledAt && <Row icon={Calendar} label="Visit" value={new Date(selectedLead.visitScheduledAt).toLocaleDateString("en-IN")} />}
                {selectedLead.notes && <Row icon={MessageSquare} label="Notes" value={selectedLead.notes} />}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditLead({ ...selectedLead }); setShowEditForm(true); }}>
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowReminderForm(true)}>
                  <Bell className="w-3.5 h-3.5 mr-1" /> Set Reminder
                </Button>
                <Button variant="outline" size="sm" className="text-amber-600" onClick={() => moveToStop.mutate(selectedLead.id)}>
                  <Ban className="w-3.5 h-3.5 mr-1" /> STOP List
                </Button>
                <Button variant="outline" size="sm" className="text-red-600" onClick={() => {
                  if (confirm(`${selectedLead.name} ko delete karna chahte ho?`)) deleteLead.mutate(selectedLead.id);
                }}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ===== EDIT LEAD MODAL ===== */}
      <AnimatePresence>
        {selectedLead && showEditForm && (
          <Modal title="Lead Edit Karo" onClose={() => { setShowEditForm(false); }}>
            <div className="space-y-3">
              <Field label="Naam">
                <Input value={editLead.name ?? ""} onChange={e => setEditLead(p => ({ ...p, name: e.target.value }))} />
              </Field>
              <Field label="Phone">
                <Input value={editLead.phone ?? ""} onChange={e => setEditLead(p => ({ ...p, phone: e.target.value }))} />
              </Field>
              <Field label="City">
                <Input value={editLead.city ?? ""} onChange={e => setEditLead(p => ({ ...p, city: e.target.value }))} />
              </Field>
              <Field label="Machine Type">
                <Input value={editLead.machineType ?? ""} onChange={e => setEditLead(p => ({ ...p, machineType: e.target.value }))} />
              </Field>
              <Field label="Next Follow-up Date">
                <Input type="date" value={editLead.nextFollowupDate ?? ""} onChange={e => setEditLead(p => ({ ...p, nextFollowupDate: e.target.value }))} />
              </Field>
              <Field label="Visit Date & Time">
                <Input type="datetime-local" value={editLead.visitScheduledAt ? new Date(editLead.visitScheduledAt).toISOString().slice(0, 16) : ""} onChange={e => setEditLead(p => ({ ...p, visitScheduledAt: e.target.value ? new Date(e.target.value).toISOString() : undefined }))} />
              </Field>
              <Field label="Visit Notes">
                <Input value={editLead.visitNotes ?? ""} onChange={e => setEditLead(p => ({ ...p, visitNotes: e.target.value }))} placeholder="Machine ka naam, notes..." />
              </Field>
              <Field label="Notes">
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[70px] resize-none"
                  value={editLead.notes ?? ""}
                  onChange={e => setEditLead(p => ({ ...p, notes: e.target.value }))}
                />
              </Field>
              <Button className="w-full" onClick={() => updateLead.mutate({ id: selectedLead.id, data: editLead })} disabled={updateLead.isPending}>
                {updateLead.isPending ? "Saving..." : "Save Karo"}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ===== REMINDER FORM MODAL ===== */}
      <AnimatePresence>
        {selectedLead && showReminderForm && (
          <Modal title={`Reminder — ${selectedLead.name}`} onClose={() => setShowReminderForm(false)}>
            <div className="space-y-3">
              <Field label="Reminder Date">
                <Input type="date" value={newReminder.reminderDate} onChange={e => setNewReminder(p => ({ ...p, reminderDate: e.target.value }))} />
              </Field>
              <Field label="Time">
                <Input type="time" value={newReminder.reminderTime} onChange={e => setNewReminder(p => ({ ...p, reminderTime: e.target.value }))} />
              </Field>
              <Field label="Message">
                <Input
                  value={newReminder.message}
                  onChange={e => setNewReminder(p => ({ ...p, message: e.target.value }))}
                  placeholder={`Follow up with ${selectedLead.name} regarding ${selectedLead.machineType || "machine"}`}
                />
              </Field>
              <Button className="w-full" onClick={() => createReminder.mutate({ ...newReminder, leadId: selectedLead.id })} disabled={createReminder.isPending}>
                {createReminder.isPending ? "Setting..." : "Reminder Set Karo"}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: number; color: string; bg: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function LeadCard({ lead, onSelect, compact = false }: { lead: Lead; onSelect: (l: Lead) => void; compact?: boolean }) {
  const cfg = STATUS_CONFIG[(lead.status as keyof typeof STATUS_CONFIG) ?? "NORMAL"] ?? STATUS_CONFIG.NORMAL;
  const Icon = cfg.icon;
  return (
    <Card className={`p-3 cursor-pointer active:scale-[0.99] transition-transform`} onClick={() => onSelect(lead)}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
          <Icon className={`w-4 h-4 ${cfg.textColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-sm truncate">{lead.name}</p>
            <Badge className={`text-[10px] px-1.5 py-0 ${cfg.color} text-white shrink-0`}>{lead.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {lead.phone}
            {lead.city ? ` · ${lead.city}` : ""}
            {lead.machineType ? ` · ${lead.machineType}` : ""}
          </p>
          {!compact && lead.source && (
            <p className="text-[11px] text-muted-foreground">{SOURCE_LABELS[lead.source] ?? lead.source}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          {lead.nextFollowupDate === todayStr() && (
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-medium">Follow-up Today</span>
          )}
        </div>
      </div>
    </Card>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="bg-background w-full max-w-lg rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
          <h3 className="font-semibold">{title}</h3>
          <Button size="icon" variant="ghost" onClick={onClose} className="w-8 h-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      {children}
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <span className="text-muted-foreground w-20 shrink-0 text-xs">{label}</span>
      <span className="text-sm font-medium flex-1">{value}</span>
    </div>
  );
}
