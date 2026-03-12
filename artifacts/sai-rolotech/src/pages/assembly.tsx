import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, CheckCircle2, Clock, AlertCircle, Loader2,
  ClipboardList, Bell, BellOff, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AssemblyTask = {
  id: string;
  taskName: string;
  assignedTeam: string | null;
  dueDate: string;
  status: string;
  urgency: string;
  notes: string | null;
  assignedTo: string | null;
  completedAt: string | null;
  createdAt: string | null;
};

const URGENCY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  medium: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  low: { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800" },
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  navigator.serviceWorker.ready.then(async (reg) => {
    try {
      const vapidPublicKey = (window as any).__VAPID_PUBLIC_KEY__;
      if (!vapidPublicKey) {
        console.log("No VAPID public key configured, skipping push subscription");
        return;
      }
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }
      const subJson = sub.toJSON();
      await apiRequest("POST", "/api/push/subscribe", {
        endpoint: subJson.endpoint,
        keys: subJson.keys,
      });
    } catch (err) {
      console.log("Push subscription failed:", err);
    }
  });
}

function requestNotifPermission(callback: (granted: boolean) => void) {
  if (!("Notification" in window)) {
    callback(false);
    return;
  }
  if (Notification.permission === "granted") {
    callback(true);
    return;
  }
  if (Notification.permission === "denied") {
    callback(false);
    return;
  }
  Notification.requestPermission().then((perm) => {
    callback(perm === "granted");
  });
}

function useNotificationReminders(tasks: AssemblyTask[] | undefined) {
  useEffect(() => {
    if (!tasks || !("Notification" in window) || Notification.permission !== "granted") return;

    const incomplete = tasks.filter(t => t.status !== "completed");
    if (incomplete.length === 0) return;

    const checkAndNotify = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 9 || hour >= 18) return;

      incomplete.forEach((task) => {
        const due = new Date(task.dueDate);
        if (due <= now) {
          new Notification(`Reminder: ${task.taskName}`, {
            body: `This task is still ${task.status === "in_progress" ? "in progress" : "pending"} — please update status`,
            icon: "/favicon.ico",
            tag: `task-reminder-${task.id}`,
          });
        }
      });
    };

    const interval = setInterval(checkAndNotify, 2 * 60 * 60 * 1000);
    checkAndNotify();
    return () => clearInterval(interval);
  }, [tasks]);
}

export default function Assembly() {
  const [, setLocation] = useLocation();
  const { user, isAssemblyHead, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "completed">("all");
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setNotifEnabled(Notification.permission === "granted");
    }
  }, []);

  const { data: tasks, isLoading } = useQuery<AssemblyTask[]>({
    queryKey: ["/api/assembly/tasks"],
    enabled: !!user,
  });

  useNotificationReminders(tasks);

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/assembly/tasks/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assembly/tasks"] });
      toast({ title: "Task updated" });
    },
    onError: () => toast({ title: "Failed to update task", variant: "destructive" }),
  });

  const handleEnableNotifications = useCallback(() => {
    requestNotifPermission((granted) => {
      setNotifEnabled(granted);
      if (granted) {
        subscribeToPush();
        toast({ title: "Notifications enabled" });
      } else {
        toast({ title: "Notification permission denied", variant: "destructive" });
      }
    });
  }, [toast]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAssemblyHead) {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Assembly Portal</h1>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="font-semibold">Access Denied</p>
            <p className="text-sm text-muted-foreground mt-1">You need Assembly Head privileges to access this portal.</p>
            <Button onClick={() => setLocation("/auth")} className="mt-4" data-testid="button-login">Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredTasks = tasks?.filter(t => filter === "all" || t.status === filter) || [];
  const pendingCount = tasks?.filter(t => t.status === "pending").length || 0;
  const inProgressCount = tasks?.filter(t => t.status === "in_progress").length || 0;
  const completedCount = tasks?.filter(t => t.status === "completed").length || 0;

  const isOverdue = (task: AssemblyTask) => {
    if (task.status === "completed") return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold" data-testid="text-assembly-title">Assembly Portal</h1>
            <p className="text-xs text-muted-foreground">Welcome, {user?.name}</p>
          </div>
        </div>
        <Button
          variant={notifEnabled ? "outline" : "default"}
          size="sm"
          onClick={handleEnableNotifications}
          data-testid="button-toggle-notifications"
        >
          {notifEnabled ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="border-amber-200 dark:border-amber-800" data-testid="stat-pending">
          <CardContent className="pt-3 pb-2 px-3 text-center">
            <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{pendingCount}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 dark:border-blue-800" data-testid="stat-in-progress">
          <CardContent className="pt-3 pb-2 px-3 text-center">
            <Loader2 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{inProgressCount}</p>
            <p className="text-[10px] text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800" data-testid="stat-completed">
          <CardContent className="pt-3 pb-2 px-3 text-center">
            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{completedCount}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {(["all", "pending", "in_progress", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`filter-${f}`}
          >
            {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "all" ? ` (${tasks?.length || 0})` : f === "pending" ? ` (${pendingCount})` : f === "in_progress" ? ` (${inProgressCount})` : ` (${completedCount})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground text-sm">No tasks found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.map((task) => {
              const urgencyStyle = URGENCY_COLORS[task.urgency] || URGENCY_COLORS.medium;
              const overdue = isOverdue(task);

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card
                    className={`${overdue ? "border-red-400 dark:border-red-700" : urgencyStyle.border} ${task.status === "completed" ? "opacity-70" : ""}`}
                    data-testid={`card-task-${task.id}`}
                  >
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{task.taskName}</p>
                          {task.assignedTeam && (
                            <p className="text-xs text-muted-foreground mt-0.5">Team: {task.assignedTeam}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {overdue && (
                            <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
                          )}
                          <Badge className={`text-[10px] ${urgencyStyle.text} ${urgencyStyle.bg}`}>
                            {task.urgency.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due: {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <Badge className={`text-[10px] ${STATUS_COLORS[task.status] || ""}`}>
                          {task.status === "in_progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </Badge>
                      </div>

                      {task.notes && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.notes}</p>
                      )}

                      {task.status !== "completed" && (
                        <div className="flex gap-1.5 mt-2">
                          {task.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => updateTaskMutation.mutate({ id: task.id, status: "in_progress" })}
                              disabled={updateTaskMutation.isPending}
                              data-testid={`button-start-${task.id}`}
                            >
                              Start Task
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="text-xs h-7 bg-green-600 hover:bg-green-700"
                            onClick={() => updateTaskMutation.mutate({ id: task.id, status: "completed" })}
                            disabled={updateTaskMutation.isPending}
                            data-testid={`button-complete-${task.id}`}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Mark Complete
                          </Button>
                        </div>
                      )}

                      {task.status === "completed" && task.completedAt && (
                        <p className="text-[10px] text-green-600 dark:text-green-400 mt-1">
                          Completed: {new Date(task.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
