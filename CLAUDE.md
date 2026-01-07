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
- [ ] Authentication with magic link
- [ ] Connect data layer to Supabase
- [ ] Real-time updates
- [ ] Push notifications

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
