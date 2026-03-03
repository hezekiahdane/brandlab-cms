import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, ExternalLink, MessageSquare, ArrowRightLeft } from "lucide-react";
import { useLocation } from "wouter";
import type { Notification } from "@shared/schema";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  const { data: countData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 15000,
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: open,
  });

  const unreadCount = countData?.count || 0;

  const handleMarkAllRead = async () => {
    await apiRequest("POST", "/api/notifications/read-all");
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
  };

  const handleClick = async (notif: Notification) => {
    if (notif.read === "false") {
      await apiRequest("PATCH", `/api/notifications/${notif.id}/read`);
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
    }
    if (notif.postId) {
      setOpen(false);
      setLocation(`/content/${notif.postId}`);
    }
  };

  const getIcon = (type: string) => {
    if (type === "external_comment") return <MessageSquare className="h-3.5 w-3.5 text-orange-500 shrink-0" />;
    return <ArrowRightLeft className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={handleMarkAllRead}
              data-testid="button-mark-all-read"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[320px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div>
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors flex gap-3 items-start ${
                    notif.read === "false" ? "bg-primary/5" : ""
                  }`}
                  data-testid={`notification-${notif.id}`}
                >
                  {getIcon(notif.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatTime(notif.createdAt as unknown as string)}
                    </p>
                  </div>
                  {notif.read === "false" && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
