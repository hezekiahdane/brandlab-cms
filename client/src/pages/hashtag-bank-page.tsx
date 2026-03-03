import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Hash,
  Search,
  Loader2,
  Trash2,
  MoreHorizontal,
  Copy,
  FolderOpen,
  X,
} from "lucide-react";
import type { Hashtag } from "@shared/schema";

export default function HashtagBankPage() {
  const { activeBrand } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [conceptFilter, setConceptFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newConcept, setNewConcept] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: hashtags = [], isLoading } = useQuery<Hashtag[]>({
    queryKey: ["/api/brands", activeBrand?.id, "hashtags"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!activeBrand,
  });

  const concepts = [
    ...new Set(hashtags.map((h) => h.concept).filter(Boolean)),
  ] as string[];

  const filtered = hashtags.filter((h) => {
    const matchesSearch = h.tag.toLowerCase().includes(search.toLowerCase());
    const matchesConcept =
      conceptFilter === "all" || h.concept === conceptFilter;
    return matchesSearch && matchesConcept;
  });

  const grouped = filtered.reduce(
    (acc, h) => {
      const key = h.concept || "Uncategorized";
      if (!acc[key]) acc[key] = [];
      acc[key].push(h);
      return acc;
    },
    {} as Record<string, Hashtag[]>,
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    setCreating(true);
    try {
      await apiRequest("POST", `/api/brands/${activeBrand!.id}/hashtags`, {
        tag: newTag.trim(),
        concept: newConcept.trim() || null,
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/brands", activeBrand?.id, "hashtags"],
      });
      setNewTag("");
      setNewConcept("");
      setDialogOpen(false);
      toast({ title: "Hashtag saved" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to save hashtag",
        description: err.message,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest("DELETE", `/api/hashtags/${id}`);
      queryClient.invalidateQueries({
        queryKey: ["/api/brands", activeBrand?.id, "hashtags"],
      });
      toast({ title: "Hashtag removed" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: err.message,
      });
    }
  };

  const handleCopy = (tag: string) => {
    navigator.clipboard.writeText(tag);
    toast({ title: "Copied to clipboard" });
  };

  const handleCopyAll = (tags: Hashtag[]) => {
    const text = tags.map((t) => t.tag).join(" ");
    navigator.clipboard.writeText(text);
    toast({ title: `Copied ${tags.length} hashtags` });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hashtag Bank</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Saved hashtags organized by concept for {activeBrand?.name}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-hashtag">
              <Plus className="h-4 w-4 mr-2" />
              Add Hashtag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a hashtag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="hashtag-tag">Hashtag</Label>
                <Input
                  id="hashtag-tag"
                  placeholder="#trending"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  required
                  data-testid="input-hashtag-tag"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hashtag-concept">
                  Concept / Category (optional)
                </Label>
                <Input
                  id="hashtag-concept"
                  placeholder="e.g., Product Launch, Summer Campaign"
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  data-testid="input-hashtag-concept"
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
                  data-testid="button-submit-hashtag"
                >
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hashtags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-hashtags"
          />
        </div>
        {concepts.length > 0 && (
          <Select value={conceptFilter} onValueChange={setConceptFilter}>
            <SelectTrigger className="w-[200px]" data-testid="select-concept-filter">
              <SelectValue placeholder="Filter by concept" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All concepts</SelectItem>
              {concepts.map((concept) => (
                <SelectItem key={concept} value={concept}>
                  {concept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-32 mb-3" />
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-7 w-20 rounded-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : hashtags.length === 0 ? (
        <div className="text-center py-16">
          <Hash className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-lg font-medium mb-1">No hashtags saved</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Start building your hashtag bank to optimize reach across platforms
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            data-testid="button-empty-add-hashtag"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Hashtag
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([concept, tags]) => (
            <Card key={concept}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">{concept}</h3>
                    <span className="text-xs text-muted-foreground">
                      ({tags.length})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyAll(tags)}
                    className="text-xs"
                    data-testid={`button-copy-all-${concept}`}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="group inline-flex items-center gap-1"
                    >
                      <button
                        onClick={() => handleCopy(tag.tag)}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/5 text-primary border border-primary/10 hover-elevate transition-colors"
                        data-testid={`hashtag-${tag.id}`}
                      >
                        {tag.tag}
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="invisible group-hover:visible p-0.5 rounded text-muted-foreground/50 hover:text-destructive transition-colors"
                        data-testid={`button-delete-hashtag-${tag.id}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
