# Brandlab Super MVP

## Overview
Multi-tenant content management platform for social media workflow. Supports multiple brand workspaces, role-based access, content approval workflows, public sharing for external review, content calendar with heatmap, and cross-brand views.

## Architecture
- **Frontend:** React (Vite) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Express.js API server
- **Database:** PostgreSQL via Drizzle ORM
- **Auth:** Passport.js with local strategy + express-session (PostgreSQL session store)
- **Routing:** wouter (client-side)

## Project Structure
```
client/src/
  App.tsx           - Main app with routing, auth guard, sidebar layout
  lib/auth.tsx      - Auth context provider (login, register, logout, brand selection)
  lib/queryClient.ts - TanStack Query + apiRequest helper
  pages/
    auth-page.tsx           - Login/Register with tabs
    brand-select-page.tsx   - Workspace selection + create brand
    dashboard-page.tsx      - Dashboard with real stats, assigned-to view, quick actions
    content-list-page.tsx   - Content list with search, status filter, brand/all-brands toggle
    content-composer-page.tsx - Multi-platform composer with workflow, live preview, notes, assignments, share link
    calendar-page.tsx       - Content calendar with monthly grid, heatmap, brand/master views
    hashtag-bank-page.tsx   - Hashtag bank grouped by concept, CRUD, copy to clipboard
    share-page.tsx          - Public external review page (no auth required)
    not-found.tsx           - 404 page
  components/
    app-sidebar.tsx        - Main sidebar with brand switcher, navigation, user menu
    notification-bell.tsx  - Notification bell with popover, unread count, mark-read
    theme-toggle.tsx       - Dark/light mode toggle
    ui/                    - shadcn/ui component library

server/
  index.ts     - Express server setup
  db.ts        - Database connection (Drizzle + pg)
  auth.ts      - Passport strategy + session config
  routes.ts    - API routes (auth, brands, members, posts, hashtags, comments, notifications, share)
  storage.ts   - Storage interface (DatabaseStorage class)
  seed.ts      - Seed data (3 users, 3 brands, 4 posts, 18 hashtags)

shared/
  schema.ts    - Drizzle schema (all models + enums + Zod schemas + STATUS_TRANSITIONS + STATUS_LABELS)
```

## Database Schema
- **users**: id, email, name, password, avatarUrl
- **brands**: id, name, logoUrl, settings (tenant boundary)
- **brand_members**: userId, brandId, role (manager/copywriter/creative)
- **social_accounts**: brandId, platform, accountName, token
- **posts**: brandId, title, status (state machine enum), assignees, shareToken, scheduledDate
- **post_contents**: postId, platform, body, media
- **media_assets**: brandId, source, url, fileName, mimeType
- **comments**: postId, authorName, authorId, body, isExternal
- **hashtags**: brandId, concept, tag
- **notifications**: userId, postId, type, message, read

## Post Status State Machine (Strict Enforcement)
draft → copy_review (copywriter, manager)
copy_review → copy_revision | for_creatives (manager)
copy_revision → copy_review (copywriter, manager)
for_creatives → creatives_review (creative, manager)
creatives_review → creatives_revision | for_scheduling (manager)
creatives_revision → creatives_review (creative, manager)
for_scheduling → scheduled (manager)

## Platforms
master, facebook, instagram, tiktok, linkedin, threads, x, youtube

## Roles
- **Manager**: Full access — create/edit/delete brands, manage team members, approve content, all status transitions
- **Copywriter**: Write copy, submit for review
- **Creative**: Upload creatives, submit for review

## Workspace Management (Manager only)
- Brand select page (`/`) shows all workspaces with "Manage" button for managers
- Manage view: edit name (PATCH /api/brands/:id), delete brand (DELETE /api/brands/:id), view stats
- Team members: add (POST /api/brands/:id/members), remove (DELETE /api/brands/:id/members/:userId)
- Sidebar "Switch workspace" / "All workspaces" clears active brand via setActiveBrand(null)
- Auth context uses manualClearRef to prevent auto-reselection after intentional clear

## Cross-Brand APIs
- GET /api/posts/all — All posts across user's brands (with brandName)
- GET /api/posts/assigned — Posts assigned to current user across all brands (with brandName)

## Public Sharing
- POST /api/posts/:id/share — Generate share token
- GET /api/share/:token — Public read-only view (external comments only)
- POST /api/share/:token/comments — External comment (triggers notifications)

## API Patterns
- `apiRequest(method, url, data)` for mutations (POST/PATCH/DELETE)
- `queryKey` uses array format `["/api/brands", brandId, "posts"]` for nested resources (joined by "/" for URL)
- TanStack Query v5 object form only

## Demo Accounts
- kim@brandlab.io / password123 (Manager - all 3 brands)
- alex@brandlab.io / password123 (Copywriter - 2 brands)
- sam@brandlab.io / password123 (Creative - 2 brands)

## Key Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes to database
