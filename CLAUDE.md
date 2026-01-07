# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FieldKanban is a PWA Kanban app for field construction operations. Field users view and update assigned tasks, upload photos, and add comments. Admins create jobs, tasks, and customize Kanban columns.

**Key Features:**
- Offline-first architecture with IndexedDB
- PWA for web, iOS, and tablet
- Magic link authentication (passwordless)
- Admin-customizable Kanban columns per job
- Photo upload from field devices
- Push notifications for task updates

## Target Use Case Context

Primary user: **Pavement marking company** (but app remains generic for field construction)

Understanding the real-world use case:
- **Crews** work at job sites (parking lots, roads, intersections)
- **Tasks** include layout, striping, stenciling, reflector installation
- **Photos** document before/after of completed work
- **Location** = addresses, lot names, mile markers
- **Specs** = DOT standards, line widths, paint types
- **Connectivity** often poor at remote job sites

This context reinforces why these priorities matter:
- **Offline-first** - critical for remote job sites with poor cell service
- **Photo capture** - documenting completed work for billing/verification
- **Mobile/tablet optimized** - devices used in trucks and field
- **Simple status updates** - quick task completion marking from the field
- **Durable touch targets** - usable with work gloves

Keep the app generic ("field construction") but design decisions should consider this use case.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Offline Storage**: IndexedDB via `idb`
- **Drag & Drop**: @dnd-kit
- **Backend**: Supabase (Postgres, Auth, Storage)

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (login, magic-link)
│   │   ├── login/
│   │   └── verify/
│   ├── (dashboard)/         # Protected routes
│   │   ├── layout.tsx       # Dashboard layout with nav
│   │   ├── page.tsx         # Home/overview
│   │   ├── jobs/
│   │   │   ├── page.tsx     # Jobs list
│   │   │   └── [jobId]/
│   │   │       ├── page.tsx # Kanban board for job
│   │   │       └── tasks/[taskId]/page.tsx
│   │   └── admin/           # Admin-only routes
│   │       ├── columns/     # Manage Kanban columns
│   │       ├── users/       # Manage users
│   │       └── jobs/new/    # Create jobs
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # Base UI components
│   ├── kanban/
│   │   ├── Board.tsx        # Main Kanban board
│   │   ├── Column.tsx       # Draggable column
│   │   ├── TaskCard.tsx     # Draggable task card
│   │   └── TaskDetail.tsx   # Task detail modal/page
│   ├── jobs/
│   │   ├── JobList.tsx
│   │   └── JobCard.tsx
│   ├── files/
│   │   ├── FileUpload.tsx   # Drag-drop + camera
│   │   ├── FileViewer.tsx   # PDF/image viewer
│   │   └── PhotoCapture.tsx # Camera integration
│   ├── comments/
│   │   ├── CommentList.tsx
│   │   └── CommentForm.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── OfflineIndicator.tsx
├── lib/
│   ├── data/                # Data layer abstraction
│   │   ├── repository.ts    # Repository interface
│   │   ├── local-db.ts      # IndexedDB operations
│   │   └── providers/
│   │       ├── mock.ts      # Mock provider for dev
│   │       └── supabase.ts  # Supabase provider (later)
│   ├── hooks/
│   │   ├── useOffline.ts    # Offline detection
│   │   ├── useSync.ts       # Sync status
│   │   └── useAuth.ts       # Auth state
│   ├── store/
│   │   └── app-store.ts     # Zustand state
│   └── utils.ts
├── types/
│   └── index.ts             # All TypeScript interfaces
└── public/
    └── manifest.json        # PWA manifest
```

## Architecture

### Data Layer (`src/lib/data/`)
- `repository.ts` - Abstract interface for data operations (allows backend swapping)
- `local-db.ts` - IndexedDB storage for offline support
- `providers/mock.ts` - Mock data provider for development
- `providers/supabase.ts` - Supabase provider (to be implemented)

### State Management (`src/lib/store/`)
- `app-store.ts` - Zustand store for app state (user, jobs, tasks, columns)

### Types (`src/types/`)
- `index.ts` - All TypeScript interfaces (Job, Task, Column, Comment, FileAttachment, User, SyncOperation)

### Key Data Flow
1. UI components read from Zustand store
2. Store is populated from repository (mock or Supabase)
3. All data is cached in IndexedDB for offline access
4. Offline changes are queued in syncQueue and synced when online

### Offline Architecture
- **Sync Queue**: Operations queued locally, processed FIFO when online
- **Conflict Resolution**:
  - Last-write-wins for simple fields (status, title)
  - Merge for comments (append, don't overwrite)
  - Server-wins for admin changes to columns/structure
  - Notify user when their offline change conflicts

### Key Components
- **Kanban Board**: @dnd-kit drag-and-drop, optimistic updates, offline visual feedback
- **Photo Capture**: Device camera via `navigator.mediaDevices`, store in IndexedDB, queue for upload
- **File Viewer**: PDF viewing, image zoom/pan, offline caching

## Backend Architecture (Supabase)

### Database Schema

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    profiles     │     │      jobs       │     │    columns      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK, FK auth)│◄────│ created_by (FK) │     │ id (PK)         │
│ email           │     │ id (PK)         │◄────│ job_id (FK)     │
│ name            │     │ title           │     │ name            │
│ role (enum)     │     │ description     │     │ order           │
│ avatar_url      │     │ client_name     │     │ color           │
│ created_at      │     │ address         │     │ created_at      │
│ updated_at      │     │ status (enum)   │     └─────────────────┘
└─────────────────┘     │ created_at      │
        │               │ updated_at      │
        │               └─────────────────┘
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ job_assignments │     │     tasks       │     │task_assignments │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │◄────│ task_id (FK)    │
│ job_id (FK)     │     │ job_id (FK)     │     │ user_id (FK)    │
│ user_id (FK)    │     │ column_id (FK)  │     │ assigned_at     │
│ assigned_by (FK)│     │ title           │     │ id (PK)         │
│ assigned_at     │     │ description     │     └─────────────────┘
└─────────────────┘     │ priority (enum) │
                        │ due_date        │
                        │ location        │
                        │ duration        │
                        │ spec_reference  │
                        │ order           │
                        │ version         │  ◄── Optimistic locking
                        │ created_by (FK) │
                        │ created_at      │
                        │ updated_at      │
                        └─────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
        ┌─────────────────┐             ┌─────────────────┐
        │    comments     │             │file_attachments │
        ├─────────────────┤             ├─────────────────┤
        │ id (PK)         │             │ id (PK)         │
        │ task_id (FK)    │             │ task_id (FK)    │
        │ user_id (FK)    │             │ uploaded_by (FK)│
        │ content         │             │ name            │
        │ created_at      │             │ storage_path    │
        └─────────────────┘             │ mime_type       │
                                        │ size            │
                                        │ type (enum)     │
                                        │ sync_status     │
                                        │ uploaded_at     │
                                        └─────────────────┘

┌─────────────────┐
│push_subscriptions│
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ endpoint        │
│ p256dh          │
│ auth            │
│ created_at      │
└─────────────────┘
```

### Enums

| Enum | Values |
|------|--------|
| `user_role` | `admin`, `field` |
| `job_status` | `active`, `completed`, `archived` |
| `task_priority` | `low`, `medium`, `high`, `urgent` |
| `file_type` | `image`, `document` |
| `sync_status` | `synced`, `pending`, `error` |

### RLS Policy Structure

**Admin users** (role = 'admin'):
- Full CRUD on all tables
- Can assign users to jobs and tasks
- Can manage columns

**Field users** (role = 'field'):
- Read jobs they're assigned to (via `job_assignments`)
- Read tasks in their assigned jobs
- Update tasks they're assigned to (via `task_assignments`)
- Create comments on accessible tasks
- Upload files to accessible tasks
- Read own profile, update limited fields

**Helper Functions** (defined in database):
```sql
is_admin()                    -- Returns true if current user is admin
is_assigned_to_job(job_uuid)  -- Returns true if user assigned to job
is_assigned_to_task(task_uuid) -- Returns true if user assigned to task
can_access_task(task_uuid)    -- Returns true if admin OR assigned to task's job
```

### Authentication Strategy

**Magic Link Flow:**
1. User enters email on `/login`
2. Supabase sends magic link email
3. User clicks link → redirected to `/auth/callback`
4. Callback exchanges code for session
5. Middleware redirects to `/jobs`

**Session Management:**
- JWT tokens stored in HTTP-only cookies
- Server-side session validation via `@supabase/ssr`
- Auto-refresh on token expiry

**Profile Auto-Creation:**
- Database trigger creates profile on `auth.users` insert
- Default role: `field` (admin must upgrade)

### Storage Configuration

**Bucket:** `task-attachments`
- Max file size: 10MB
- Allowed types: images, PDFs
- Path structure: `{task_id}/{file_id}.{ext}`

**Policies:**
- Upload: User can access task (admin or assigned)
- Download: User can access task
- Delete: Admin only

### Sync Strategy

**Online Flow:**
1. UI action triggers repository method
2. Repository calls Supabase directly
3. Real-time subscription updates other clients
4. IndexedDB updated as cache

**Offline Flow:**
1. UI action triggers repository method
2. Repository writes to IndexedDB immediately
3. Operation queued in `syncQueue` store
4. When online, queue processed FIFO
5. Conflicts resolved per field type

**Conflict Resolution:**
- `version` field on tasks for optimistic locking
- Server rejects stale updates (version mismatch)
- Client fetches latest, shows conflict UI
- Comments: append-only, no conflicts
- Files: last-upload-wins

### API Routes (Next.js)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/callback` | GET | Handle magic link callback |
| `/api/auth/logout` | POST | Clear session |
| `/api/push/subscribe` | POST | Register push subscription |
| `/api/push/unsubscribe` | POST | Remove push subscription |

### Edge Functions (Supabase)

| Function | Trigger | Purpose |
|----------|---------|---------|
| `send-push-notification` | Task update | Notify assigned users |
| `cleanup-expired-files` | Cron (daily) | Remove orphaned uploads |

### Current Progress

**Completed (Phase 4a):**
- [x] All 8 database tables created via migrations
- [x] RLS enabled on all tables with policies
- [x] Helper functions for access control
- [x] Storage bucket with upload/download policies
- [x] TypeScript types generated (`src/types/supabase.ts`)
- [x] Supabase client utilities (`src/lib/supabase/`)
- [x] Environment configuration (`.env.example`)

**Next (Phase 4b - Authentication):**
- [ ] Login page with magic link form
- [ ] Auth callback route handler
- [ ] Middleware for protected routes
- [ ] useAuth hook implementation
- [ ] Logout functionality

**Then (Phase 4c - Data Integration):**
- [ ] Supabase repository provider
- [ ] Replace mock provider usage
- [ ] Real-time subscriptions
- [ ] Push notification edge function

## User Roles

- **Admin**: Create/edit jobs, tasks, columns; upload files; manage users
- **Field**: View assigned tasks only; update status; add comments; upload photos

## UI/UX Design Decisions

### Color Scheme: Professional Blue
- Primary: Blue tones for trust and reliability (similar to Procore, PlanGrid)
- Header: Dark blue (`bg-blue-900`) instead of slate
- Accents: Blue-600 for buttons and interactive elements
- Status colors: Green (complete), Yellow (in progress), Red (blocked/urgent)

### Card Density: Adaptive
- **Desktop**: Compact cards, more tasks visible at once
- **Mobile/Tablet**: Spacious cards with larger touch targets (min 44px)
- Responsive padding: `p-3` on desktop, `p-4` on mobile

### Priority/Status Display: Icon-based
- Warning triangle for urgent/high priority
- Flag icons for priority levels
- Clock icon for overdue items
- Checkmark for completed sub-items

### Task Card Information
- Location/floor indicator (where on job site)
- Duration estimate (time to complete)
- Job specs reference (drawing/spec numbers)
- Priority icon indicator
- Assignee avatars

### Touch Targets
- Minimum 44x44px for all interactive elements
- Drag handles sized for gloved hands
- Swipe gestures for mobile column navigation

### Accessibility
- ARIA labels on icon-only buttons
- Focus outlines for keyboard navigation
- Not relying on color alone for status

## Implementation Order

### Phase 1: MVP (Complete)
- [x] Project setup with Next.js + TypeScript + Tailwind
- [x] Core types and data layer abstraction
- [x] Mock data provider for development
- [x] IndexedDB storage setup
- [x] Kanban board UI with drag-drop
- [x] Job list and navigation
- [x] Task detail view with comments
- [x] Basic PWA manifest

### Phase 2: Full Offline
- [ ] Sync queue implementation
- [ ] Conflict resolution
- [ ] Offline indicator UI
- [ ] Background sync

### Phase 3: File Handling
- [ ] Photo capture from camera
- [ ] File upload with offline queue
- [ ] PDF/image viewer
- [ ] Offline file caching

### Phase 4: Backend Integration (Supabase)

#### Phase 4a: Supabase Setup (Complete)
- [x] Database schema with migrations (8 tables: profiles, jobs, columns, tasks, task_assignments, comments, file_attachments, push_subscriptions)
- [x] RLS policies for role-based access (admin vs field users)
- [x] Helper functions (is_admin, is_assigned_to_job, is_assigned_to_task, can_access_task)
- [x] Storage bucket (task-attachments) with policies
- [x] TypeScript types generated from schema
- [x] Supabase client utilities (browser + server)

#### Phase 4b: Authentication (Next)
- [ ] Magic link authentication flow
- [ ] Auth middleware for protected routes
- [ ] Profile auto-creation on signup
- [ ] Session management

#### Phase 4c: Data Layer Integration
- [ ] Supabase provider implementation
- [ ] Connect repository to Supabase
- [ ] Real-time subscriptions for task updates
- [ ] Push notifications via Edge Functions

### Phase 5: Admin Features
- [ ] Custom column management
- [ ] User management
- [ ] Job creation/editing
- [ ] Reporting/analytics

## Known Issues / Technical Debt

Issues identified during architecture review that should be addressed before Phase 2:

### High Priority (Phase 2 Blockers)

1. **Direct mockRepository imports bypass abstraction**
   - Files: `TaskDetail.tsx`, `layout.tsx`, `jobs/[jobId]/page.tsx`
   - Fix: Create `useRepository` hook or context provider, use `getRepository()` from `repository.ts`

2. **Component-local state for shared data**
   - `TaskDetail.tsx` maintains local `comments`, `files`, `users` state
   - Fix: Move to Zustand store for proper sync queue integration

3. **Zustand store underutilization**
   - Store missing: `comments`, `files`, `syncStatus`
   - Actions needed: `addComment`, `updateFile`, sync state management

### Medium Priority

4. **Missing error handling patterns**
   - Components only handle success cases, no error display
   - Fix: Add error states and user feedback for failed operations

5. **No optimistic updates for comments**
   - `handleAddComment` waits for repository before updating UI
   - Fix: Update UI immediately, queue for sync

6. **Missing useSync hook**
   - Referenced in CLAUDE.md but not implemented
   - Needed for: Processing pending operations, manual sync trigger

### Low Priority

7. **Task card indicators hardcoded**
   - `TaskCard.tsx` shows "0" for comments/attachments
   - Fix: Connect to actual comment/file counts

8. **No error boundaries**
   - Add React error boundaries for graceful failure handling

### Phase 2 Prep Checklist
- [ ] Centralize repository access via hook/context
- [ ] Expand Zustand store with comments, files, syncStatus
- [ ] Implement useSync hook
- [ ] Add optimistic update pattern
- [ ] Connect sync queue to all create/update/delete operations

## Future Opportunities (Ideas for Later)

Research-identified opportunities to consider for future development. Not in active roadmap.

### Feature Ideas

#### Time Tracking & GPS
- [ ] GPS geofencing for auto clock-in/out at job sites
- [ ] Time tracking per task (not just per job)
- [ ] Timesheet export for payroll integration
- [ ] Mileage tracking between job sites
- [ ] Real-time crew location tracking

#### Voice & Hands-Free
- [ ] Voice-to-text for comments and notes (Web Speech API)
- [ ] Voice commands for task status updates
- [ ] Offline speech recognition (on-device)
- [ ] Critical for gloved workers who can't type

#### Daily Reports & Documentation
- [ ] Daily log templates (weather, crew, equipment, work completed)
- [ ] Before/after photo requirements per task
- [ ] PDF report generation for clients
- [ ] Automatic weather capture via API
- [ ] Digital signature capture

#### Checklists
- [ ] Pre-job safety checklists
- [ ] Quality control checklists
- [ ] Completion verification checklists
- [ ] ADA compliance checklists (parking lot requirements)
- [ ] Traffic control setup checklists
- [ ] Equipment inspection checklists
- [ ] Custom checklist builder for admins

#### Communication
- [ ] Job-specific chat channels
- [ ] @mentions for crew members
- [ ] Auto-translation for multilingual crews
- [ ] Attach photos/files to messages
- [ ] Urgent message push notifications

#### Equipment & Materials
- [ ] Track material usage per job (paint, reflectors, etc.)
- [ ] Equipment assignment to jobs/crews
- [ ] Low inventory alerts
- [ ] Material cost tracking for job profitability
- [ ] Calculate paint needed based on linear feet

### Industry-Specific (Pavement Marking)

#### Measurements & Estimating
- [ ] Store property measurements (stalls, linear feet, square footage)
- [ ] Task types: line striping, stenciling, arrows, handicap symbols
- [ ] Auto-calculate paint quantities from measurements
- [ ] Unit-based pricing (per stall, per linear foot)

#### Weather Awareness
- [ ] Weather API integration
- [ ] Surface temperature thresholds for paint application
- [ ] Automatic weather conditions in reports
- [ ] Reschedule suggestions for bad weather
- [ ] Night work scheduling support

#### Compliance
- [ ] ADA parking compliance verification
- [ ] Sign height verification (60" minimum)
- [ ] Proper symbol dimension checks
- [ ] Access aisle width verification
- [ ] Compliance photo documentation
- [ ] Generate compliance reports

#### Safety
- [ ] Traffic control documentation
- [ ] Required signage tracking
- [ ] Night work lighting requirements
- [ ] Lane closure documentation
- [ ] Safety briefing sign-offs
- [ ] OSHA toolbox talk integration

### Technical Opportunities (Modern Web APIs)

- [ ] Background Sync API - auto-sync when connectivity returns
- [ ] Periodic Background Sync - fetch job updates overnight
- [ ] Geolocation watchPosition - real-time location
- [ ] Wake Lock API - prevent screen sleep during work
- [ ] Notification Triggers API - location-based reminders
- [ ] File System Access API - batch photo upload
- [ ] Web Share Target API - receive photos from camera app

### Integration Ideas

#### High Priority
- [ ] QuickBooks - payroll, invoicing, job costing
- [ ] Weather API - auto-log conditions
- [ ] Google Maps - route optimization, travel time
- [ ] Google Calendar - crew scheduling sync

#### Medium Priority
- [ ] Stripe/Square - payment collection in field
- [ ] Gusto/ADP - direct payroll export
- [ ] Zapier - connect to 5000+ apps

#### Industry-Specific
- [ ] Home Depot Pro Xtra - material ordering
- [ ] Equipment GPS tracking
- [ ] Safety/OSHA compliance apps

### Business Model Ideas

If commercialized, consider tiered pricing:
- **Free**: 1 user, 3 active jobs (viral adoption)
- **Team** ($29/mo): 5 users, unlimited jobs, offline, photos
- **Pro** ($79/mo): 15 users, time tracking, reports, integrations
- **Business** ($149/mo): Unlimited users, API access, priority support

### Competitive Positioning

Target sweet spot:
- 2-20 person crews
- Specialty trades (pavement marking, concrete, landscaping)
- Price-conscious but need professional tools
- Poor connectivity environments
- Mobile-primary workflows

Differentiators:
- True offline-first (not afterthought)
- Mobile-first, glove-friendly
- Simple (15-minute onboarding)
- Vertical focus on specialty contractors

## Available MCP Servers

- **supabase**: Database operations and management
- **context7**: Access up-to-date library documentation
- **playwright**: Browser automation and testing

## Available Slash Commands

### Development
- `/new-task` - Analyze task complexity and create implementation plan
- `/code-optimize` - Performance optimization
- `/code-cleanup` - Refactoring and cleanup
- `/feature-plan` - Feature implementation planning
- `/lint` - Run linting and fix issues

### API Development
- `/api-new` - Create new API routes with validation and error handling
- `/api-test` - Test API endpoints
- `/api-protect` - Add authentication and security

### UI Development
- `/component-new` - Create React components
- `/page-new` - Create Next.js pages

### Supabase
- `/types-gen` - Generate TypeScript types from database schema
- `/edge-function-new` - Create Supabase Edge Functions

## Development Guidelines

- Use TypeScript strict mode; never use `any` types
- Follow Next.js App Router conventions
- Prefer server components; use client components only when interactivity needed
- All data operations go through the repository abstraction
- Queue offline changes for sync; use optimistic updates in UI
