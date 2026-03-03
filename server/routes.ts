import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import passport from "passport";
import {
  insertBrandSchema,
  registerSchema,
  insertPostSchema,
  updatePostSchema,
  insertPostContentSchema,
  insertCommentSchema,
  insertHashtagSchema,
  STATUS_TRANSITIONS,
  STATUS_LABELS,
} from "@shared/schema";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

async function createWorkflowNotifications(
  post: any,
  newStatus: string,
  actorId: string,
  postTitle: string,
) {
  const label = STATUS_LABELS[newStatus] || newStatus;
  const notifyUserIds: string[] = [];

  switch (newStatus) {
    case "copy_review":
      if (post.approverId) notifyUserIds.push(post.approverId);
      break;
    case "copy_revision":
      if (post.copyAssigneeId) notifyUserIds.push(post.copyAssigneeId);
      break;
    case "for_creatives":
      if (post.creativesAssigneeId) notifyUserIds.push(post.creativesAssigneeId);
      break;
    case "creatives_review":
      if (post.approverId) notifyUserIds.push(post.approverId);
      break;
    case "creatives_revision":
      if (post.creativesAssigneeId) notifyUserIds.push(post.creativesAssigneeId);
      break;
    case "for_scheduling":
      if (post.copyAssigneeId) notifyUserIds.push(post.copyAssigneeId);
      if (post.creativesAssigneeId) notifyUserIds.push(post.creativesAssigneeId);
      if (post.approverId) notifyUserIds.push(post.approverId);
      break;
    case "scheduled":
      if (post.copyAssigneeId) notifyUserIds.push(post.copyAssigneeId);
      if (post.creativesAssigneeId) notifyUserIds.push(post.creativesAssigneeId);
      if (post.approverId) notifyUserIds.push(post.approverId);
      break;
  }

  const uniqueIds = [...new Set(notifyUserIds.filter((id) => id && id !== actorId))];

  for (const userId of uniqueIds) {
    await storage.createNotification({
      userId,
      postId: post.id,
      type: "status_change",
      message: `"${postTitle}" moved to ${label}`,
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  setupAuth(app);

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: parsed.error.errors[0].message });
      }

      const existing = await storage.getUserByEmail(parsed.data.email);
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const user = await storage.createUser(parsed.data);

      req.login(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        (err) => {
          if (err) return next(err);
          return res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
          });
        },
      );
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (err: any, user: Express.User | false, info: any) => {
        if (err) return next(err);
        if (!user) {
          return res
            .status(401)
            .json({ message: info?.message || "Invalid credentials" });
        }
        req.login(user, (err) => {
          if (err) return next(err);
          return res.json(user);
        });
      },
    )(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  app.get("/api/brands", requireAuth, async (req, res, next) => {
    try {
      const brands = await storage.getBrandsByUserId(req.user!.id);
      res.json(brands);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/brands", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertBrandSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: parsed.error.errors[0].message });
      }

      const brand = await storage.createBrand(parsed.data);
      await storage.addBrandMember({
        userId: req.user!.id,
        brandId: brand.id,
        role: "manager",
      });

      res.json(brand);
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/brands/:brandId", requireAuth, async (req, res, next) => {
    try {
      const existing = await storage.getBrand(req.params.brandId);
      if (!existing) {
        return res.status(404).json({ message: "Brand not found" });
      }
      const role = await storage.getUserRole(req.user!.id, req.params.brandId);
      if (role !== "manager") {
        return res
          .status(403)
          .json({ message: "Only managers can edit brands" });
      }
      const { name } = req.body;
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ message: "Name is required" });
      }
      const brand = await storage.updateBrand(req.params.brandId, {
        name: name.trim(),
      });
      res.json(brand);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/brands/:brandId", requireAuth, async (req, res, next) => {
    try {
      const existing = await storage.getBrand(req.params.brandId);
      if (!existing) {
        return res.status(404).json({ message: "Brand not found" });
      }
      const role = await storage.getUserRole(req.user!.id, req.params.brandId);
      if (role !== "manager") {
        return res
          .status(403)
          .json({ message: "Only managers can delete brands" });
      }
      await storage.deleteBrand(req.params.brandId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  app.get(
    "/api/brands/:brandId/members",
    requireAuth,
    async (req, res, next) => {
      try {
        const role = await storage.getUserRole(
          req.user!.id,
          req.params.brandId,
        );
        if (!role) {
          return res
            .status(403)
            .json({ message: "Not a member of this brand" });
        }

        const members = await storage.getBrandMembers(req.params.brandId);
        res.json(members);
      } catch (err) {
        next(err);
      }
    },
  );

  app.post(
    "/api/brands/:brandId/members",
    requireAuth,
    async (req, res, next) => {
      try {
        const role = await storage.getUserRole(
          req.user!.id,
          req.params.brandId,
        );
        if (role !== "manager") {
          return res
            .status(403)
            .json({ message: "Only managers can add members" });
        }

        const { email, memberRole } = req.body;
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const member = await storage.addBrandMember({
          userId: user.id,
          brandId: req.params.brandId,
          role: memberRole || "copywriter",
        });

        res.json(member);
      } catch (err) {
        next(err);
      }
    },
  );

  app.delete(
    "/api/brands/:brandId/members/:userId",
    requireAuth,
    async (req, res, next) => {
      try {
        const role = await storage.getUserRole(
          req.user!.id,
          req.params.brandId,
        );
        if (role !== "manager") {
          return res
            .status(403)
            .json({ message: "Only managers can remove members" });
        }
        if (req.params.userId === req.user!.id) {
          return res
            .status(400)
            .json({ message: "Cannot remove yourself from the brand" });
        }
        await storage.removeBrandMember(req.params.brandId, req.params.userId);
        res.json({ success: true });
      } catch (err) {
        next(err);
      }
    },
  );

  app.get("/api/posts/all", requireAuth, async (req, res, next) => {
    try {
      const allPosts = await storage.getAllPostsForUser(req.user!.id);
      res.json(allPosts);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/posts/assigned", requireAuth, async (req, res, next) => {
    try {
      const userBrands = await storage.getBrandsByUserId(req.user!.id);
      const brandIds = userBrands.map((b) => b.id);
      const assigned = await storage.getPostsAssignedToUserWithBrand(
        req.user!.id,
        brandIds,
      );
      res.json(assigned);
    } catch (err) {
      next(err);
    }
  });

  app.get(
    "/api/brands/:brandId/posts",
    requireAuth,
    async (req, res, next) => {
      try {
        const role = await storage.getUserRole(
          req.user!.id,
          req.params.brandId,
        );
        if (!role) {
          return res
            .status(403)
            .json({ message: "Not a member of this brand" });
        }

        const brandPosts = await storage.getPostsByBrand(req.params.brandId);
        res.json(brandPosts);
      } catch (err) {
        next(err);
      }
    },
  );

  app.post(
    "/api/brands/:brandId/posts",
    requireAuth,
    async (req, res, next) => {
      try {
        const role = await storage.getUserRole(
          req.user!.id,
          req.params.brandId,
        );
        if (!role) {
          return res
            .status(403)
            .json({ message: "Not a member of this brand" });
        }

        const parsed = insertPostSchema.safeParse({
          ...req.body,
          brandId: req.params.brandId,
        });
        if (!parsed.success) {
          return res
            .status(400)
            .json({ message: parsed.error.errors[0].message });
        }

        const post = await storage.createPost({
          brandId: req.params.brandId,
          title: parsed.data.title,
          copyAssigneeId: parsed.data.copyAssigneeId,
          creativesAssigneeId: parsed.data.creativesAssigneeId,
          approverId: parsed.data.approverId,
          scheduledDate: parsed.data.scheduledDate
            ? new Date(parsed.data.scheduledDate)
            : null,
        });

        if (parsed.data.masterContent) {
          await storage.upsertPostContent({
            postId: post.id,
            platform: "master",
            body: parsed.data.masterContent,
          });
        } else {
          await storage.upsertPostContent({
            postId: post.id,
            platform: "master",
            body: "",
          });
        }

        if (parsed.data.platforms && parsed.data.platforms.length > 0) {
          for (const platform of parsed.data.platforms) {
            if (platform !== "master") {
              await storage.upsertPostContent({
                postId: post.id,
                platform,
                body: parsed.data.masterContent || "",
              });
            }
          }
        }

        if (parsed.data.notes) {
          await storage.createComment({
            postId: post.id,
            authorName: req.user!.name,
            authorId: req.user!.id,
            body: parsed.data.notes,
          });
        }

        res.json(post);
      } catch (err) {
        next(err);
      }
    },
  );

  app.get("/api/posts/:postId", requireAuth, async (req, res, next) => {
    try {
      const post = await storage.getPost(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const role = await storage.getUserRole(req.user!.id, post.brandId);
      if (!role) {
        return res
          .status(403)
          .json({ message: "Not a member of this brand" });
      }

      const contents = await storage.getPostContents(post.id);
      const postComments = await storage.getComments(post.id);

      res.json({ ...post, contents, comments: postComments });
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/posts/:postId", requireAuth, async (req, res, next) => {
    try {
      const post = await storage.getPost(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const role = await storage.getUserRole(req.user!.id, post.brandId);
      if (!role) {
        return res
          .status(403)
          .json({ message: "Not a member of this brand" });
      }

      const parsed = updatePostSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ message: parsed.error.errors[0].message });
      }

      if (parsed.data.status && parsed.data.status !== post.status) {
        const newStatus = parsed.data.status;
        const transition = STATUS_TRANSITIONS[post.status];
        if (!transition || !transition.to.includes(newStatus)) {
          return res.status(400).json({
            message: `Cannot transition from "${STATUS_LABELS[post.status]}" to "${STATUS_LABELS[newStatus]}"`,
          });
        }
        if (!transition.allowedRoles.includes(role)) {
          return res.status(403).json({
            message: `Your role (${role}) cannot make this status change`,
          });
        }
      }

      const updateData: any = { ...parsed.data };
      if (parsed.data.scheduledDate) {
        updateData.scheduledDate = new Date(parsed.data.scheduledDate);
      }

      const updated = await storage.updatePost(req.params.postId, updateData);

      if (parsed.data.status && parsed.data.status !== post.status) {
        await createWorkflowNotifications(
          post,
          parsed.data.status,
          req.user!.id,
          updated.title,
        );
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/posts/:postId", requireAuth, async (req, res, next) => {
    try {
      const post = await storage.getPost(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const role = await storage.getUserRole(req.user!.id, post.brandId);
      if (role !== "manager") {
        return res
          .status(403)
          .json({ message: "Only managers can delete posts" });
      }

      await storage.deletePost(req.params.postId);
      res.json({ message: "Post deleted" });
    } catch (err) {
      next(err);
    }
  });

  app.put(
    "/api/posts/:postId/content",
    requireAuth,
    async (req, res, next) => {
      try {
        const post = await storage.getPost(req.params.postId);
        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }

        const role = await storage.getUserRole(req.user!.id, post.brandId);
        if (!role) {
          return res
            .status(403)
            .json({ message: "Not a member of this brand" });
        }

        const parsed = insertPostContentSchema.safeParse({
          ...req.body,
          postId: req.params.postId,
        });
        if (!parsed.success) {
          return res
            .status(400)
            .json({ message: parsed.error.errors[0].message });
        }

        const content = await storage.upsertPostContent({
          postId: req.params.postId,
          platform: parsed.data.platform,
          body: parsed.data.body,
          media: parsed.data.media,
        });
        res.json(content);
      } catch (err) {
        next(err);
      }
    },
  );

  app.post(
    "/api/posts/:postId/comments",
    requireAuth,
    async (req, res, next) => {
      try {
        const post = await storage.getPost(req.params.postId);
        if (!post) {
          return res.status(404).json({ message: "Post not found" });
        }

        const role = await storage.getUserRole(req.user!.id, post.brandId);
        if (!role) {
          return res
            .status(403)
            .json({ message: "Not a member of this brand" });
        }

        const parsed = insertCommentSchema.safeParse({
          ...req.body,
          postId: req.params.postId,
        });
        if (!parsed.success) {
          return res
            .status(400)
            .json({ message: parsed.error.errors[0].message });
        }

        const comment = await storage.createComment({
          postId: req.params.postId,
          authorName: req.user!.name,
          authorId: req.user!.id,
          body: parsed.data.body,
        });
        res.json(comment);
      } catch (err) {
        next(err);
      }
    },
  );

  app.get(
    "/api/brands/:brandId/hashtags",
    requireAuth,
    async (req, res, next) => {
      try {
        const role = await storage.getUserRole(
          req.user!.id,
          req.params.brandId,
        );
        if (!role) {
          return res
            .status(403)
            .json({ message: "Not a member of this brand" });
        }

        const brandHashtags = await storage.getHashtags(req.params.brandId);
        res.json(brandHashtags);
      } catch (err) {
        next(err);
      }
    },
  );

  app.post(
    "/api/brands/:brandId/hashtags",
    requireAuth,
    async (req, res, next) => {
      try {
        const role = await storage.getUserRole(
          req.user!.id,
          req.params.brandId,
        );
        if (!role) {
          return res
            .status(403)
            .json({ message: "Not a member of this brand" });
        }

        const parsed = insertHashtagSchema.safeParse({
          ...req.body,
          brandId: req.params.brandId,
        });
        if (!parsed.success) {
          return res
            .status(400)
            .json({ message: parsed.error.errors[0].message });
        }

        const hashtag = await storage.createHashtag({
          brandId: req.params.brandId,
          concept: parsed.data.concept,
          tag: parsed.data.tag,
        });
        res.json(hashtag);
      } catch (err) {
        next(err);
      }
    },
  );

  app.delete(
    "/api/hashtags/:hashtagId",
    requireAuth,
    async (req, res, next) => {
      try {
        const hashtag = await storage.getHashtagById(req.params.hashtagId);
        if (!hashtag) {
          return res.status(404).json({ message: "Hashtag not found" });
        }
        const member = await storage.getBrandMember(
          req.user!.id,
          hashtag.brandId,
        );
        if (!member) {
          return res.status(403).json({ message: "Not a brand member" });
        }
        await storage.deleteHashtag(req.params.hashtagId);
        res.json({ message: "Hashtag deleted" });
      } catch (err) {
        next(err);
      }
    },
  );

  app.get("/api/notifications", requireAuth, async (req, res, next) => {
    try {
      const notifs = await storage.getNotifications(req.user!.id);
      res.json(notifs);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/notifications/count", requireAuth, async (req, res, next) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.user!.id);
      res.json({ count });
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res, next) => {
    try {
      await storage.markNotificationReadForUser(req.params.id, req.user!.id);
      res.json({ message: "Marked as read" });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/notifications/read-all", requireAuth, async (req, res, next) => {
    try {
      await storage.markAllNotificationsRead(req.user!.id);
      res.json({ message: "All marked as read" });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/posts/:postId/share", requireAuth, async (req, res, next) => {
    try {
      const post = await storage.getPost(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      const role = await storage.getUserRole(req.user!.id, post.brandId);
      if (!role) {
        return res.status(403).json({ message: "Not a member of this brand" });
      }
      if (post.shareToken) {
        return res.json({ shareToken: post.shareToken });
      }
      const token = await storage.generateShareToken(post.id);
      res.json({ shareToken: token });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/share/:token", async (req, res, next) => {
    try {
      const post = await storage.getPostByShareToken(req.params.token);
      if (!post) {
        return res.status(404).json({ message: "Shared post not found" });
      }
      const contents = await storage.getPostContents(post.id);
      const allComments = await storage.getComments(post.id);
      const externalComments = allComments.filter((c) => c.isExternal === "true");
      const brand = await storage.getBrand(post.brandId);
      res.json({
        id: post.id,
        title: post.title,
        status: post.status,
        createdAt: post.createdAt,
        brandName: brand?.name || "Unknown",
        contents,
        comments: externalComments,
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/share/:token/comments", async (req, res, next) => {
    try {
      const post = await storage.getPostByShareToken(req.params.token);
      if (!post) {
        return res.status(404).json({ message: "Shared post not found" });
      }
      const { authorName, body } = req.body;
      if (!authorName || !body) {
        return res.status(400).json({ message: "Name and comment are required" });
      }
      const comment = await storage.createComment({
        postId: post.id,
        authorName,
        body,
        isExternal: "true",
      });

      const notifyIds = [
        post.copyAssigneeId,
        post.creativesAssigneeId,
        post.approverId,
      ].filter(Boolean) as string[];
      const uniqueIds = [...new Set(notifyIds)];
      for (const userId of uniqueIds) {
        await storage.createNotification({
          userId,
          postId: post.id,
          type: "external_comment",
          message: `${authorName} left a comment on "${post.title}"`,
        });
      }

      res.json(comment);
    } catch (err) {
      next(err);
    }
  });

  return httpServer;
}
