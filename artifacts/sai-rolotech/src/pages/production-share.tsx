import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ProductionPost } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { Factory, Share2, Heart, Send, Weight, StickyNote, Calendar, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ShareableCard({ post }: { post: ProductionPost }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const shareCard = () => {
    const text = `🏭 ${post.factoryName}\n📊 Today's Production: ${post.tonnage} Ton\n${post.note ? `📝 ${post.note}\n` : ""}📅 ${post.date}\n\nPowered by Sai Rolotech Industrial App`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3"
    >
      <Card className="overflow-hidden">
        <div
          ref={cardRef}
          className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 text-white relative"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/15 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <Factory className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white" data-testid={`text-prod-factory-${post.id}`}>{post.factoryName}</h4>
              <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                {post.date}
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-3 mb-3">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Today's Production</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-cyan-400" data-testid={`text-prod-tonnage-${post.id}`}>{post.tonnage}</span>
              <span className="text-sm text-zinc-300">Ton</span>
            </div>
          </div>

          {post.note && (
            <p className="text-xs text-zinc-300 mb-3 flex items-start gap-1.5">
              <StickyNote className="w-3 h-3 mt-0.5 text-zinc-500 shrink-0" />
              {post.note}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <p className="text-[9px] text-zinc-500">Powered by Sai Rolotech</p>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-zinc-500" />
              <span className="text-[10px] text-zinc-400">{post.likes || 0}</span>
            </div>
          </div>
        </div>

        <div className="p-3 flex items-center gap-2">
          <LikeButton postId={post.id} />
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={shareCard} data-testid={`button-share-prod-${post.id}`}>
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            Share on WhatsApp
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/production-posts/${postId}/like`);
    },
    onSuccess: () => {
      setLiked(true);
      queryClient.invalidateQueries({ queryKey: ["/api/production-posts"] });
    },
  });

  return (
    <Button
      size="sm"
      variant={liked ? "default" : "outline"}
      className="text-xs"
      onClick={() => likeMutation.mutate()}
      disabled={liked || likeMutation.isPending}
      data-testid={`button-like-prod-${postId}`}
    >
      <Heart className={`w-3.5 h-3.5 mr-1 ${liked ? "fill-current" : ""}`} />
      {liked ? "Liked" : "Like"}
    </Button>
  );
}

function CreateProductionPost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tonnage, setTonnage] = useState("");
  const [note, setNote] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/production-posts", {
        tonnage,
        note: note || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-posts"] });
      setTonnage("");
      setNote("");
      toast({ title: "Posted!", description: "Your production status has been shared." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (!user) return null;

  return (
    <Card className="p-4 mb-4 border-primary/20 bg-primary/5">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <Send className="w-4 h-4 text-primary" />
        Share Today's Production
      </h3>
      <div className="space-y-3">
        <div>
          <Label className="text-xs flex items-center gap-1">
            <Weight className="w-3 h-3" />
            Tonnage (Ton)
          </Label>
          <Input
            type="number"
            value={tonnage}
            onChange={e => setTonnage(e.target.value)}
            placeholder="e.g. 6"
            className="h-9 text-sm"
            data-testid="input-tonnage"
          />
        </div>
        <div>
          <Label className="text-xs flex items-center gap-1">
            <StickyNote className="w-3 h-3" />
            Note (optional)
          </Label>
          <Input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Shutter Patti production"
            className="h-9 text-sm"
            data-testid="input-prod-note"
          />
        </div>
        <Button
          className="w-full text-xs"
          onClick={() => createMutation.mutate()}
          disabled={!tonnage.trim() || createMutation.isPending}
          data-testid="button-post-production"
        >
          {createMutation.isPending ? (
            <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Posting...</>
          ) : (
            <><Factory className="w-3.5 h-3.5 mr-2" />Post Production Status</>
          )}
        </Button>
      </div>
    </Card>
  );
}

export default function ProductionShare() {
  const { data: posts, isLoading } = useQuery<ProductionPost[]>({
    queryKey: ["/api/production-posts"],
  });

  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-3">
        <h1 className="text-xl font-bold mb-1 flex items-center gap-2" data-testid="text-production-title">
          <Factory className="w-5 h-5 text-primary" />
          Production Feed
        </h1>
        <p className="text-sm text-muted-foreground">Share & view daily factory production stats</p>
      </div>

      <CreateProductionPost />

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold">Community Production</h2>
        <Badge variant="secondary" className="text-[10px]">
          {posts?.length || 0} posts
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : posts && posts.length > 0 ? (
        <AnimatePresence>
          {posts.map(post => (
            <ShareableCard key={post.id} post={post} />
          ))}
        </AnimatePresence>
      ) : (
        <Card className="p-8 text-center">
          <Factory className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No production posts yet</p>
          <p className="text-xs text-muted-foreground mt-1">Be the first to share your daily production!</p>
        </Card>
      )}
    </div>
  );
}
