import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BroadcastPost } from "@/lib/schema";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Megaphone, Eye, Calendar, Users, Bell, BellOff,
  Building2, ShoppingCart, Globe
} from "lucide-react";

function formatDate(date: Date | string | null) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AudienceBadge({ audience }: { audience: string }) {
  const config: Record<string, { label: string; color: string; icon: any }> = {
    suppliers: { label: "Suppliers", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Building2 },
    buyers: { label: "Machine Buyers", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: ShoppingCart },
    all: { label: "Everyone", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Globe },
  };
  const c = config[audience] || config.all;
  const Icon = c.icon;
  return (
    <Badge className={`text-[9px] ${c.color} gap-0.5`}>
      <Icon className="w-2.5 h-2.5" /> {c.label}
    </Badge>
  );
}

const viewedPosts = new Set<string>();

function BroadcastCard({ post }: { post: BroadcastPost }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const viewMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/broadcast-posts/${post.id}/view`);
    },
  });

  useEffect(() => {
    if (viewedPosts.has(post.id)) return;
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewedPosts.has(post.id)) {
          viewedPosts.add(post.id);
          viewMutation.mutate();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [post.id]);

  return (
    <Card ref={cardRef} className="overflow-hidden" data-testid={`card-broadcast-${post.id}`}>
      {post.image && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className={post.image ? "pt-3 pb-3" : "pt-4 pb-3"}>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-sm leading-tight" data-testid={`text-broadcast-title-${post.id}`}>{post.title}</h3>
          <AudienceBadge audience={post.audience} />
        </div>
        <p className="text-xs text-muted-foreground whitespace-pre-wrap mb-2">{post.message}</p>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Calendar className="w-3 h-3" />
            {formatDate(post.createdAt)}
          </span>
          <span className="flex items-center gap-0.5">
            <Eye className="w-3 h-3" />
            {post.viewCount || 0} views
          </span>
          {post.createdBy && (
            <span className="text-[10px] ml-auto">By {post.createdBy}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BroadcastFeed() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  const userRole = user?.role || "buyer";
  const audience = (userRole === "supplier" || userRole === "vendor") ? "suppliers" : "buyers";

  const { data: posts, isLoading } = useQuery<BroadcastPost[]>({
    queryKey: [`/api/broadcast-posts?audience=${audience}`],
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/broadcast-notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broadcast-notifications/count"] });
    },
  });

  useEffect(() => {
    if (user && posts && posts.length > 0) {
      markReadMutation.mutate();
    }
  }, [user, posts?.length]);

  const { data: notifPref } = useQuery<{ enabled: boolean }>({
    queryKey: ["/api/broadcast-notification-pref"],
    enabled: !!user,
  });

  const toggleNotifMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      await apiRequest("POST", "/api/broadcast-notification-pref", { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/broadcast-notification-pref"] });
    },
  });

  const notifEnabled = notifPref?.enabled !== false;

  return (
    <div className="pb-24 px-4">
      <div className="flex items-center gap-3 pt-4 pb-3">
        <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2" data-testid="text-broadcast-feed-title">
            <Megaphone className="w-5 h-5 text-primary" />
            Broadcasts
          </h1>
          <p className="text-xs text-muted-foreground">Updates from Sai Rolotech</p>
        </div>
        {user && (
          <div className="flex items-center gap-1.5">
            {notifEnabled ? (
              <Bell className="w-4 h-4 text-primary" />
            ) : (
              <BellOff className="w-4 h-4 text-muted-foreground" />
            )}
            <Switch
              checked={notifEnabled}
              onCheckedChange={(checked) => toggleNotifMutation.mutate(checked)}
              className="scale-75"
              data-testid="switch-broadcast-notif"
            />
          </div>
        )}
      </div>

      {user && (
        <Card className="mb-3 border-primary/20">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {notifEnabled ? (
                  <Bell className="w-4 h-4 text-primary" />
                ) : (
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-xs font-medium">Broadcast Notifications</p>
                  <p className="text-[10px] text-muted-foreground">
                    {notifEnabled ? "You will receive notifications for new broadcasts" : "Notifications are turned off"}
                  </p>
                </div>
              </div>
              <Switch
                checked={notifEnabled}
                onCheckedChange={(checked) => toggleNotifMutation.mutate(checked)}
                data-testid="switch-broadcast-notif-settings"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <BroadcastCard key={post.id} post={post} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <Megaphone className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">No broadcasts yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Check back later for updates from Sai Rolotech
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
