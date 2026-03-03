import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  pgEnum,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const memberRoleEnum = pgEnum("member_role", [
  "manager",
  "copywriter",
  "creative",
]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "copy_review",
  "copy_revision",
  "for_creatives",
  "creatives_review",
  "creatives_revision",
  "for_scheduling",
  "scheduled",
]);

export const platformEnum = pgEnum("platform", [
  "master",
  "facebook",
  "instagram",
  "tiktok",
  "linkedin",
  "threads",
  "x",
  "youtube",
]);

export const mediaSourceEnum = pgEnum("media_source", [
  "upload",
  "google_drive",
  "canva",
]);

export const users = pgTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brands = pgTable("brands", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brandMembers = pgTable("brand_members", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  brandId: varchar("brand_id", { length: 36 })
    .notNull()
    .references(() => brands.id),
  role: memberRoleEnum("role").notNull().default("copywriter"),
});

export const socialAccounts = pgTable("social_accounts", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id", { length: 36 })
    .notNull()
    .references(() => brands.id),
  platform: platformEnum("platform").notNull(),
  accountName: text("account_name"),
  token: text("token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id", { length: 36 })
    .notNull()
    .references(() => brands.id),
  title: text("title").notNull(),
  status: postStatusEnum("status").notNull().default("draft"),
  copyAssigneeId: varchar("copy_assignee_id", { length: 36 }).references(
    () => users.id,
  ),
  creativesAssigneeId: varchar("creatives_assignee_id", {
    length: 36,
  }).references(() => users.id),
  approverId: varchar("approver_id", { length: 36 }).references(
    () => users.id,
  ),
  shareToken: varchar("share_token", { length: 64 }).unique(),
  scheduledDate: timestamp("scheduled_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  postId: varchar("post_id", { length: 36 }).references(() => posts.id),
  type: text("type").notNull(),
  message: text("message").notNull(),
  read: text("read").default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postContents = pgTable("post_contents", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  postId: varchar("post_id", { length: 36 })
    .notNull()
    .references(() => posts.id),
  platform: platformEnum("platform").notNull().default("master"),
  body: text("body").default(""),
  media: jsonb("media").default([]),
});

export const mediaAssets = pgTable("media_assets", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id", { length: 36 })
    .notNull()
    .references(() => brands.id),
  source: mediaSourceEnum("source").notNull().default("upload"),
  url: text("url").notNull(),
  fileName: text("file_name"),
  mimeType: text("mime_type"),
  size: integer("size"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  postId: varchar("post_id", { length: 36 })
    .notNull()
    .references(() => posts.id),
  authorName: text("author_name").notNull(),
  authorId: varchar("author_id", { length: 36 }).references(() => users.id),
  body: text("body").notNull(),
  isExternal: text("is_external").default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hashtags = pgTable("hashtags", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id", { length: 36 })
    .notNull()
    .references(() => brands.id),
  concept: text("concept"),
  tag: text("tag").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  password: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertBrandSchema = createInsertSchema(brands).pick({
  name: true,
  logoUrl: true,
});

export const insertBrandMemberSchema = createInsertSchema(brandMembers).pick({
  userId: true,
  brandId: true,
  role: true,
});

export const insertPostSchema = z.object({
  brandId: z.string(),
  title: z.string().min(1, "Title is required"),
  copyAssigneeId: z.string().nullable().optional(),
  creativesAssigneeId: z.string().nullable().optional(),
  approverId: z.string().nullable().optional(),
  scheduledDate: z.string().nullable().optional(),
  platforms: z.array(z.string()).optional(),
  masterContent: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum([
    "draft",
    "copy_review",
    "copy_revision",
    "for_creatives",
    "creatives_review",
    "creatives_revision",
    "for_scheduling",
    "scheduled",
  ]).optional(),
  copyAssigneeId: z.string().nullable().optional(),
  creativesAssigneeId: z.string().nullable().optional(),
  approverId: z.string().nullable().optional(),
  scheduledDate: z.string().nullable().optional(),
});

export const insertPostContentSchema = z.object({
  postId: z.string(),
  platform: z.enum([
    "master",
    "facebook",
    "instagram",
    "tiktok",
    "linkedin",
    "threads",
    "x",
    "youtube",
  ]),
  body: z.string().optional(),
  media: z.any().optional(),
});

export const insertCommentSchema = z.object({
  postId: z.string(),
  body: z.string().min(1, "Comment cannot be empty"),
  authorName: z.string().optional(),
  isExternal: z.string().optional(),
});

export const insertHashtagSchema = z.object({
  brandId: z.string(),
  concept: z.string().nullable().optional(),
  tag: z.string().min(1, "Tag is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type BrandMember = typeof brandMembers.$inferSelect;
export type InsertBrandMember = z.infer<typeof insertBrandMemberSchema>;
export type SocialAccount = typeof socialAccounts.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type PostContent = typeof postContents.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Hashtag = typeof hashtags.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
export type InsertPostContent = z.infer<typeof insertPostContentSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertHashtag = z.infer<typeof insertHashtagSchema>;

export const STATUS_TRANSITIONS: Record<string, { to: string[]; allowedRoles: string[] }> = {
  draft: { to: ["copy_review"], allowedRoles: ["copywriter", "manager"] },
  copy_review: { to: ["copy_revision", "for_creatives"], allowedRoles: ["manager"] },
  copy_revision: { to: ["copy_review"], allowedRoles: ["copywriter", "manager"] },
  for_creatives: { to: ["creatives_review"], allowedRoles: ["creative", "manager"] },
  creatives_review: { to: ["creatives_revision", "for_scheduling"], allowedRoles: ["manager"] },
  creatives_revision: { to: ["creatives_review"], allowedRoles: ["creative", "manager"] },
  for_scheduling: { to: ["scheduled"], allowedRoles: ["manager"] },
  scheduled: { to: [], allowedRoles: [] },
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  copy_review: "Copy & Caption for Review",
  copy_revision: "Copy & Caption Revision",
  for_creatives: "For Creatives",
  creatives_review: "Creatives for Review",
  creatives_revision: "Creatives Revision",
  for_scheduling: "For Scheduling",
  scheduled: "Scheduled",
};
