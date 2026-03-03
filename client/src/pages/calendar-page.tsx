import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  FileText,
  X,
} from "lucide-react";
import type { Post } from "@shared/schema";

interface PostWithBrand extends Post {
  brandName?: string;
}

const statusConfig: Record<string, { label: string; dotColor: string; bg: string; color: string }> = {
  draft: { label: "Draft", dotColor: "bg-gray-400", bg: "bg-muted", color: "text-muted-foreground" },
  copy_review: { label: "Copy Review", dotColor: "bg-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-700 dark:text-blue-400" },
  copy_revision: { label: "Copy Revision", dotColor: "bg-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-700 dark:text-amber-400" },
  for_creatives: { label: "For Creatives", dotColor: "bg-violet-500", bg: "bg-violet-100 dark:bg-violet-900/30", color: "text-violet-700 dark:text-violet-400" },
  creatives_review: { label: "Creatives Review", dotColor: "bg-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-900/30", color: "text-indigo-700 dark:text-indigo-400" },
  creatives_revision: { label: "Creatives Revision", dotColor: "bg-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-700 dark:text-orange-400" },
  for_scheduling: { label: "For Scheduling", dotColor: "bg-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-700 dark:text-emerald-400" },
  scheduled: { label: "Scheduled", dotColor: "bg-green-500", bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-700 dark:text-green-400" },
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HEATMAP_HOURS: Record<string, number[]> = {
  default: [9, 10, 11, 18, 19, 20],
  instagram: [9, 10, 11, 12, 18, 19, 20, 21],
  facebook: [9, 10, 11, 13, 18, 19],
  linkedin: [7, 8, 9, 10, 11, 12],
  tiktok: [10, 11, 19, 20, 21, 22],
  x: [8, 9, 10, 12, 17, 18],
  youtube: [12, 13, 14, 15, 16, 17],
  threads: [9, 10, 11, 18, 19, 20],
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isToday(date: Date) {
  return isSameDay(date, new Date());
}

function getEngagementLevel(dayOfWeek: number): "high" | "medium" | "low" {
  if (dayOfWeek >= 1 && dayOfWeek <= 4) return "high";
  if (dayOfWeek === 5) return "medium";
  return "low";
}

export default function CalendarPage() {
  const { activeBrand } = useAuth();
  const [, navigate] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"brand" | "all">("brand");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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

  const isLoading = viewMode === "brand" ? brandLoading : allLoading;
  const posts: PostWithBrand[] = viewMode === "brand" ? brandPosts : allPosts;

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => statusFilter === "all" || p.status === statusFilter);
  }, [posts, statusFilter]);

  const scheduledPosts = useMemo(() => {
    return filteredPosts.filter((p) => p.scheduledDate);
  }, [filteredPosts]);

  const unscheduledPosts = useMemo(() => {
    return filteredPosts.filter((p) => !p.scheduledDate);
  }, [filteredPosts]);

  const postsByDate = useMemo(() => {
    const map = new Map<string, PostWithBrand[]>();
    scheduledPosts.forEach((post) => {
      const d = new Date(post.scheduledDate!);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(post);
    });
    return map;
  }, [scheduledPosts]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDay, daysInMonth]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date());
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    if (selectedDay && isSameDay(selectedDay, clickedDate)) {
      setSelectedDay(null);
    } else {
      setSelectedDay(clickedDate);
    }
  };

  const getPostsForDay = (day: number): PostWithBrand[] => {
    const key = `${year}-${month}-${day}`;
    return postsByDate.get(key) || [];
  };

  const selectedDayPosts = selectedDay ? getPostsForDay(selectedDay.getDate()) : [];

  const monthLabel = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-calendar-title">
            Content Calendar
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {viewMode === "brand"
              ? `Schedule and manage posts for ${activeBrand?.name || "your brand"}`
              : "All posts across your brands"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as "brand" | "all")}>
            <SelectTrigger className="w-[160px]" data-testid="select-view-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brand">Current Brand</SelectItem>
              <SelectItem value="all">All Brands</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[170px]" data-testid="select-status-filter">
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
          <Button
            variant={showHeatmap ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="toggle-elevate"
            data-testid="button-toggle-heatmap"
          >
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Heatmap
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={goToPrevMonth} data-testid="button-prev-month">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[180px] text-center" data-testid="text-current-month">
                {monthLabel}
              </h2>
              <Button variant="ghost" size="icon" onClick={goToNextMonth} data-testid="button-next-month">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={goToToday} data-testid="button-today">
              Today
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-7">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground border-b">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="min-h-[90px] border-b border-r last:border-r-0 bg-muted/20" />;
                    }

                    const date = new Date(year, month, day);
                    const dayPosts = getPostsForDay(day);
                    const isTodayDate = isToday(date);
                    const isSelected = selectedDay && isSameDay(selectedDay, date);
                    const engagement = getEngagementLevel(date.getDay());

                    return (
                      <div
                        key={day}
                        className={`min-h-[90px] border-b border-r p-1.5 cursor-pointer transition-colors relative ${
                          isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/30" : "hover-elevate"
                        } ${showHeatmap && engagement === "high" ? "bg-green-50/50 dark:bg-green-900/10" : ""} ${showHeatmap && engagement === "medium" ? "bg-yellow-50/30 dark:bg-yellow-900/5" : ""}`}
                        onClick={() => handleDayClick(day)}
                        data-testid={`cell-day-${day}`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`text-xs font-medium leading-none ${
                              isTodayDate
                                ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center"
                                : "text-muted-foreground"
                            }`}
                          >
                            {day}
                          </span>
                          {dayPosts.length > 0 && (
                            <span className="text-[10px] text-muted-foreground" data-testid={`text-post-count-${day}`}>
                              {dayPosts.length}
                            </span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          {dayPosts.slice(0, 3).map((post) => {
                            const sc = statusConfig[post.status] || statusConfig.draft;
                            return (
                              <div
                                key={post.id}
                                className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate ${sc.bg} ${sc.color} cursor-pointer`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/content/${post.id}`);
                                }}
                                title={post.title}
                                data-testid={`chip-post-${post.id}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dotColor}`} />
                                <span className="truncate">{post.title}</span>
                              </div>
                            );
                          })}
                          {dayPosts.length > 3 && (
                            <span className="text-[10px] text-muted-foreground pl-1">
                              +{dayPosts.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {showHeatmap && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="font-medium">Engagement heatmap:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800" />
                High (Mon-Thu)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800" />
                Medium (Fri)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-background border" />
                Low (Sat-Sun)
              </span>
              <span className="text-muted-foreground/60">Best times: 9-11am, 6-8pm</span>
            </div>
          )}

          {selectedDay && (
            <Card data-testid="panel-selected-day">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    {selectedDay.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedDay(null)} data-testid="button-close-day-panel">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {selectedDayPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No posts scheduled for this day.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayPosts.map((post) => {
                      const sc = statusConfig[post.status] || statusConfig.draft;
                      return (
                        <div
                          key={post.id}
                          className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                          onClick={() => navigate(`/content/${post.id}`)}
                          data-testid={`row-day-post-${post.id}`}
                        >
                          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{post.title}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.color}`}>
                                {sc.label}
                              </span>
                              {viewMode === "all" && (post as PostWithBrand).brandName && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {(post as PostWithBrand).brandName}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {showHeatmap && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Best posting times for {selectedDay.toLocaleDateString("en-US", { weekday: "long" })}
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      {HEATMAP_HOURS.default.map((hour) => (
                        <span
                          key={hour}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        >
                          {hour > 12 ? `${hour - 12}pm` : hour === 12 ? "12pm" : `${hour}am`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card data-testid="panel-unscheduled">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Unscheduled
                {unscheduledPosts.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0" data-testid="badge-unscheduled-count">
                    {unscheduledPosts.length}
                  </Badge>
                )}
              </h3>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : unscheduledPosts.length === 0 ? (
                <p className="text-xs text-muted-foreground">All posts are scheduled.</p>
              ) : (
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                  {unscheduledPosts.map((post) => {
                    const sc = statusConfig[post.status] || statusConfig.draft;
                    return (
                      <div
                        key={post.id}
                        className="flex items-center gap-2 p-2 rounded-md hover-elevate cursor-pointer"
                        onClick={() => navigate(`/content/${post.id}`)}
                        data-testid={`row-unscheduled-post-${post.id}`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${sc.dotColor}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{post.title}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] ${sc.color}`}>{sc.label}</span>
                            {viewMode === "all" && (post as PostWithBrand).brandName && (
                              <span className="text-[10px] text-muted-foreground">
                                {(post as PostWithBrand).brandName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {showHeatmap && (
            <Card data-testid="panel-heatmap-legend">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Peak Hours
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium mb-1">Morning</p>
                    <p className="text-xs text-muted-foreground">9:00 AM - 11:00 AM</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1">Evening</p>
                    <p className="text-xs text-muted-foreground">6:00 PM - 8:00 PM</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-[10px] text-muted-foreground">
                      Based on general social media engagement patterns. Weekdays (Mon-Thu) tend to have higher engagement than weekends.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
