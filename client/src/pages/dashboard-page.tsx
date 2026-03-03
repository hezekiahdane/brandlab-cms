import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
import { STATUS_LABELS } from "@shared/schema";
import {
  Calendar,
  FileText,
  Image,
  Hash,
  ChevronRight,
  Loader2,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PostWithBrand = Post & { brandName?: string };

const quickActions = [
  {
    title: "Content Calendar",
    description: "View and manage your content schedule",
    icon: Calendar,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    path: "/calendar",
  },
  {
    title: "Content List",
    description: "Browse all content ideas and posts",
    icon: FileText,
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    path: "/content",
  },
  {
    title: "Media Library",
    description: "Manage images, videos, and assets",
    icon: Image,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    path: "/media",
  },
  {
    title: "Hashtag Bank",
    description: "Saved hashtags organized by concept",
    icon: Hash,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    path: "/hashtags",
  },
];

const statusColorMap: Record<string, string> = {
  draft: "bg-muted",
  copy_review: "bg-blue-500",
  copy_revision: "bg-blue-400",
  for_creatives: "bg-violet-500",
  creatives_review: "bg-violet-400",
  creatives_revision: "bg-violet-300",
  for_scheduling: "bg-amber-500",
  scheduled: "bg-emerald-500",
};

const statusBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  copy_review: "default",
  copy_revision: "outline",
  for_creatives: "default",
  creatives_review: "outline",
  creatives_revision: "outline",
  for_scheduling: "default",
  scheduled: "default",
};

const roleLabels: Record<string, string> = {
  manager: "Manager",
  copywriter: "Copywriter",
  creative: "Creative",
};

function getAssignmentRole(post: Post, userId: string): string[] {
  const roles: string[] = [];
  if (post.copyAssigneeId === userId) roles.push("Copywriter");
  if (post.creativesAssigneeId === userId) roles.push("Creative");
  if (post.approverId === userId) roles.push("Approver");
  return roles;
}

export default function DashboardPage() {
  const { user, activeBrand } = useAuth();
  const [, navigate] = useLocation();
  const [assignedFilter, setAssignedFilter] = useState<string>("all");

  const { data: brandPosts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/brands", activeBrand?.id, "posts"],
    enabled: !!activeBrand,
  });

  const { data: assignedPosts = [], isLoading: assignedLoading } = useQuery<PostWithBrand[]>({
    queryKey: ["/api/posts/assigned"],
    enabled: !!user,
  });

  if (!activeBrand) {
    navigate("/");
    return null;
  }

  const greeting = getGreeting();

  const statusCounts = computeStatusCounts(brandPosts);

  const filteredAssigned = assignedFilter === "all"
    ? assignedPosts
    : assignedPosts.filter((p) => p.status === assignedFilter);

  const uniqueStatuses = Array.from(new Set(assignedPosts.map((p) => p.status)));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-greeting">
          {greeting}, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Here's what's happening with{" "}
          <span className="font-medium text-foreground">
            {activeBrand.name}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {postsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-muted animate-pulse" />
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-7 w-8 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          statusCounts.map((status) => (
            <Card key={status.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-2 w-2 rounded-full ${status.color}`} />
                  <span className="text-xs text-muted-foreground">
                    {status.label}
                  </span>
                </div>
                <p className="text-2xl font-bold" data-testid={`text-count-${status.key}`}>
                  {status.count}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <h2 className="text-lg font-semibold" data-testid="text-assigned-heading">
            Assigned to Me
          </h2>
          <Select value={assignedFilter} onValueChange={setAssignedFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-assigned-filter">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="select-item-all">All Statuses</SelectItem>
              {uniqueStatuses.map((s) => (
                <SelectItem key={s} value={s} data-testid={`select-item-${s}`}>
                  {STATUS_LABELS[s] || s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {assignedLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredAssigned.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground" data-testid="text-no-assigned">
                {assignedFilter === "all"
                  ? "No posts assigned to you yet."
                  : "No assigned posts match this filter."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredAssigned.map((post) => {
              const roles = user ? getAssignmentRole(post, user.id) : [];
              return (
                <Card
                  key={post.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => navigate(`/content/${post.id}`)}
                  data-testid={`card-assigned-post-${post.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="font-medium text-sm truncate"
                              data-testid={`text-assigned-title-${post.id}`}
                            >
                              {post.title}
                            </span>
                            {post.brandName && (
                              <Badge variant="outline" className="text-xs" data-testid={`badge-brand-${post.id}`}>
                                {post.brandName}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge
                              variant={statusBadgeVariant[post.status] || "secondary"}
                              data-testid={`badge-status-${post.id}`}
                            >
                              {STATUS_LABELS[post.status] || post.status}
                            </Badge>
                            {roles.map((role) => (
                              <Badge
                                key={role}
                                variant="outline"
                                className="text-xs"
                                data-testid={`badge-role-${role.toLowerCase()}-${post.id}`}
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="hover-elevate cursor-pointer group"
              onClick={() => navigate(action.path)}
              data-testid={`card-action-${action.title.toLowerCase().replace(/\s/g, "-")}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-10 w-10 rounded-md ${action.color} flex items-center justify-center shrink-0`}
                    >
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{action.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Workspace Info</h2>
        <Card>
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm text-muted-foreground">Your role</span>
                <Badge variant="secondary" data-testid="text-user-role">
                  {roleLabels[activeBrand.role] || activeBrand.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm text-muted-foreground">
                  Workspace
                </span>
                <span className="text-sm font-medium" data-testid="text-brand-name">
                  {activeBrand.name}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function computeStatusCounts(posts: Post[]) {
  const counts: Record<string, number> = {};
  for (const post of posts) {
    counts[post.status] = (counts[post.status] || 0) + 1;
  }

  return [
    { key: "draft", label: "Draft", count: counts["draft"] || 0, color: statusColorMap["draft"] },
    { key: "in-review", label: "In Review", count: (counts["copy_review"] || 0) + (counts["creatives_review"] || 0), color: "bg-blue-500" },
    { key: "for-creatives", label: "For Creatives", count: counts["for_creatives"] || 0, color: "bg-violet-500" },
    { key: "scheduled", label: "Scheduled", count: counts["scheduled"] || 0, color: "bg-emerald-500" },
  ];
}
