import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Save,
  Monitor,
  Smartphone,
  Send,
  Hash,
  MessageSquare,
  Eye,
  Loader2,
  X,
} from "lucide-react";
import {
  SiFacebook,
  SiInstagram,
  SiTiktok,
  SiLinkedin,
  SiThreads,
  SiX,
  SiYoutube,
} from "react-icons/si";
import { Link2, Share, ArrowRight, Copy, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Post, PostContent, Comment, User, BrandMember } from "@shared/schema";
import { STATUS_TRANSITIONS, STATUS_LABELS } from "@shared/schema";

const platformIcons: Record<string, any> = {
  facebook: SiFacebook,
  instagram: SiInstagram,
  tiktok: SiTiktok,
  linkedin: SiLinkedin,
  threads: SiThreads,
  x: SiX,
  youtube: SiYoutube,
};

const platformLabels: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  threads: "Threads",
  x: "X (Twitter)",
  youtube: "YouTube",
};

const platformCharLimits: Record<string, number> = {
  facebook: 63206,
  instagram: 2200,
  tiktok: 2200,
  linkedin: 3000,
  threads: 500,
  x: 280,
  youtube: 5000,
};

const platformColors: Record<string, string> = {
  facebook: "text-blue-600",
  instagram: "text-pink-500",
  tiktok: "text-foreground",
  linkedin: "text-blue-700",
  threads: "text-foreground",
  x: "text-foreground",
  youtube: "text-red-600",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  copy_review: { label: "Copy Review", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  copy_revision: { label: "Copy Revision", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  for_creatives: { label: "For Creatives", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  creatives_review: { label: "Creatives Review", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  creatives_revision: { label: "Creatives Revision", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  for_scheduling: { label: "For Scheduling", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  scheduled: { label: "Scheduled", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
};

const allPlatforms = [
  "facebook",
  "instagram",
  "tiktok",
  "linkedin",
  "threads",
  "x",
  "youtube",
];

interface PostWithDetails extends Post {
  contents: PostContent[];
  comments: Comment[];
}

export default function ContentComposerPage() {
  const { activeBrand } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const isEditing = params.id && params.id !== "new";
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [masterContent, setMasterContent] = useState("");
  const [platformContents, setPlatformContents] = useState<
    Record<string, string>
  >({});
  const [activeTab, setActiveTab] = useState("master");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [copyAssigneeId, setCopyAssigneeId] = useState<string>("");
  const [creativesAssigneeId, setCreativesAssigneeId] = useState<string>("");
  const [approverId, setApproverId] = useState<string>("");
  const [changingStatus, setChangingStatus] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const { data: postData, isLoading: postLoading } =
    useQuery<PostWithDetails>({
      queryKey: ["/api/posts", params.id],
      queryFn: getQueryFn({ on401: "throw" }),
      enabled: !!isEditing,
    });

  const { data: members = [] } = useQuery<(BrandMember & { user: User })[]>({
    queryKey: ["/api/brands", activeBrand?.id, "members"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!activeBrand,
  });

  const { data: hashtags = [] } = useQuery<any[]>({
    queryKey: ["/api/brands", activeBrand?.id, "hashtags"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!activeBrand,
  });

  useEffect(() => {
    if (postData) {
      setTitle(postData.title);
      setCopyAssigneeId(postData.copyAssigneeId || "");
      setCreativesAssigneeId(postData.creativesAssigneeId || "");
      setApproverId(postData.approverId || "");

      const masterC = postData.contents.find((c) => c.platform === "master");
      if (masterC) setMasterContent(masterC.body || "");

      const platforms = postData.contents
        .filter((c) => c.platform !== "master")
        .map((c) => c.platform);
      setSelectedPlatforms(platforms);

      const pContents: Record<string, string> = {};
      postData.contents.forEach((c) => {
        if (c.platform !== "master") {
          pContents[c.platform] = c.body || "";
        }
      });
      setPlatformContents(pContents);
    }
  }, [postData]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        const newPlatforms = prev.filter((p) => p !== platform);
        const newContents = { ...platformContents };
        delete newContents[platform];
        setPlatformContents(newContents);
        if (activeTab === platform) setActiveTab("master");
        return newPlatforms;
      }
      setPlatformContents((prev) => ({
        ...prev,
        [platform]: masterContent,
      }));
      return [...prev, platform];
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Title is required",
      });
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        const clean = (v: string) => v && v !== "none" ? v : null;
        await apiRequest("PATCH", `/api/posts/${params.id}`, {
          title,
          copyAssigneeId: clean(copyAssigneeId),
          creativesAssigneeId: clean(creativesAssigneeId),
          approverId: clean(approverId),
        });

        await apiRequest("PUT", `/api/posts/${params.id}/content`, {
          platform: "master",
          body: masterContent,
        });

        for (const platform of selectedPlatforms) {
          await apiRequest("PUT", `/api/posts/${params.id}/content`, {
            platform,
            body: platformContents[platform] || masterContent,
          });
        }

        queryClient.invalidateQueries({
          queryKey: ["/api/posts", params.id],
        });
        toast({ title: "Post saved" });
      } else {
        const res = await apiRequest(
          "POST",
          `/api/brands/${activeBrand!.id}/posts`,
          {
            title,
            masterContent,
            platforms: selectedPlatforms,
            notes: noteText || undefined,
            copyAssigneeId: copyAssigneeId && copyAssigneeId !== "none" ? copyAssigneeId : null,
            creativesAssigneeId: creativesAssigneeId && creativesAssigneeId !== "none" ? creativesAssigneeId : null,
            approverId: approverId && approverId !== "none" ? approverId : null,
          },
        );
        const newPost = await res.json();

        for (const platform of selectedPlatforms) {
          if (platformContents[platform] !== masterContent) {
            await apiRequest("PUT", `/api/posts/${newPost.id}/content`, {
              platform,
              body: platformContents[platform],
            });
          }
        }

        queryClient.invalidateQueries({
          queryKey: ["/api/brands", activeBrand?.id, "posts"],
        });
        toast({ title: "Post created" });
        navigate(`/content/${newPost.id}`);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !isEditing) return;
    try {
      await apiRequest("POST", `/api/posts/${params.id}/comments`, {
        body: noteText,
      });
      setNoteText("");
      queryClient.invalidateQueries({
        queryKey: ["/api/posts", params.id],
      });
      toast({ title: "Note added" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to add note",
        description: err.message,
      });
    }
  };

  const getAvailableTransitions = () => {
    if (!isEditing || !postData) return [];
    const transition = STATUS_TRANSITIONS[postData.status];
    if (!transition) return [];
    return transition.to.map((status) => ({
      status,
      label: STATUS_LABELS[status] || status,
    }));
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!isEditing) return;
    setChangingStatus(true);
    try {
      await apiRequest("PATCH", `/api/posts/${params.id}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/brands", activeBrand?.id, "posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
      toast({ title: `Status changed to ${STATUS_LABELS[newStatus]}` });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Status change failed",
        description: err.message,
      });
    } finally {
      setChangingStatus(false);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!isEditing) return;
    try {
      const res = await apiRequest("POST", `/api/posts/${params.id}/share`);
      const data = await res.json();
      const link = `${window.location.origin}/share/${data.shareToken}`;
      setShareLink(link);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to generate share link",
        description: err.message,
      });
    }
  };

  const handleCopyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const insertHashtag = (tag: string) => {
    if (activeTab === "master") {
      setMasterContent((prev) => prev + (prev ? " " : "") + tag);
    } else {
      setPlatformContents((prev) => ({
        ...prev,
        [activeTab]: (prev[activeTab] || "") + (prev[activeTab] ? " " : "") + tag,
      }));
    }
  };

  const currentContent =
    activeTab === "master"
      ? masterContent
      : platformContents[activeTab] || masterContent;
  const charLimit =
    activeTab !== "master" ? platformCharLimits[activeTab] : null;

  if (isEditing && postLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 px-6 py-3 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/content")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {isEditing ? "Edit Post" : "New Post"}
            </h1>
            {isEditing && postData && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig[postData.status]?.color || ""}`}
              >
                {statusConfig[postData.status]?.label || postData.status}
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          data-testid="button-save-post"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-[1400px] mx-auto">
          <div className="lg:col-span-2 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="post-title">Title</Label>
              <Input
                id="post-title"
                placeholder="Give your post a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-post-title"
              />
            </div>

            <div className="space-y-3">
              <Label>Target Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {allPlatforms.map((platform) => {
                  const Icon = platformIcons[platform];
                  const isSelected = selectedPlatforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                        isSelected
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-background border-border text-muted-foreground hover-elevate"
                      }`}
                      data-testid={`toggle-platform-${platform}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {platformLabels[platform]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-1">
                <Label>Content Editor</Label>
                {charLimit && (
                  <span
                    className={`text-xs ${
                      currentContent.length > charLimit
                        ? "text-destructive font-medium"
                        : "text-muted-foreground"
                    }`}
                    data-testid="text-char-count"
                  >
                    {currentContent.length} / {charLimit}
                  </span>
                )}
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-auto flex-wrap">
                  <TabsTrigger value="master" data-testid="tab-master">
                    Master
                  </TabsTrigger>
                  {selectedPlatforms.map((platform) => {
                    const Icon = platformIcons[platform];
                    return (
                      <TabsTrigger
                        key={platform}
                        value={platform}
                        data-testid={`tab-${platform}`}
                      >
                        <Icon
                          className={`h-3.5 w-3.5 mr-1 ${platformColors[platform]}`}
                        />
                        {platformLabels[platform]}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value="master" className="mt-3">
                  <Textarea
                    placeholder="Write your master caption here. This will be the base content for all platforms..."
                    value={masterContent}
                    onChange={(e) => setMasterContent(e.target.value)}
                    className="min-h-[200px] resize-none"
                    data-testid="textarea-master-content"
                  />
                </TabsContent>

                {selectedPlatforms.map((platform) => (
                  <TabsContent key={platform} value={platform} className="mt-3">
                    <Textarea
                      placeholder={`Customize content for ${platformLabels[platform]}...`}
                      value={platformContents[platform] || ""}
                      onChange={(e) =>
                        setPlatformContents((prev) => ({
                          ...prev,
                          [platform]: e.target.value,
                        }))
                      }
                      className="min-h-[200px] resize-none"
                      data-testid={`textarea-${platform}-content`}
                    />
                    {charLimit && currentContent.length > charLimit && (
                      <p className="text-xs text-destructive mt-1">
                        Content exceeds the {charLimit} character limit for{" "}
                        {platformLabels[platform]}
                      </p>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {hashtags.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5" />
                  Quick Insert Hashtags
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {hashtags.slice(0, 20).map((ht: any) => (
                    <button
                      key={ht.id}
                      onClick={() => insertHashtag(ht.tag)}
                      className="text-xs px-2 py-1 rounded-md bg-primary/5 text-primary border border-primary/10 hover-elevate transition-colors"
                      data-testid={`button-insert-hashtag-${ht.id}`}
                    >
                      {ht.tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {isEditing && postData && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-sm font-semibold">Workflow</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Current status:</span>
                      <Badge className={statusConfig[postData.status]?.color || ""} data-testid="badge-current-status">
                        {statusConfig[postData.status]?.label || postData.status}
                      </Badge>
                    </div>
                    {getAvailableTransitions().length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground">Move to:</span>
                        {getAvailableTransitions().map((t) => (
                          <Button
                            key={t.status}
                            variant="outline"
                            size="sm"
                            className="w-full justify-between text-xs"
                            disabled={changingStatus}
                            onClick={() => handleStatusChange(t.status)}
                            data-testid={`button-status-${t.status}`}
                          >
                            {changingStatus ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                {t.label}
                                <ArrowRight className="h-3 w-3" />
                              </>
                            )}
                          </Button>
                        ))}
                      </div>
                    )}
                    {getAvailableTransitions().length === 0 && postData.status === "scheduled" && (
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>This post is scheduled and locked.</span>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium">Share for External Review</h4>
                    <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={handleGenerateShareLink}
                          data-testid="button-generate-share-link"
                        >
                          <Share className="h-3 w-3 mr-2" />
                          Generate Share Link
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share Link</DialogTitle>
                        </DialogHeader>
                        {shareLink ? (
                          <div className="space-y-3 pt-2">
                            <p className="text-sm text-muted-foreground">
                              External reviewers can use this link to view the post and leave comments without logging in.
                            </p>
                            <div className="flex items-center gap-2">
                              <Input
                                value={shareLink}
                                readOnly
                                className="text-xs"
                                data-testid="input-share-link"
                              />
                              <Button
                                size="sm"
                                onClick={handleCopyShareLink}
                                data-testid="button-copy-share-link"
                              >
                                {linkCopied ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-semibold">Assignments</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Copy Assignee</Label>
                    <Select
                      value={copyAssigneeId}
                      onValueChange={setCopyAssigneeId}
                    >
                      <SelectTrigger
                        className="text-xs"
                        data-testid="select-copy-assignee"
                      >
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {members.map((m) => (
                          <SelectItem key={m.userId} value={m.userId}>
                            {m.user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Creatives Assignee</Label>
                    <Select
                      value={creativesAssigneeId}
                      onValueChange={setCreativesAssigneeId}
                    >
                      <SelectTrigger
                        className="text-xs"
                        data-testid="select-creatives-assignee"
                      >
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {members.map((m) => (
                          <SelectItem key={m.userId} value={m.userId}>
                            {m.user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Approver</Label>
                    <Select
                      value={approverId}
                      onValueChange={setApproverId}
                    >
                      <SelectTrigger
                        className="text-xs"
                        data-testid="select-approver"
                      >
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {members
                          .filter((m) => m.role === "manager")
                          .map((m) => (
                            <SelectItem key={m.userId} value={m.userId}>
                              {m.user.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Live Preview
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button
                      variant={
                        previewMode === "desktop" ? "secondary" : "ghost"
                      }
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPreviewMode("desktop")}
                      data-testid="button-preview-desktop"
                    >
                      <Monitor className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant={
                        previewMode === "mobile" ? "secondary" : "ghost"
                      }
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPreviewMode("mobile")}
                      data-testid="button-preview-mobile"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div
                  className={`border rounded-md bg-background overflow-hidden ${
                    previewMode === "mobile"
                      ? "max-w-[320px] mx-auto"
                      : "w-full"
                  }`}
                >
                  <div className="p-3 border-b bg-card">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">
                          {activeBrand?.name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold">
                          {activeBrand?.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Just now
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p
                      className="text-xs whitespace-pre-wrap leading-relaxed"
                      data-testid="text-preview-content"
                    >
                      {currentContent || (
                        <span className="text-muted-foreground italic">
                          Your content preview will appear here...
                        </span>
                      )}
                    </p>
                  </div>
                  {selectedPlatforms.length > 0 && (
                    <div className="px-3 pb-3 flex gap-1 flex-wrap">
                      {selectedPlatforms.map((p) => {
                        const Icon = platformIcons[p];
                        return (
                          <span
                            key={p}
                            className={`inline-flex items-center gap-0.5 text-[10px] ${platformColors[p]}`}
                          >
                            <Icon className="h-3 w-3" />
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Internal Notes
                </h3>

                {isEditing &&
                  postData?.comments &&
                  postData.comments.length > 0 && (
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-2 pr-2">
                        {postData.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-2 rounded-md bg-muted/50"
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[8px]">
                                  {comment.authorName
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[11px] font-medium">
                                {comment.authorName}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(
                                  comment.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {comment.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a note for the team..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="text-xs min-h-[60px] resize-none flex-1"
                    data-testid="textarea-note"
                  />
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                    data-testid="button-add-note"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Add Note
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
