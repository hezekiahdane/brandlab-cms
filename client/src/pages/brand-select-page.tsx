import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Plus,
  Building2,
  Loader2,
  Users,
  Zap,
  LogOut,
  ChevronRight,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  FileText,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Brand, User, BrandMember } from "@shared/schema";

const brandColors = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-teal-500",
];

function getBrandColor(index: number) {
  return brandColors[index % brandColors.length];
}

const roleLabels: Record<string, string> = {
  manager: "Manager",
  copywriter: "Copywriter",
  creative: "Creative",
};

type BrandWithRole = Brand & { role: string };
type MemberWithUser = BrandMember & { user: User };

export default function BrandSelectPage() {
  const { user, brands, brandsLoading, setActiveBrand, logout, refetchBrands } =
    useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [creating, setCreating] = useState(false);

  const [managingBrand, setManagingBrand] = useState<BrandWithRole | null>(
    null,
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("copywriter");
  const [addingMember, setAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const { data: members = [], isLoading: membersLoading } = useQuery<
    MemberWithUser[]
  >({
    queryKey: ["/api/brands", managingBrand?.id, "members"],
    enabled: !!managingBrand,
  });

  const { data: brandPosts = [] } = useQuery({
    queryKey: ["/api/brands", managingBrand?.id, "posts"],
    enabled: !!managingBrand,
  });

  const handleSelect = (brand: BrandWithRole) => {
    setActiveBrand(brand);
    navigate("/dashboard");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setCreating(true);
    try {
      await apiRequest("POST", "/api/brands", { name: newBrandName.trim() });
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      refetchBrands();
      setNewBrandName("");
      setDialogOpen(false);
      toast({ title: "Workspace created successfully" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to create workspace",
        description: err.message,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !managingBrand) return;
    setSaving(true);
    try {
      await apiRequest("PATCH", `/api/brands/${managingBrand.id}`, {
        name: editName.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      refetchBrands();
      setEditDialogOpen(false);
      setManagingBrand({ ...managingBrand, name: editName.trim() });
      toast({ title: "Workspace updated" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to update workspace",
        description: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!managingBrand) return;
    setDeleting(true);
    try {
      await apiRequest("DELETE", `/api/brands/${managingBrand.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      refetchBrands();
      setDeleteDialogOpen(false);
      setManagingBrand(null);
      toast({ title: "Workspace deleted" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete workspace",
        description: err.message,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim() || !managingBrand) return;
    setAddingMember(true);
    try {
      await apiRequest(
        "POST",
        `/api/brands/${managingBrand.id}/members`,
        { email: memberEmail.trim(), memberRole },
      );
      queryClient.invalidateQueries({
        queryKey: ["/api/brands", managingBrand.id, "members"],
      });
      setMemberEmail("");
      setMemberRole("copywriter");
      setAddMemberOpen(false);
      toast({ title: "Member added" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to add member",
        description: err.message,
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!managingBrand) return;
    setRemovingMemberId(userId);
    try {
      await apiRequest(
        "DELETE",
        `/api/brands/${managingBrand.id}/members/${userId}`,
      );
      queryClient.invalidateQueries({
        queryKey: ["/api/brands", managingBrand.id, "members"],
      });
      toast({ title: "Member removed" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to remove member",
        description: err.message,
      });
    } finally {
      setRemovingMemberId(null);
    }
  };

  const openManage = (brand: BrandWithRole) => {
    setManagingBrand(brand);
    setEditName(brand.name);
  };

  if (managingBrand) {
    const isManager = managingBrand.role === "manager";
    const brandIndex = brands.findIndex((b) => b.id === managingBrand.id);

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-1 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Brandlab</span>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 -ml-2"
            onClick={() => setManagingBrand(null)}
            data-testid="button-back-workspaces"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            All workspaces
          </Button>

          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div
                className={`h-14 w-14 rounded-lg ${getBrandColor(brandIndex >= 0 ? brandIndex : 0)} flex items-center justify-center shrink-0`}
              >
                <span className="text-white font-bold text-lg">
                  {managingBrand.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <div>
                <h1
                  className="text-2xl font-bold tracking-tight"
                  data-testid="text-brand-name"
                >
                  {managingBrand.name}
                </h1>
                <Badge variant="secondary" className="mt-1">
                  {roleLabels[managingBrand.role] || managingBrand.role}
                </Badge>
              </div>
            </div>
            {isManager && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditName(managingBrand.name);
                    setEditDialogOpen(true);
                  }}
                  data-testid="button-edit-brand"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  data-testid="button-delete-brand"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p
                      className="text-2xl font-bold"
                      data-testid="stat-members-count"
                    >
                      {membersLoading ? "..." : members.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Team Members
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p
                      className="text-2xl font-bold"
                      data-testid="stat-posts-count"
                    >
                      {(brandPosts as any[]).length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Posts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <button
                  className="flex items-center gap-3 w-full text-left"
                  onClick={() => {
                    setActiveBrand(managingBrand);
                    navigate("/dashboard");
                  }}
                  data-testid="button-open-workspace"
                >
                  <div className="h-10 w-10 rounded-md bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Open Workspace</p>
                    <p className="text-xs text-muted-foreground">
                      Go to dashboard
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Team Members</CardTitle>
                {isManager && (
                  <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        data-testid="button-add-member"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add team member</DialogTitle>
                        <DialogDescription>
                          Invite a user by email to join this workspace.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={handleAddMember}
                        className="space-y-4 pt-2"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="member-email">Email address</Label>
                          <Input
                            id="member-email"
                            type="email"
                            placeholder="colleague@company.com"
                            value={memberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)}
                            required
                            data-testid="input-member-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="member-role">Role</Label>
                          <Select
                            value={memberRole}
                            onValueChange={setMemberRole}
                          >
                            <SelectTrigger data-testid="select-member-role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="copywriter">
                                Copywriter
                              </SelectItem>
                              <SelectItem value="creative">Creative</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setAddMemberOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={addingMember}
                            data-testid="button-submit-member"
                          >
                            {addingMember && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Add
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No members yet
                </p>
              ) : (
                <div className="space-y-1">
                  {members.map((m) => (
                    <div
                      key={m.userId}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md"
                      data-testid={`member-row-${m.userId}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs">
                            {m.user.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p
                            className="text-sm font-medium leading-tight"
                            data-testid={`text-member-name-${m.userId}`}
                          >
                            {m.user.name}
                            {m.userId === user?.id && (
                              <span className="text-muted-foreground ml-1">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {m.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            m.role === "manager" ? "default" : "secondary"
                          }
                          className="text-[10px]"
                          data-testid={`badge-role-${m.userId}`}
                        >
                          {roleLabels[m.role] || m.role}
                        </Badge>
                        {isManager && m.userId !== user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(m.userId)}
                            disabled={removingMemberId === m.userId}
                            data-testid={`button-remove-member-${m.userId}`}
                          >
                            {removingMemberId === m.userId ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <UserMinus className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit workspace</DialogTitle>
                <DialogDescription>
                  Change the name of this workspace.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditBrand} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-brand-name">Workspace name</Label>
                  <Input
                    id="edit-brand-name"
                    placeholder="e.g., Acme Corp"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    data-testid="input-edit-brand-name"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    data-testid="button-save-brand"
                  >
                    {saving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete workspace</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{managingBrand.name}" and all its
                  posts, hashtags, and member associations. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteBrand}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-testid="button-confirm-delete"
                >
                  {deleting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Delete workspace
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Brandlab</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Your workspaces
          </h1>
          <p className="text-muted-foreground">
            Select a workspace to start managing content, or manage your
            workspaces below.
          </p>
        </div>

        {brandsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-1">No workspaces yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first brand workspace to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand, index) => (
              <Card
                key={brand.id}
                className="hover-elevate transition-all h-full"
                data-testid={`card-brand-${brand.id}`}
              >
                <CardContent className="p-5">
                  <button
                    onClick={() => handleSelect(brand)}
                    className="text-left w-full group"
                    data-testid={`button-brand-${brand.id}`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-11 w-11 rounded-md ${getBrandColor(index)} flex items-center justify-center shrink-0`}
                        >
                          <span className="text-white font-bold text-sm">
                            {brand.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm leading-tight">
                            {brand.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="mt-1 text-[10px]"
                          >
                            {roleLabels[brand.role] || brand.role}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                  {brand.role === "manager" && (
                    <div className="mt-3 pt-3 border-t flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          openManage(brand);
                        }}
                        data-testid={`button-manage-brand-${brand.id}`}
                      >
                        <Settings className="h-3.5 w-3.5 mr-1" />
                        Manage
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-create-brand">
                <Plus className="h-4 w-4 mr-2" />
                Create new workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new workspace</DialogTitle>
                <DialogDescription>
                  Create a brand workspace to start managing content.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="brand-name">Workspace name</Label>
                  <Input
                    id="brand-name"
                    placeholder="e.g., Acme Corp"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    required
                    data-testid="input-brand-name"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    data-testid="button-submit-brand"
                  >
                    {creating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
