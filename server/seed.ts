import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";

export async function seedDatabase() {
  const existingUsers = await db.select().from(users).limit(1);

  if (existingUsers.length > 0) {
    return;
  }

  console.log("Seeding database...");

  const admin = await storage.createUser({
    email: "kim@brandlab.io",
    name: "Kim Montejo",
    password: "password123",
  });

  const copywriter = await storage.createUser({
    email: "alex@brandlab.io",
    name: "Alex Rivera",
    password: "password123",
  });

  const creative = await storage.createUser({
    email: "sam@brandlab.io",
    name: "Sam Chen",
    password: "password123",
  });

  const brand1 = await storage.createBrand({ name: "Luxe Beauty Co" });
  const brand2 = await storage.createBrand({ name: "TechVibe Digital" });
  const brand3 = await storage.createBrand({ name: "GreenLeaf Organics" });

  await storage.addBrandMember({ userId: admin.id, brandId: brand1.id, role: "manager" });
  await storage.addBrandMember({ userId: copywriter.id, brandId: brand1.id, role: "copywriter" });
  await storage.addBrandMember({ userId: creative.id, brandId: brand1.id, role: "creative" });
  await storage.addBrandMember({ userId: admin.id, brandId: brand2.id, role: "manager" });
  await storage.addBrandMember({ userId: copywriter.id, brandId: brand2.id, role: "copywriter" });
  await storage.addBrandMember({ userId: admin.id, brandId: brand3.id, role: "manager" });
  await storage.addBrandMember({ userId: creative.id, brandId: brand3.id, role: "creative" });

  const post1 = await storage.createPost({
    brandId: brand1.id,
    title: "Summer Glow Collection Launch",
    copyAssigneeId: copywriter.id,
    creativesAssigneeId: creative.id,
    approverId: admin.id,
  });
  await storage.upsertPostContent({
    postId: post1.id,
    platform: "master",
    body: "Introducing our Summer Glow Collection! Get ready to shine with our new range of illuminating products. Limited edition available now.\n\n#SummerGlow #LuxeBeauty #NewCollection",
  });
  await storage.upsertPostContent({
    postId: post1.id,
    platform: "instagram",
    body: "Introducing our Summer Glow Collection! Get ready to shine with our new range of illuminating products. Limited edition available now.\n\nShop the link in bio\n\n#SummerGlow #LuxeBeauty #NewCollection #BeautyLaunch #SkincareRoutine",
  });
  await storage.createComment({
    postId: post1.id,
    authorName: "Kim Montejo",
    authorId: admin.id,
    body: "Make sure to highlight the limited edition aspect prominently",
  });

  const post2 = await storage.createPost({
    brandId: brand1.id,
    title: "Skincare Tips: Morning Routine",
    copyAssigneeId: copywriter.id,
    approverId: admin.id,
  });
  await storage.upsertPostContent({
    postId: post2.id,
    platform: "master",
    body: "Your morning skincare routine matters! Here are 5 steps to start your day with glowing skin:\n\n1. Gentle cleanser\n2. Toner\n3. Serum\n4. Moisturizer\n5. SPF 50+\n\nWhat's your go-to morning product?",
  });
  await storage.updatePost(post2.id, { status: "copy_review" });

  const post3 = await storage.createPost({
    brandId: brand2.id,
    title: "AI Product Update Announcement",
    copyAssigneeId: copywriter.id,
    approverId: admin.id,
  });
  await storage.upsertPostContent({
    postId: post3.id,
    platform: "master",
    body: "We're excited to announce our latest AI-powered features! Smarter automation, better insights, and seamless integration with your existing workflow.\n\nLearn more at techvibe.io/updates",
  });
  await storage.upsertPostContent({
    postId: post3.id,
    platform: "linkedin",
    body: "We're excited to announce our latest AI-powered features!\n\nWhat's new:\n- Smarter automation that learns your preferences\n- Real-time analytics dashboard\n- One-click integration with 50+ tools\n\nDiscover how TechVibe Digital is revolutionizing workflow management.\n\nLearn more: techvibe.io/updates\n\n#AI #Automation #TechInnovation #ProductUpdate",
  });

  const post4 = await storage.createPost({
    brandId: brand1.id,
    title: "Customer Spotlight: Maria's Story",
    copyAssigneeId: copywriter.id,
    creativesAssigneeId: creative.id,
    approverId: admin.id,
  });
  await storage.upsertPostContent({
    postId: post4.id,
    platform: "master",
    body: "Meet Maria, one of our amazing customers who transformed her skincare journey with Luxe Beauty Co. Read her full story on our blog!",
  });
  await storage.updatePost(post4.id, { status: "for_creatives" });

  await storage.createHashtag({ brandId: brand1.id, concept: "Brand", tag: "#LuxeBeauty" });
  await storage.createHashtag({ brandId: brand1.id, concept: "Brand", tag: "#LuxeBeautyCo" });
  await storage.createHashtag({ brandId: brand1.id, concept: "Product", tag: "#SummerGlow" });
  await storage.createHashtag({ brandId: brand1.id, concept: "Product", tag: "#SkincareEssentials" });
  await storage.createHashtag({ brandId: brand1.id, concept: "General", tag: "#BeautyTips" });
  await storage.createHashtag({ brandId: brand1.id, concept: "General", tag: "#SkincareCommunity" });
  await storage.createHashtag({ brandId: brand1.id, concept: "General", tag: "#GlowUp" });
  await storage.createHashtag({ brandId: brand1.id, concept: "Campaign", tag: "#LuxeSummerVibes" });

  await storage.createHashtag({ brandId: brand2.id, concept: "Brand", tag: "#TechVibe" });
  await storage.createHashtag({ brandId: brand2.id, concept: "Brand", tag: "#TechVibeDigital" });
  await storage.createHashtag({ brandId: brand2.id, concept: "Product", tag: "#AIAutomation" });
  await storage.createHashtag({ brandId: brand2.id, concept: "Product", tag: "#SmartWorkflow" });
  await storage.createHashtag({ brandId: brand2.id, concept: "General", tag: "#TechInnovation" });

  await storage.createHashtag({ brandId: brand3.id, concept: "Brand", tag: "#GreenLeaf" });
  await storage.createHashtag({ brandId: brand3.id, concept: "Product", tag: "#OrganicLiving" });
  await storage.createHashtag({ brandId: brand3.id, concept: "General", tag: "#SustainableLiving" });

  console.log("Database seeded successfully!");
  console.log("Demo accounts:");
  console.log("  kim@brandlab.io / password123 (Manager)");
  console.log("  alex@brandlab.io / password123 (Copywriter)");
  console.log("  sam@brandlab.io / password123 (Creative)");
}
