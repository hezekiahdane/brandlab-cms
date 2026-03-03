import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import BrandSelectPage from "@/pages/brand-select-page";
import DashboardPage from "@/pages/dashboard-page";
import ContentListPage from "@/pages/content-list-page";
import ContentComposerPage from "@/pages/content-composer-page";
import HashtagBankPage from "@/pages/hashtag-bank-page";
import SharePage from "@/pages/share-page";
import CalendarPage from "@/pages/calendar-page";
import { NotificationBell } from "@/components/notification-bell";
import { Loader2 } from "lucide-react";

function ProtectedRoute({
  component: Component,
  requireBrand = false,
}: {
  component: React.ComponentType;
  requireBrand?: boolean;
}) {
  const { user, isLoading, activeBrand } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (requireBrand && !activeBrand) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-1 p-2 border-b shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-1">
              <NotificationBell />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function DashboardRoutes() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/content" component={ContentListPage} />
        <Route path="/content/new" component={ContentComposerPage} />
        <Route path="/content/:id" component={ContentComposerPage} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/media">
          <PlaceholderPage title="Media Library" />
        </Route>
        <Route path="/hashtags" component={HashtagBankPage} />
        <Route path="/team">
          <PlaceholderPage title="Team" />
        </Route>
        <Route path="/settings">
          <PlaceholderPage title="Settings" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-1">{title}</h1>
      <p className="text-muted-foreground text-sm">
        This section will be available in a future update.
      </p>
    </div>
  );
}

function AppRoutes() {
  const { user, isLoading, activeBrand } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && location !== "/auth" && !location.startsWith("/share/")) {
    return <Redirect to="/auth" />;
  }

  if (
    user &&
    activeBrand &&
    (location === "/" || location === "/auth")
  ) {
    return <Redirect to="/dashboard" />;
  }

  if (user && !activeBrand && location === "/auth") {
    return <Redirect to="/" />;
  }

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/share/:token" component={SharePage} />
      <Route path="/">
        <ProtectedRoute component={BrandSelectPage} />
      </Route>
      <Route>
        <ProtectedRoute component={DashboardRoutes} requireBrand />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
