import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Calendar,
  Trash2,
  Eye,
  Edit,
  Globe,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Post } from "@shared/schema";

type PostWithBrand = Post & { brandName?: string };

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  draft: {
    label: "Draft",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
  copy_review: {
    label: "Copy Review",
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  copy_revision: {
    label: "Copy Revision",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  for_creatives: {
    label: "For Creatives",
    color: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/30",
  },
  creatives_review: {
    label: "Creatives Review",
    color: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
  },
  creatives_revision: {
    label: "Creatives Revision",
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  for_scheduling: {
    label: "For Scheduling",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  scheduled: {
    label: "Scheduled",
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
};

export default function ContentListPage() {
  const { activeBrand } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"brand" | "all">("brand");

  const { data: brandPosts = [], isLoading: brandLoading } = useQuery<Post[]>({
    queryKey: ["/api/brands", activeBrand?.id, "posts"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!activeBrand && viewMode === "brand",
  });

  const { data: allPosts = [], isLoading: allLoading } = useQuery<PostWithBrand[]>({
    queryKey: ["/api/posts/all"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: viewMode === "all",
  });

  const posts: PostWithBrand[] = viewMode === "brand" ? brandPosts : allPosts;
  const isLoading = viewMode === "brand" ? brandLoading : allLoading;

  const filtered = posts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (postId: string) => {
    try {
      await apiRequest("DELETE", `/api/posts/${postId}`);
      queryClient.invalidateQueries({
        queryKey: ["/api/brands", activeBrand?.id, "posts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/posts/all"],
      });
      toast({ title: "Post deleted" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: err.message,
      });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Content</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {viewMode === "brand"
              ? `Manage posts and content ideas for ${activeBrand?.name}`
              : "Viewing posts across all brands"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border rounded-md" data-testid="toggle-view-mode">
            <Button
              variant={viewMode === "brand" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("brand")}
              data-testid="button-view-brand"
            >
              <Building2 className="h-4 w-4 mr-1.5" />
              Brand
            </Button>
            <Button
              variant={viewMode === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("all")}
              data-testid="button-view-all"
            >
              <Globe className="h-4 w-4 mr-1.5" />
              All Brands
            </Button>
          </div>
          <Button
            onClick={() => navigate("/content/new")}
            data-testid="button-new-post"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-posts"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-lg font-medium mb-1">
            {posts.length === 0 ? "No content yet" : "No matching posts"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {posts.length === 0
              ? "Create your first post to get started"
              : "Try adjusting your search or filters"}
          </p>
          {posts.length === 0 && (
            <Button
              onClick={() => navigate("/content/new")}
              data-testid="button-empty-new-post"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((post) => {
            const sc = statusConfig[post.status] || statusConfig.draft;
            return (
              <Card
                key={post.id}
                className="hover-elevate cursor-pointer"
                data-testid={`card-post-${post.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/content/${post.id}`)}
                    >
                      <h3 className="font-medium text-sm truncate">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {viewMode === "all" && post.brandName && (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0"
                            data-testid={`badge-brand-${post.id}`}
                          >
                            {post.brandName}
                          </Badge>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.color}`}
                        >
                          {sc.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        {post.scheduledDate && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(
                              post.scheduledDate,
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-post-menu-${post.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/content/${post.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(post.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
