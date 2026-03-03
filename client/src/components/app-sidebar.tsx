import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Image,
  Hash,
  Settings,
  Users,
  ChevronDown,
  LogOut,
  Building2,
  Zap,
  ChevronsUpDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Content", href: "/content", icon: FileText },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Media Library", href: "/media", icon: Image },
  { title: "Hashtags", href: "/hashtags", icon: Hash },
];

const manageItems = [
  { title: "Team", href: "/team", icon: Users },
  { title: "Settings", href: "/settings", icon: Settings },
];

const brandColors = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

const roleLabels: Record<string, string> = {
  manager: "Manager",
  copywriter: "Copywriter",
  creative: "Creative",
};

export function AppSidebar() {
  const { user, activeBrand, brands, setActiveBrand, logout } = useAuth();
  const [location, navigate] = useLocation();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const brandIndex = brands.findIndex((b) => b.id === activeBrand?.id);

  return (
    <Sidebar>
      <SidebarHeader className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 w-full p-2 rounded-md hover-elevate text-left"
              data-testid="button-brand-switcher"
            >
              <div
                className={`h-8 w-8 rounded-md ${brandColors[brandIndex >= 0 ? brandIndex % brandColors.length : 0]} flex items-center justify-center shrink-0`}
              >
                <span className="text-white font-bold text-[11px]">
                  {activeBrand?.name
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {activeBrand?.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {roleLabels[activeBrand?.role || ""] || "Member"}
                </p>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {brands.map((brand, i) => (
              <DropdownMenuItem
                key={brand.id}
                onClick={() => {
                  setActiveBrand(brand);
                }}
                data-testid={`menu-brand-${brand.id}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className={`h-7 w-7 rounded-md ${brandColors[i % brandColors.length]} flex items-center justify-center shrink-0`}
                  >
                    <span className="text-white font-bold text-[10px]">
                      {brand.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{brand.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {roleLabels[brand.role] || brand.role}
                    </p>
                  </div>
                  {brand.id === activeBrand?.id && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setActiveBrand(null);
                navigate("/");
              }}
              data-testid="menu-all-workspaces"
            >
              <Building2 className="h-4 w-4 mr-2" />
              All workspaces
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                  >
                    <Link href={item.href} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                  >
                    <Link href={item.href} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 w-full p-2 rounded-md hover-elevate text-left"
              data-testid="button-user-menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem
              onClick={() => {
                setActiveBrand(null);
                navigate("/");
              }}
              data-testid="menu-switch-workspace"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Switch workspace
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                navigate("/auth");
              }}
              data-testid="menu-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
