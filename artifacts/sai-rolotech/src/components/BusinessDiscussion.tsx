import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, User, Lock, Loader2 } from "lucide-react";

interface Comment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

interface BusinessDiscussionProps {
  entityType: string;
  entityId: string;
  title?: string;
}

export default function BusinessDiscussion({ entityType, entityId, title = "Business Discussion" }: BusinessDiscussionProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [showAll, setShowAll] = useState(false);

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/discussions/${entityType}/${entityId}`],
  });

  const postComment = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/discussions", {
        entityType,
        entityId,
        content,
        authorName: user?.name || user?.username || "Anonymous",
        authorRole: user?.role || "buyer",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/discussions/${entityType}/${entityId}`] });
      setComment("");
      toast({ title: "Comment posted!" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Failed to post comment", variant: "destructive" });
    },
  });

  const displayComments = showAll ? comments : comments?.slice(0, 5);

  return (
    <div className="space-y-3" data-testid="business-discussion">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          {title}
        </h3>
        {comments && comments.length > 0 && (
          <Badge variant="secondary" className="text-[10px]">{comments.length} comments</Badge>
        )}
      </div>

      {isAuthenticated ? (
        <Card className="border-primary/20">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ask a question or share your experience..."
                  rows={2}
                  className="text-xs resize-none"
                  data-testid="input-discussion-comment"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    disabled={!comment.trim() || postComment.isPending}
                    onClick={() => postComment.mutate(comment.trim())}
                    data-testid="button-post-comment"
                  >
                    {postComment.isPending ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3 mr-1" />
                    )}
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-4 pb-4 text-center">
            <Lock className="w-5 h-5 text-muted-foreground mx-auto mb-1.5" />
            <p className="text-xs text-muted-foreground">Login to join the discussion</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : displayComments && displayComments.length > 0 ? (
        <div className="space-y-2">
          {displayComments.map((c) => (
            <Card key={c.id} data-testid={`discussion-comment-${c.id}`}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold shrink-0">
                    {c.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold truncate">{c.authorName}</span>
                      <Badge variant="outline" className="text-[8px] px-1 py-0">{c.authorRole}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {comments && comments.length > 5 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full text-xs text-primary hover:underline py-2"
              data-testid="button-show-all-comments"
            >
              Show all {comments.length} comments
            </button>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <MessageSquare className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">No discussions yet. Be the first to comment!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
