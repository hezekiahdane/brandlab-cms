## Product Requirements Document (PRD)

**Project:** Content Management Platform (Brandlab Super MVP)

**Phase:** 1 – Content Management, Workflow & Scheduling

**Prepared For:** Executive Review & Marketing Team (Kim Montejo)

**Prepared By:** Zeke Menoso (Development)

### 1. Executive Summary

The goal of this project is to build a bespoke, multi-tenant content management platform that streamlines the social media workflow for our marketing team. Operating as the "Brandlab Super MVP", this platform will support multiple brand workspaces, allow multi-platform content creation from a single interface, and provide a strict, frictionless approval process for both internal teams and external stakeholders.

- **Phase One Focus:** Content Creation, Detailed Task Workflow & Statuses, Asset Management, Approvals, Real-time Hashtag Analytics, and Scheduling.
- **Phase Two (Out of Scope for MVP):** Meta Analytics and Unified Inboxes.
- **Phase Three (Out of Scope for MVP):** Context-aware AI Assistant integration.

### 2. User Personas & Roles

- **Copy & Caption Assignee:** Writers and strategists responsible for generating the text copy and hashtags.
- **Creatives Assignee:** Designers and videographers responsible for uploading and formatting collaterals (images, videos, thumbnails).
- **Internal Manager / Approver:** (e.g., Kim Montejo) Reviews the copy and creatives, triggers revisions or approvals, and oversees the content calendar.
- **External Approver:** (e.g., S Anton, S Tommy) Third-party stakeholders who review and comment on content via a secure public link without logging into the CMS.

### 3. Core Workflow

The platform operates on a chronological, status-driven state machine:

> Idea Generation ➔ Copy/Caption Review ➔ Creatives Generation/Review ➔ External/Internal Approval ➔ Scheduled
> 

### 4. Functional Requirements

### A. Brand Hierarchy & Platform Connection

- **Workspaces:** The system must support isolated "Brands" with distinct databases (media, hashtags, and platform connections).
- **API Connections:** Ability to connect Facebook, Instagram, TikTok, LinkedIn, Threads, X, and YouTube per brand.

### B. Content Planning & Multi-Platform Composer

- **Multiposting UI:** Users can select target platforms via checkboxes to distribute content.
- **Master vs. Custom Editor:** A main editor for the base caption, with separate tabs for specific platforms to handle character limits or customize text.
- **Internal Comments & Notes:** A dedicated notes section on the idea card for internal users to drop details or comments before/during drafting.
- **Live Preview:** Real-time mockups of the post with toggleable Desktop and Mobile views.
- **Posting Optimization:** Platform-specific optimizations mimicking native experiences, such as selecting audio tracks and setting thumbnails/cover images for Instagram Reels and TikToks.

### C. Asset Management & Hashtags

- **Media Sources:** Upload directly, or connect and pull files via Google Drive and Canva integrations.
- **Hashtag Bank:** Saved hashtags organized per concept and per brand.
- **Real-Time Hashtag Data:** System must provide real-time data usage and suggestions for hashtags per platform to optimize reach.

### D. Detailed Task Assignment, Statuses & Approvals

- **Status List:** The system relies on a strict set of statuses: Copy & caption for review, Copy & caption revision, For creatives, Creatives for review, Creatives revision, For scheduling, and Scheduled.
- **Copy Workflow:** Once the Copy Assignee finishes drafting, they set the status to *Copy & caption for review*. This triggers an email and in-app notification to the Approver. The Approver can either set it to *Copy & caption revision* (notifying the Copy Assignee) or *For creatives*.
- **Creatives Workflow:** Changing the status to *For creatives* notifies the Creatives Assignee to begin work. Once collaterals are uploaded, they set the status to *Creatives for review*, notifying the Approver. **The Approver can trigger a Creatives revision which notifies the Creatives Assignee or approve it by setting it to For scheduling.**
- **Public Sharing Link:** Generates a secure URL for pending posts requiring no login. External users must input a "Name" to drop a comment.
- **External Comment Notifications:** When an external comment is left, the Copy Assignee, Creatives Assignee, and Approver are all instantly notified.
- **Final Scheduling:** Any user with permission can set the status to *Scheduled* once the post is successfully locked in for publishing.

### E. Views, Filtering & Master Calendar

- **Calendar Views:** Content calendar specific to a single brand, and a Master calendar displaying all content ideas across all brands.
- **List Views:** A list view of content ideas filtered by a single brand, and a global list view combining all brands.
- **Assigned-To View:** A specialized dashboard view showing users exactly which content items are currently assigned to them.
- **Media Library Views:** Asset grids viewable per specific brand or combined across all brands.
- **Global Status Filter:** Every view above must include a filter function to sort or display content by its current workflow status.
- **Heatmaps:** The calendar visually indicates "Best Time to Post" via shaded color-coded blocks, fetching optimal minutes for engagement data.

### 5. Technical Requirements & Integrations

- **Frontend/Backend:** Replit environment (Recommended: Next.js or React + Node.js).
- **Database:** Relational database capable of handling multi-tenant architecture and complex state tracking
- **Social Publishing API:** Unified API aggregator (e.g., Ayrshare) to handle cross-platform posting, optimizations (thumbnails), and rate limits reliably.

![image.png](attachment:3d2018b5-1c67-4a60-be8f-802bf074e120:image.png)


### Technical Specification: Brandlab Super MVP (Replit Native)

**1. Architecture & Tech Stack**

This platform will utilize a modern Javascript/TypeScript stack deployed entirely within a Replit environment, leveraging Replit's native database and storage solutions alongside third-party APIs for social media management.

- **Frontend / Backend:** Next.js (React) utilizing App Router for both Server-Side Rendering (SSR) and Client-Side frontend components, and Next.js API Routes / Server Actions for backend logic.
- **Database:** Replit native PostgreSQL database managed via **Prisma ORM** for relational data handling, schema migrations, and type-safe querying.
- **Social Publishing Infrastructure:** Ayrshare API to act as the unified aggregator for cross-platform publishing, real-time hashtag analytics, and fetching "Best Time to Post" heatmap data.
- **Authentication & Access:** **Auth.js (NextAuth)** for secure session management of internal users; JWT-based stateless authentication for external, secure public sharing links.
- **Asset Integrations & Storage:** **Replit Object Storage** for direct media uploads. Canva Button API and Google Picker API (Google Drive) for third-party imports.
- **Notifications:** Resend or SendGrid API for email routing. (In-app notifications handled via UI state/polling or Server-Sent Events).

**2. Multi-Tenant Database Schema (Prisma Models)**

The database requires a strict multi-tenant structure to isolate Brand data at the application level. Every core model must include a `brandId`.

| **Model Name** | **Key Columns** | **Description** |
| --- | --- | --- |
| **User** | `id`, `email`, `name` | Internal platform users. |
| **Brand** | `id`, `name`, `settings` | Workspaces acting as the tenant boundary. |
| **BrandMember** | `userId`, `brandId`, `role` | Maps users to brands (Manager, Copywriter, Creative). |
| **SocialAccount** | `id`, `brandId`, `platform`, `token` | Stores Ayrshare profile IDs mapped to platforms. |
| **Post** | `id`, `brandId`, `status`, `scheduledDate` | The core "Idea/Task" tracking the state machine. |
| **PostContent** | `postId`, `platform`, `body`, `media` | Holds the Master copy and platform-specific overrides. |
| **MediaAsset** | `id`, `brandId`, `source`, `url` | Tracks files from Replit Storage, Drive, or Canva. |
| **Comment** | `postId`, `authorName`, `body` | Tracks internal notes and external stakeholder feedback. |
| **Hashtag** | `id`, `brandId`, `concept`, `tag` | Saved hashtag bank per brand. |

**3. Workflow & State Machine Logic**

The core of the application relies on a strict chronological state machine. The `Post` model will use a Prisma `enum` for the status column to enforce this workflow.

**Status Transitions & Triggers**

- **Idea Generation (Draft):** Initial state. Internal comments can be added.
- **Copy & Caption for Review:** * *Action:* Triggered by Copy Assignee.
    - *Notification:* Email sent to Internal Approver.
- **Copy & Caption Revision:** * *Action:* Triggered by Approver.
    - *Notification:* Email sent to Copy Assignee.
- **For Creatives:** * *Action:* Triggered by Approver (Copy is approved).
    - *Notification:* Email sent to Creatives Assignee.
- **Creatives for Review:** * *Action:* Triggered by Creatives Assignee upon media upload.
    - *Notification:* Email sent to Internal Approver.
- **Creatives Revision:** * *Action:* Triggered by Approver.
    - *Notification:* Email sent to Creatives Assignee.
- **For Scheduling (Approved):** * *Action:* Triggered by Approver / External Approver. Public link access is typically utilized just prior to this step.
- **Scheduled:** * *Action:* Triggered by an authorized user locking in the date/time.
    - *System Action:* Next.js API route compiles the payload and dispatches it to the Ayrshare API queue.

**4. Key Functional Implementations**

- **A. Multi-Platform Composer**
    - **Architecture:** The UI will feature a "Master Tab" mapped to a `PostContent` record where `platform = 'master'`. When a user toggles platforms (e.g., Instagram, LinkedIn), the frontend duplicates the master content into a new tab. Modifications in these tabs are saved as separate `PostContent` records tied to the parent `Post`.
    - **Platform Optimizations:** The Ayrshare integration will pass platform-specific JSON payloads based on user selections in the Composer.
- **B. External Public Sharing Link**
    - **Security:** Generate a unique, cryptographically secure hash (e.g., UUIDv4 combined with a JWT) stored in a `PostShare` model, linked to the `postId`.
    - **Access:** The Next.js route `/share/[hash]` will fetch a read-only view of the Post and its assets.
    - **Interaction:** A simple form requests `external_name`. Upon submission, a record is written to the `Comment` table.
    - **Event Hooks:** The Next.js API route handling the comment insertion will immediately dispatch email notifications to the mapped Copy Assignee, Creatives Assignee, and Approver.
- **C. Views & Filtering**
    - **Database Querying:** Global views vs. Brand-specific views will be handled via Prisma queries. A "Master View" queries Posts using `where: { brandId: { in: [userBrandIds] } }`.
    - **Assigned-To Dashboard:** Filters the `Post` model checking `copyAssigneeId = currentUser.id OR creativesAssigneeId = currentUser.id`.
    - **Heatmaps:** Fetch analytics from Ayrshare's endpoints. The frontend calendar component will map high-engagement timestamps to a color gradient overlay on the grid.
- **D. Asset Management & Hashtags**
    - **Storage:** Direct uploads will utilize Replit Object Storage, organized by `brandId` prefixes.
    - **Third-Party Import:** Google Drive and Canva APIs will return absolute URLs. These URLs will be saved directly into the `MediaAsset` table to save storage costs.
    - **Real-time Hashtags:** Debounced keystrokes on the `#` symbol will trigger an Ayrshare API call to fetch live usage statistics and recommendations, rendering them in a dropdown menu.

**5. Security & Multi-Tenancy Strategy**

- **Application-Level Security:** Because we are using Prisma and Replit PostgreSQL, multi-tenancy is enforced at the application level. Every Next.js API route and Server Action MUST explicitly verify the user's session via Auth.js, check their permissions in the `BrandMember` table, and append `where: { brandId: activeBrandId }` to every Prisma database query to ensure strict data isolation.
- **API Rate Limiting:** Implement strict rate limiting on the Next.js API routes (especially the external public commenting endpoint) to prevent spam or DDoS attacks on the notification system.

### Phase 1 Development Roadmap: Brandlab Super MVP

To deliver the Phase One scope efficiently, development will be executed in four sequential milestones. Each milestone produces a testable piece of the platform, moving from core infrastructure to advanced scheduling.

**Milestone 1: Core Architecture, Roles & Asset Integrations**

**Goal:** Build the secure, multi-tenant foundation, set up precise user permissions, and connect external asset libraries.

- Set up the multi-tenant database (e.g., Supabase/PostgreSQL) so data, media, and connections are strictly segregated by Brand.
- Implement authentication and the specific User Roles: Copy & Caption Assignee, Creatives Assignee, and Internal Manager/Approver.
- Build the basic dashboard UI with the Brand Selector.
- Integrate direct media uploads alongside API connections for Google Drive and Canva to pull files directly into the platform.

**Milestone 2: Content Composer & Hashtag Intelligence**

**Goal:** Deliver the multi-platform creator tool, platform-specific optimizations, and data-driven hashtag features.

- Build the Multiposting Composer featuring a Master Editor for base copy and individual platform tabs for customization.
- Implement the Live Preview pane with toggleable Desktop and Mobile views.
- Build platform-specific optimization tools mimicking native UI (e.g., selecting audio tracks, setting thumbnails/cover images for Reels and TikToks).
- Develop the Hashtag Bank (organized by concept/brand) and integrate real-time hashtag data/suggestions via API to optimize reach.
- Add a dedicated Internal Notes section to the idea cards for team collaboration during drafting.

**Milestone 3: Strict Workflow & Frictionless Approvals**

**Goal:** Implement the complex, status-driven state machine and external stakeholder approval portal.

- Build the backend state machine to strictly enforce the new workflow: *Idea Generation ➔ Copy & caption for review ➔ Copy & caption revision ➔ For creatives ➔ Creatives for review ➔ Creatives revision ➔ For scheduling ➔ Scheduled*.
- Configure automated email and in-app notifications triggered by status changes (routing to the appropriate Assignee or Approver).
- Create the secure, view-only "Public Link" generator for external approvers.
- Build the frictionless external portal where stakeholders can input their name and drop a comment, triggering instant notifications to the assigned team members.

**Milestone 4: Dynamic Views, Calendars & Scheduling**

**Goal:** Build the unified filtering system, visualize the content pipeline, and automate social publishing.

- Develop the dynamic UI views: Master/Brand Calendars, Master/Brand List views, Media Library grids, and the personal "Assigned-To" dashboard.
- Implement the Global Status Filter across all views so users can sort content by its exact stage in the workflow.
- Build UI Heatmaps on the calendar to visually indicate the "Best Time to Post" using shaded color-coded blocks.
- Connect the unified social API (e.g., Ayrshare) and configure the backend chron jobs to automatically push "Scheduled" posts to Facebook, IG, TikTok, LinkedIn, Threads, X, and YouTube.
