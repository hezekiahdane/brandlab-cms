# Brandlab Super MVP — User Guide

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Roles and Permissions](#roles-and-permissions)
4. [Navigating the App](#navigating-the-app)
5. [Core Pages](#core-pages)
   - [Dashboard](#dashboard)
   - [Content List](#content-list)
   - [Content Composer](#content-composer)
   - [Calendar](#calendar)
   - [Hashtag Bank](#hashtag-bank)
6. [Content Workflow](#content-workflow)
7. [Public Sharing and External Review](#public-sharing-and-external-review)
8. [Notifications](#notifications)
9. [Cross-Brand Views](#cross-brand-views)
10. [Role-Specific User Flows](#role-specific-user-flows)
    - [Manager / Approver](#manager--approver-flow)
    - [Copywriter](#copywriter-flow)
    - [Creative](#creative-flow)
    - [External Reviewer](#external-reviewer-flow)
11. [Demo Accounts](#demo-accounts)

---

## Overview

Brandlab Super MVP is a multi-tenant social media content management platform. It helps teams collaborate on creating, reviewing, approving, and scheduling social media content across multiple platforms.

**Key concepts:**

- **Brands (Workspaces):** Each brand is an isolated workspace with its own posts, hashtags, team members, and social accounts. A user can belong to multiple brands.
- **Roles:** Every team member has a role within each brand — Manager, Copywriter, or Creative — which determines what actions they can take.
- **Workflow:** Content moves through a strict approval pipeline (Draft → Review → Revision → Scheduling) with role-based gatekeeping at each step.
- **Multi-Platform:** Content can be tailored for up to 8 social media platforms (Facebook, Instagram, TikTok, LinkedIn, Threads, X/Twitter, YouTube) from a single "master" draft.

---

## Getting Started

### 1. Sign In or Register

When you first open the app, you land on the authentication page.

- **Sign In:** Enter your email and password, then click "Sign In."
- **Register:** Switch to the Register tab, provide your name, email, and password, then click "Register."

### 2. Select a Brand Workspace

After signing in, you are taken to the **Brand Selection** page. This shows all the brand workspaces you belong to.

- Click on a brand card to enter that workspace.
- If you're a Manager, you can also **create a new brand** from this page by clicking "Create Brand," entering a name, and confirming.

### 3. Start Working

Once inside a brand workspace, you'll see the sidebar navigation on the left and the main content area on the right. You're ready to create, review, and schedule content.

---

## Roles and Permissions

Each user has a role **per brand** — meaning you could be a Manager in one brand and a Copywriter in another.

| Role | What They Can Do |
|------|-----------------|
| **Manager** | Full access. Create posts, assign team members, approve or reject content at every review stage, generate share links, manage the workflow end-to-end, and schedule posts. |
| **Copywriter** | Write and edit post captions/copy. Submit drafts for review. Revise copy when sent back. Cannot approve content or manage creatives. |
| **Creative** | Upload and manage visual assets (images, videos). Submit creatives for review. Revise creatives when sent back. Cannot approve content or manage copy. |

---

## Navigating the App

The sidebar provides access to all main sections:

### Content Group
| Page | Description |
|------|-------------|
| **Dashboard** | Overview of your workspace — status counts, assigned tasks, quick actions |
| **Content** | List of all posts with search, filters, and view mode toggles |
| **Calendar** | Monthly calendar view of scheduled and unscheduled content |
| **Media Library** | Upload and browse media assets *(placeholder)* |
| **Hashtags** | Manage your brand's hashtag bank organized by concept |

### Manage Group
| Page | Description |
|------|-------------|
| **Team** | View and manage team members *(placeholder)* |
| **Settings** | Brand settings and configuration *(placeholder)* |

### Additional Controls
- **Brand Switcher:** Click the brand name at the top of the sidebar to switch workspaces or return to the brand selection page.
- **Notification Bell:** In the top bar — shows unread notification count and recent activity.
- **Theme Toggle:** Switch between light and dark mode.
- **User Menu:** At the bottom of the sidebar — switch workspace or sign out.

---

## Core Pages

### Dashboard

The Dashboard is your home base when you enter a workspace. It shows:

- **Status Overview Cards:** Live counts of posts in each stage — Draft, In Review, For Creatives, and Scheduled. Click a card to jump to the filtered content list.
- **Assigned to Me:** A list of all posts where you are assigned as Copywriter, Creative, or Approver — across all your brands. Each card shows the post title, status badge, brand name, and your assigned role(s). You can filter by status using the dropdown.
- **Quick Actions:** Shortcut cards for common tasks like creating a new post, viewing the calendar, or managing hashtags.

---

### Content List

The Content List shows all posts in the current brand workspace (or across all brands).

**Features:**
- **Search:** Type in the search box to filter posts by title.
- **Status Filter:** Use the dropdown to show only posts in a specific status (e.g., Draft, Scheduled).
- **View Mode Toggle:**
  - **Brand** (default): Shows posts from the currently selected brand only.
  - **All Brands**: Shows posts from every brand you belong to, with a brand name badge on each card.
- **Post Cards:** Each card displays the post title, current status badge, and (in All Brands mode) the brand name. Click a card to open it in the Content Composer.
- **Delete:** Remove posts you no longer need (available to Managers).

---

### Content Composer

The Content Composer is where content gets created, reviewed, and refined. It is a full-featured editing environment with multiple sections:

#### Platform Selection
At the top, select which social media platforms this post targets. Choose from: Facebook, Instagram, TikTok, LinkedIn, Threads, X/Twitter, and YouTube.

#### Content Editor (Tabs)
- **Master Tab:** Write your base caption/copy here. This serves as the default for all platforms.
- **Platform Tabs:** Each selected platform gets its own tab where you can customize the content. When first selected, a platform automatically inherits the Master content.
- **Character Limits:** Real-time character counting is shown for each platform (e.g., 280 characters for X/Twitter). The counter turns red when you exceed the limit.

#### Quick Insert Hashtags
A row of buttons showing hashtags from your brand's Hashtag Bank. Click any hashtag to instantly append it to the current content editor.

#### Workflow Card
- Displays the post's **current status** with a color-coded badge.
- Shows **"Move to" buttons** for the available next statuses based on the workflow rules and your role.
- Once a post reaches "Scheduled," it displays a lock indicator — no further changes.

#### Share Link (External Review)
- Click "Generate Share Link" to create a unique public URL.
- Copy and send this link to external reviewers (clients, stakeholders) who don't have an account.
- External reviewers can view the post and leave comments through this link.

#### Assignments
Three dropdown fields to assign team members:
- **Copy Assignee:** The person responsible for writing captions and copy.
- **Creatives Assignee:** The person responsible for visual assets.
- **Approver:** Must be a Manager — the person who reviews and approves the content.

#### Live Preview
- A visual preview of how the post will appear, including the brand name and selected platforms.
- Toggle between **Desktop** and **Mobile** preview modes.

#### Internal Notes
- A comments section visible only to team members (never shown to external reviewers).
- Add notes, feedback, or discussion threads about the post.
- Each note shows the author's name, avatar, and timestamp.

---

### Calendar

The Calendar page provides a monthly view of your content schedule.

**Features:**
- **Month Navigation:** Use the left/right arrows to move between months, or click "Today" to return to the current month.
- **Calendar Grid:** A 7-column grid (Sun–Sat) showing the full month. Posts with scheduled dates appear as colored chips on their respective days.
- **Click a Day:** Select any day to expand a detail panel showing all posts scheduled for that date.
- **Click a Post Chip:** Navigate directly to the Content Composer for that post.
- **Unscheduled Posts Panel:** A sidebar listing all posts that don't yet have a scheduled date, so you can easily see what still needs scheduling.
- **View Mode Toggle:** Switch between viewing posts for the current brand only or across all your brands.
- **Status Filter:** Filter the calendar to show only posts in a specific workflow status.
- **Heatmap Overlay:** Toggle on the engagement heatmap to see suggested posting times. Weekdays are highlighted as higher-engagement days, with peak hours at 9–11 AM and 6–8 PM. Weekends show lower engagement.

---

### Hashtag Bank

The Hashtag Bank organizes your brand's hashtags by concept (category).

**Features:**
- **Grouped View:** Hashtags are displayed in groups by concept (e.g., "Beauty," "Lifestyle," "Promo").
- **Add Hashtags:** Enter a concept name and hashtag text, then click Add to save.
- **Copy to Clipboard:** Click the copy icon next to any hashtag to copy it.
- **Delete:** Remove hashtags you no longer need.
- **Quick Insert Integration:** Hashtags from the bank are available for one-click insertion in the Content Composer.

---

## Content Workflow

Every post follows a strict linear workflow. The status can only move forward (or back to revision) through defined transitions. This ensures quality control and proper review at each stage.

### Status Flow Diagram

```
  Draft
    │
    ▼  (Copywriter or Manager submits)
  Copy & Caption for Review
    │
    ├──▶ Copy & Caption Revision  ──▶  (loops back to Copy & Caption for Review)
    │       (Manager sends back)           (Copywriter or Manager resubmits)
    │
    ▼  (Manager approves copy)
  For Creatives
    │
    ▼  (Creative or Manager submits)
  Creatives for Review
    │
    ├──▶ Creatives Revision  ──▶  (loops back to Creatives for Review)
    │       (Manager sends back)      (Creative or Manager resubmits)
    │
    ▼  (Manager approves creatives)
  For Scheduling
    │
    ▼  (Manager schedules)
  Scheduled  ✓ (locked)
```

### Transition Details

| Current Status | Can Move To | Who Can Do It |
|---------------|-------------|---------------|
| Draft | Copy & Caption for Review | Copywriter, Manager |
| Copy & Caption for Review | Copy & Caption Revision | Manager |
| Copy & Caption for Review | For Creatives | Manager |
| Copy & Caption Revision | Copy & Caption for Review | Copywriter, Manager |
| For Creatives | Creatives for Review | Creative, Manager |
| Creatives for Review | Creatives Revision | Manager |
| Creatives for Review | For Scheduling | Manager |
| Creatives Revision | Creatives for Review | Creative, Manager |
| For Scheduling | Scheduled | Manager |
| Scheduled | *(locked — no further transitions)* | — |

**Key rules:**
- Only a **Manager** can approve content (move it forward past review stages).
- **Copywriters** can only submit and resubmit copy.
- **Creatives** can only submit and resubmit creative assets.
- Once a post is **Scheduled**, it is locked and cannot be changed.

---

## Public Sharing and External Review

Brandlab allows you to share posts with people outside your team — clients, stakeholders, or external approvers — without requiring them to create an account.

### How It Works

1. **Generate a Share Link:** In the Content Composer, click "Generate Share Link." A unique URL is created.
2. **Copy and Send:** Copy the link and share it via email, chat, or any other channel.
3. **External Reviewer Opens the Link:** The reviewer sees a read-only view of the post including the content, selected platforms, and current status.
4. **Leave Comments:** The external reviewer enters their name and comment, then submits. No login required.
5. **Team Gets Notified:** When an external comment is submitted, all assigned team members (Copy Assignee, Creatives Assignee, Approver) receive an in-app notification.

### Important Details
- External reviewers **only see** external comments. Internal team notes are hidden from the public view.
- The share link can be regenerated if needed.
- Share links do not expire automatically.

---

## Notifications

The notification bell in the top bar keeps you informed of activity on posts you're involved with.

### What Triggers Notifications
- **External Comments:** When someone leaves a comment via a public share link, all assigned team members are notified.
- **Status Changes:** When a post's status changes (e.g., approved, sent back for revision), relevant team members are notified.

### Using Notifications
- **Unread Count:** The bell icon shows a red badge with the number of unread notifications.
- **View Notifications:** Click the bell to open a popover listing your recent notifications, each showing the message and which post it relates to.
- **Mark as Read:** Click on a notification to mark it as read. The unread count updates automatically.
- **Navigate to Post:** Notifications link to the relevant post so you can take action immediately.

---

## Cross-Brand Views

If you belong to multiple brand workspaces, Brandlab provides views that span all your brands at once.

### All Brands Toggle (Content List)
On the Content List page, switch from "Brand" to "All Brands" to see posts from every workspace you belong to. Each post card shows a brand name badge so you know which workspace it belongs to.

### Master Calendar
On the Calendar page, toggle the view mode to see scheduled content across all your brands in a single calendar view. This gives you a bird's-eye view of your entire content pipeline.

### Assigned to Me (Dashboard)
The Dashboard's "Assigned to Me" section automatically pulls posts from all your brands where you are assigned as Copywriter, Creative, or Approver. Filter by status to focus on what needs your attention.

---

## Role-Specific User Flows

### Manager / Approver Flow

As a Manager, you oversee the entire content lifecycle. Here is a typical workflow:

1. **Create a Post**
   - Go to Content List → click "New Post."
   - Enter a title and select target platforms.
   - Write the master caption or assign it to a Copywriter.

2. **Assign the Team**
   - In the Content Composer, use the assignment dropdowns:
     - Set the **Copy Assignee** (the Copywriter who will write the caption).
     - Set the **Creatives Assignee** (the Creative who will produce visuals).
     - Set yourself or another Manager as the **Approver**.

3. **Review Copy**
   - When the Copywriter submits (moves the post to "Copy & Caption for Review"), you'll see it in your Dashboard or Content List.
   - Open the post and read the content.
   - **Approve:** Click "Move to For Creatives" to pass it to the creative team.
   - **Request Revision:** Click "Move to Copy & Caption Revision" to send it back with notes.

4. **Review Creatives**
   - When the Creative submits (moves the post to "Creatives for Review"), review the visual assets.
   - **Approve:** Click "Move to For Scheduling."
   - **Request Revision:** Click "Move to Creatives Revision" to send it back.

5. **Get External Feedback (Optional)**
   - Generate a share link and send it to your client or stakeholder.
   - They can view the post and leave comments.
   - You'll be notified when they respond.

6. **Schedule the Post**
   - Once everything is approved, click "Move to Scheduled" to finalize.
   - The post is now locked.

7. **Monitor Everything**
   - Use the Dashboard to see status counts and what's assigned to you.
   - Use the Calendar to see the full publishing schedule.
   - Use the "All Brands" toggle to monitor content across all your workspaces.

---

### Copywriter Flow

As a Copywriter, your focus is writing and refining post captions and copy.

1. **Check Your Assignments**
   - Go to the Dashboard → "Assigned to Me" section to see posts where you're the Copy Assignee.
   - Or browse the Content List and look for posts in "Draft" or "Copy & Caption Revision" status.

2. **Write the Copy**
   - Open the post in the Content Composer.
   - Write the master caption in the Master tab.
   - Customize content for specific platforms using the platform tabs.
   - Use Quick Insert Hashtags to add relevant hashtags from the brand's bank.
   - Watch the character counter to stay within platform limits.

3. **Submit for Review**
   - When you're satisfied with the copy, click "Move to Copy & Caption for Review."
   - The Manager/Approver will be notified.

4. **Handle Revisions**
   - If the Manager sends the post back to "Copy & Caption Revision," you'll see it in your assignments.
   - Check the Internal Notes for feedback from the reviewer.
   - Make the requested changes.
   - Resubmit by clicking "Move to Copy & Caption for Review."

5. **Done**
   - Once your copy is approved and moved to "For Creatives," your part is complete (unless changes are needed later).

---

### Creative Flow

As a Creative, your focus is producing visual assets for posts.

1. **Check Your Assignments**
   - Go to the Dashboard → "Assigned to Me" section to see posts where you're the Creatives Assignee.
   - Or browse the Content List and look for posts in "For Creatives" or "Creatives Revision" status.

2. **Review the Brief**
   - Open the post in the Content Composer.
   - Read the approved copy in the Master/platform tabs to understand the content direction.
   - Check Internal Notes for any creative direction from the Manager.

3. **Upload Creatives**
   - Add your visual assets (images, videos, graphics) to the post.
   - Ensure assets are appropriate for the selected platforms.

4. **Submit for Review**
   - When your creatives are ready, click "Move to Creatives for Review."
   - The Manager/Approver will be notified.

5. **Handle Revisions**
   - If the Manager sends the post back to "Creatives Revision," check the Internal Notes for feedback.
   - Make the requested changes.
   - Resubmit by clicking "Move to Creatives for Review."

6. **Done**
   - Once your creatives are approved and the post moves to "For Scheduling," your part is complete.

---

### External Reviewer Flow

External reviewers are people outside the team (clients, stakeholders) who review content without needing an account.

1. **Receive a Share Link**
   - You'll receive a URL from the team (via email, chat, etc.).

2. **Open the Link**
   - Click the link to open the post in your browser. No login required.
   - You'll see:
     - The post title and current status.
     - The content/caption.
     - The selected platforms.
     - Any previous external comments (you won't see internal team notes).

3. **Leave a Comment**
   - Enter your name in the "Your Name" field.
   - Type your feedback or comment in the text area.
   - Click "Submit Comment."

4. **Team Gets Notified**
   - Your comment is saved and immediately visible on the post.
   - All assigned team members receive an in-app notification about your feedback.
   - The team can respond internally and make changes based on your input.

---

## Demo Accounts

Use these accounts to explore the app from different perspectives:

| Email | Password | Role | Brands |
|-------|----------|------|--------|
| kim@brandlab.io | password123 | Manager | All 3 brands (Luxe Beauty Co, TechVibe Digital, GreenLeaf Wellness) |
| alex@brandlab.io | password123 | Copywriter | 2 brands (Luxe Beauty Co, TechVibe Digital) |
| sam@brandlab.io | password123 | Creative | 2 brands (Luxe Beauty Co, TechVibe Digital) |

**Recommended testing approach:**
1. Sign in as **Kim (Manager)** to see the full workflow, all brands, and approval capabilities.
2. Sign in as **Alex (Copywriter)** to experience the copy writing and submission flow.
3. Sign in as **Sam (Creative)** to experience the creative upload and submission flow.
4. Generate a **share link** as Kim, then open it in an incognito/private window to experience the external reviewer flow.
