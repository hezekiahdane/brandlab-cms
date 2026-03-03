import { db } from "./db";
import {
  users,
  brands,
  brandMembers,
  posts,
  postContents,
  comments,
  hashtags,
  notifications,
  type User,
  type InsertUser,
  type Brand,
  type InsertBrand,
  type BrandMember,
  type InsertBrandMember,
  type Post,
  type PostContent,
  type Comment,
  type Hashtag,
  type Notification,
} from "@shared/schema";
import { eq, and, desc, inArray, or } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getBrand(id: string): Promise<Brand | undefined>;
  getBrandsByUserId(userId: string): Promise<(Brand & { role: string })[]>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: string, data: Partial<InsertBrand>): Promise<Brand>;
  deleteBrand(id: string): Promise<void>;
  addBrandMember(member: InsertBrandMember): Promise<BrandMember>;
  removeBrandMember(brandId: string, userId: string): Promise<void>;
  getBrandMembers(brandId: string): Promise<(BrandMember & { user: User })[]>;
  getUserRole(userId: string, brandId: string): Promise<string | undefined>;
  createPost(data: {
    brandId: string;
    title: string;
    copyAssigneeId?: string | null;
    creativesAssigneeId?: string | null;
    approverId?: string | null;
    scheduledDate?: Date | null;
  }): Promise<Post>;
  getPost(id: string): Promise<Post | undefined>;
  getPostsByBrand(brandId: string): Promise<Post[]>;
  getPostsAssignedToUser(userId: string, brandIds: string[]): Promise<Post[]>;
  getAllPostsForUser(userId: string): Promise<(Post & { brandName: string })[]>;
  getPostsAssignedToUserWithBrand(userId: string, brandIds: string[]): Promise<(Post & { brandName: string })[]>;
  updatePost(id: string, data: Partial<Post>): Promise<Post>;
  deletePost(id: string): Promise<void>;
  getPostContents(postId: string): Promise<PostContent[]>;
  upsertPostContent(data: {
    postId: string;
    platform: string;
    body?: string;
    media?: any;
  }): Promise<PostContent>;
  deletePostContent(id: string): Promise<void>;
  getComments(postId: string): Promise<Comment[]>;
  createComment(data: {
    postId: string;
    authorName: string;
    authorId?: string | null;
    body: string;
    isExternal?: string;
  }): Promise<Comment>;
  getHashtags(brandId: string): Promise<Hashtag[]>;
  getHashtagById(id: string): Promise<Hashtag | undefined>;
  createHashtag(data: {
    brandId: string;
    concept?: string | null;
    tag: string;
  }): Promise<Hashtag>;
  deleteHashtag(id: string): Promise<void>;
  getBrandMember(userId: string, brandId: string): Promise<BrandMember | undefined>;
  getPostByShareToken(token: string): Promise<Post | undefined>;
  generateShareToken(postId: string): Promise<string>;
  createNotification(data: {
    userId: string;
    postId?: string | null;
    type: string;
    message: string;
  }): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  markNotificationReadForUser(id: string, userId: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }

  async getBrandsByUserId(
    userId: string,
  ): Promise<(Brand & { role: string })[]> {
    const results = await db
      .select({
        id: brands.id,
        name: brands.name,
        logoUrl: brands.logoUrl,
        settings: brands.settings,
        createdAt: brands.createdAt,
        role: brandMembers.role,
      })
      .from(brandMembers)
      .innerJoin(brands, eq(brandMembers.brandId, brands.id))
      .where(eq(brandMembers.userId, userId));
    return results as (Brand & { role: string })[];
  }

  async createBrand(insertBrand: InsertBrand): Promise<Brand> {
    const [brand] = await db.insert(brands).values(insertBrand).returning();
    return brand;
  }

  async updateBrand(id: string, data: Partial<InsertBrand>): Promise<Brand> {
    const [brand] = await db
      .update(brands)
      .set(data)
      .where(eq(brands.id, id))
      .returning();
    return brand;
  }

  async deleteBrand(id: string): Promise<void> {
    await db.delete(postContents).where(
      inArray(
        postContents.postId,
        db.select({ id: posts.id }).from(posts).where(eq(posts.brandId, id)),
      ),
    );
    await db.delete(comments).where(
      inArray(
        comments.postId,
        db.select({ id: posts.id }).from(posts).where(eq(posts.brandId, id)),
      ),
    );
    await db.delete(notifications).where(
      inArray(
        notifications.postId,
        db.select({ id: posts.id }).from(posts).where(eq(posts.brandId, id)),
      ),
    );
    await db.delete(posts).where(eq(posts.brandId, id));
    await db.delete(hashtags).where(eq(hashtags.brandId, id));
    await db.delete(brandMembers).where(eq(brandMembers.brandId, id));
    await db.delete(brands).where(eq(brands.id, id));
  }

  async addBrandMember(member: InsertBrandMember): Promise<BrandMember> {
    const [brandMember] = await db
      .insert(brandMembers)
      .values(member)
      .returning();
    return brandMember;
  }

  async removeBrandMember(brandId: string, userId: string): Promise<void> {
    await db
      .delete(brandMembers)
      .where(
        and(eq(brandMembers.brandId, brandId), eq(brandMembers.userId, userId)),
      );
  }

  async getBrandMembers(
    brandId: string,
  ): Promise<(BrandMember & { user: User })[]> {
    const results = await db
      .select({
        id: brandMembers.id,
        userId: brandMembers.userId,
        brandId: brandMembers.brandId,
        role: brandMembers.role,
        user: users,
      })
      .from(brandMembers)
      .innerJoin(users, eq(brandMembers.userId, users.id))
      .where(eq(brandMembers.brandId, brandId));
    return results as (BrandMember & { user: User })[];
  }

  async getUserRole(
    userId: string,
    brandId: string,
  ): Promise<string | undefined> {
    const [member] = await db
      .select()
      .from(brandMembers)
      .where(
        and(
          eq(brandMembers.userId, userId),
          eq(brandMembers.brandId, brandId),
        ),
      );
    return member?.role;
  }

  async createPost(data: {
    brandId: string;
    title: string;
    copyAssigneeId?: string | null;
    creativesAssigneeId?: string | null;
    approverId?: string | null;
    scheduledDate?: Date | null;
  }): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values({
        brandId: data.brandId,
        title: data.title,
        copyAssigneeId: data.copyAssigneeId || null,
        creativesAssigneeId: data.creativesAssigneeId || null,
        approverId: data.approverId || null,
        scheduledDate: data.scheduledDate || null,
      })
      .returning();
    return post;
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async getPostsByBrand(brandId: string): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(eq(posts.brandId, brandId))
      .orderBy(desc(posts.createdAt));
  }

  async getPostsAssignedToUser(
    userId: string,
    brandIds: string[],
  ): Promise<Post[]> {
    if (brandIds.length === 0) return [];
    return db
      .select()
      .from(posts)
      .where(
        and(
          inArray(posts.brandId, brandIds),
          or(
            eq(posts.copyAssigneeId, userId),
            eq(posts.creativesAssigneeId, userId),
            eq(posts.approverId, userId),
          ),
        ),
      )
      .orderBy(desc(posts.createdAt));
  }

  async getAllPostsForUser(userId: string): Promise<(Post & { brandName: string })[]> {
    const userBrands = await this.getBrandsByUserId(userId);
    if (userBrands.length === 0) return [];
    const brandIds = userBrands.map((b) => b.id);
    const brandMap = new Map(userBrands.map((b) => [b.id, b.name]));
    const result = await db
      .select()
      .from(posts)
      .where(inArray(posts.brandId, brandIds))
      .orderBy(desc(posts.createdAt));
    return result.map((p) => ({ ...p, brandName: brandMap.get(p.brandId) || "Unknown" }));
  }

  async getPostsAssignedToUserWithBrand(
    userId: string,
    brandIds: string[],
  ): Promise<(Post & { brandName: string })[]> {
    if (brandIds.length === 0) return [];
    const brandsData = await Promise.all(brandIds.map((id) => this.getBrand(id)));
    const brandMap = new Map(brandsData.filter(Boolean).map((b) => [b!.id, b!.name]));
    const result = await db
      .select()
      .from(posts)
      .where(
        and(
          inArray(posts.brandId, brandIds),
          or(
            eq(posts.copyAssigneeId, userId),
            eq(posts.creativesAssigneeId, userId),
            eq(posts.approverId, userId),
          ),
        ),
      )
      .orderBy(desc(posts.createdAt));
    return result.map((p) => ({ ...p, brandName: brandMap.get(p.brandId) || "Unknown" }));
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post> {
    const [post] = await db
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return post;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(postContents).where(eq(postContents.postId, id));
    await db.delete(comments).where(eq(comments.postId, id));
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getPostContents(postId: string): Promise<PostContent[]> {
    return db
      .select()
      .from(postContents)
      .where(eq(postContents.postId, postId));
  }

  async upsertPostContent(data: {
    postId: string;
    platform: string;
    body?: string;
    media?: any;
  }): Promise<PostContent> {
    const existing = await db
      .select()
      .from(postContents)
      .where(
        and(
          eq(postContents.postId, data.postId),
          eq(postContents.platform, data.platform as any),
        ),
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(postContents)
        .set({
          body: data.body ?? existing[0].body,
          media: data.media ?? existing[0].media,
        })
        .where(eq(postContents.id, existing[0].id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(postContents)
      .values({
        postId: data.postId,
        platform: data.platform as any,
        body: data.body || "",
        media: data.media || [],
      })
      .returning();
    return created;
  }

  async deletePostContent(id: string): Promise<void> {
    await db.delete(postContents).where(eq(postContents.id, id));
  }

  async getComments(postId: string): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(data: {
    postId: string;
    authorName: string;
    authorId?: string | null;
    body: string;
    isExternal?: string;
  }): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({
        postId: data.postId,
        authorName: data.authorName,
        authorId: data.authorId || null,
        body: data.body,
        isExternal: data.isExternal || "false",
      })
      .returning();
    return comment;
  }

  async getHashtagById(id: string): Promise<Hashtag | undefined> {
    const [hashtag] = await db
      .select()
      .from(hashtags)
      .where(eq(hashtags.id, id))
      .limit(1);
    return hashtag;
  }

  async getHashtags(brandId: string): Promise<Hashtag[]> {
    return db
      .select()
      .from(hashtags)
      .where(eq(hashtags.brandId, brandId))
      .orderBy(desc(hashtags.createdAt));
  }

  async createHashtag(data: {
    brandId: string;
    concept?: string | null;
    tag: string;
  }): Promise<Hashtag> {
    const normalizedTag = data.tag.startsWith("#")
      ? data.tag
      : `#${data.tag}`;
    const [hashtag] = await db
      .insert(hashtags)
      .values({
        brandId: data.brandId,
        concept: data.concept || null,
        tag: normalizedTag,
      })
      .returning();
    return hashtag;
  }

  async deleteHashtag(id: string): Promise<void> {
    await db.delete(hashtags).where(eq(hashtags.id, id));
  }

  async getBrandMember(userId: string, brandId: string): Promise<BrandMember | undefined> {
    const [member] = await db
      .select()
      .from(brandMembers)
      .where(and(eq(brandMembers.userId, userId), eq(brandMembers.brandId, brandId)))
      .limit(1);
    return member;
  }

  async getPostByShareToken(token: string): Promise<Post | undefined> {
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.shareToken, token))
      .limit(1);
    return post;
  }

  async generateShareToken(postId: string): Promise<string> {
    const { randomBytes } = await import("crypto");
    const token = randomBytes(32).toString("hex");
    await db.update(posts).set({ shareToken: token }).where(eq(posts.id, postId));
    return token;
  }

  async createNotification(data: {
    userId: string;
    postId?: string | null;
    type: string;
    message: string;
  }): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: data.userId,
        postId: data.postId || null,
        type: data.type,
        message: data.message,
      })
      .returning();
    return notification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications).set({ read: "true" }).where(eq(notifications.id, id));
  }

  async markNotificationReadForUser(id: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: "true" })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: "true" })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, "false")));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, "false")));
    return result.length;
  }
}

export const storage = new DatabaseStorage();
