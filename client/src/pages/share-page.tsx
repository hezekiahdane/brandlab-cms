import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send, MessageSquare, Eye } from "lucide-react";
import { STATUS_LABELS } from "@shared/schema";

interface SharedPost {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  brandName: string;
  contents: { id: string; platform: string; body: string; media: any }[];
  comments: {
    id: string;
    authorName: string;
    body: string;
    isExternal: string;
    createdAt: string;
  }[];
}

export default function SharePage() {
  const [, params] = useRoute("/share/:token");
  const token = params?.token;
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: post, isLoading, error } = useQuery<SharedPost>({
    queryKey: ["/api/share", token],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!token,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setSubmitting(true);
    try {
      await apiRequest("POST", `/api/share/${token}/comments`, {
        authorName: name.trim(),
        body: comment.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/share", token] });
      setComment("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <Eye className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-1">Link Not Found</h2>
            <p className="text-sm text-muted-foreground">
              This shared link is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const masterContent = post.contents.find((c) => c.platform === "master");
  const platformContents = post.contents.filter((c) => c.platform !== "master");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Shared for review — {post.brandName}
            </p>
            <h1 className="text-xl font-bold mt-0.5" data-testid="text-share-title">
              {post.title}
            </h1>
          </div>
          <Badge variant="secondary" data-testid="badge-share-status">
            {STATUS_LABELS[post.status] || post.status}
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Content</CardTitle>
          </CardHeader>
          <CardContent>
            {post.contents.length > 1 ? (
              <Tabs defaultValue="master">
                <TabsList>
                  {masterContent && <TabsTrigger value="master">Master</TabsTrigger>}
                  {platformContents.map((c) => (
                    <TabsTrigger key={c.platform} value={c.platform} className="capitalize">
                      {c.platform}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {masterContent && (
                  <TabsContent value="master">
                    <div
                      className="whitespace-pre-wrap text-sm leading-relaxed p-4 rounded-md bg-muted/50"
                      data-testid="text-share-master-content"
                    >
                      {masterContent.body || "No content yet"}
                    </div>
                  </TabsContent>
                )}
                {platformContents.map((c) => (
                  <TabsContent key={c.platform} value={c.platform}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 rounded-md bg-muted/50">
                      {c.body || "No content yet"}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div
                className="whitespace-pre-wrap text-sm leading-relaxed p-4 rounded-md bg-muted/50"
                data-testid="text-share-master-content"
              >
                {masterContent?.body || "No content yet"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <CardTitle className="text-base">
                Comments ({post.comments.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {post.comments.length > 0 && (
              <div className="space-y-3">
                {post.comments.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-lg text-sm ${
                      c.isExternal === "true"
                        ? "bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/30"
                        : "bg-muted/50"
                    }`}
                    data-testid={`comment-${c.id}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-xs">{c.authorName}</span>
                      {c.isExternal === "true" && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                          External
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">{c.body}</p>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Leave your feedback below. The team will be notified immediately.
              </p>
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="input-external-name"
              />
              <Textarea
                placeholder="Write your comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={3}
                data-testid="textarea-external-comment"
              />
              <div className="flex items-center justify-between">
                {submitted && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Comment submitted successfully!
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={submitting || !name.trim() || !comment.trim()}
                  className="ml-auto"
                  data-testid="button-submit-external-comment"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Submit Comment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
