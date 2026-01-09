# CLAUDE.md

> **IMPORTANT**: Always read this file before starting any new implementation work. Review the UI Design System, architecture patterns, and current status to ensure consistency with established standards.

This file provides guidance to Claude Code when working with this repository.

## Project Overview

FieldKanban is a Kanban app for field construction operations. Field users view and update assigned tasks, upload photos, and add comments. Admins create jobs, tasks, and customize Kanban columns.

**Target Use Case:** Pavement marking company (but app remains generic for field construction)
- Crews work at job sites with poor connectivity
- Need to document work with photos
- Mobile/tablet devices used in field
- Simple task updates from the field

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run test     # Run Playwright tests
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Backend**: Supabase (Postgres, Auth, Storage)
- **Drag & Drop**: @dnd-kit

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Auth routes (Google OAuth)
│   │   ├── login/           # Google sign-in
│   │   └── callback/        # OAuth callback
│   ├── (dashboard)/         # Protected routes
│   │   ├── jobs/            # Jobs list & Kanban boards
│   │   └── admin/           # Admin-only routes
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── kanban/              # Board, Column, TaskCard, TaskDetail
│   ├── jobs/                # JobList, JobCard
│   └── layout/              # Header, Sidebar
├── lib/
│   ├── data/
│   │   ├── repository.ts           # DataRepository interface
│   │   ├── repository-context.tsx  # React context + useRepository hook
│   │   └── providers/
│   │       ├── mock.ts             # Mock data (dev only)
│   │       └── supabase.ts         # Supabase implementation
│   ├── supabase/            # Supabase client utilities
│   ├── hooks/               # useAuth, useOffline
│   └── store/               # Zustand store
└── types/                   # TypeScript interfaces
```

## Architecture

### Data Flow
```
UI Component
    ↓ useRepository()
RepositoryProvider (React Context)
    ↓
SupabaseRepository (implements DataRepository)
    ↓ snake_case ↔ camelCase
Supabase Client → PostgreSQL
```

### Key Patterns
- **Repository Pattern**: All data operations go through `useRepository()` hook
- **Type Safety**: Database uses snake_case, app uses camelCase with transformation helpers
- **Auth**: Google OAuth via Supabase, session in cookies

## Database Schema

8 tables in Supabase:
- `profiles` - User profiles (synced from auth.users)
- `jobs` - Construction jobs
- `columns` - Kanban columns per job
- `tasks` - Tasks within columns
- `task_assignments` - User-task assignments
- `comments` - Task comments
- `file_attachments` - Uploaded files
- `job_assignments` - User-job assignments

**RLS Policies:**
- Admin: Full CRUD on all tables
- Field: Read/update only assigned jobs and tasks

## User Roles

- **Admin**: Create/edit jobs, tasks, columns; manage users
- **Field**: View assigned tasks; update status; add comments; upload photos

## UI Design System

### Design Philosophy
Linear-inspired aesthetic with shadcn/ui components. Clean, minimal, professional.

### Color Palette

| Role | Light Mode | Dark Mode | CSS Variable |
|------|------------|-----------|--------------|
| Background | `#FAFAFA` | `#0A0A0A` | `--background` |
| Surface/Card | `#FFFFFF` | `#141414` | `--card` |
| Primary | `#5865F2` | `#5865F2` | `--primary` |
| Muted | `#F4F4F5` | `#27272A` | `--muted` |
| Border | `#E4E4E7` | `#27272A` | `--border` |
| Success | `#22C55E` | `#22C55E` | `--accent` |
| Destructive | `#EF4444` | `#F87171` | `--destructive` |
| Warning | `#F59E0B` | `#FBBF24` | `--warning` |

### Priority Indicators (Border + Badge)

| Priority | Left Border | Badge Style |
|----------|-------------|-------------|
| Urgent | `border-l-red-500` | `bg-red-100 text-red-700` |
| High | `border-l-orange-500` | `bg-orange-100 text-orange-700` |
| Medium | `border-l-primary` | `bg-primary/10 text-primary` |
| Low | `border-l-muted` | `bg-muted text-muted-foreground` |

### Typography (Geist Font)

| Element | Weight | Size |
|---------|--------|------|
| H1 | 700 | 28-32px |
| H2 | 600 | 20-24px |
| H3 | 600 | 16-18px |
| Body | 400 | 14-16px |
| Caption | 500 | 12px |

### Navigation

```
Mobile (< 1024px):
┌─────────────────────────────────────┐
│ [≡] Logo      [offline] [avatar ▼] │  ← Header bar
├─────────────────────────────────────┤
│           Page Content              │
└─────────────────────────────────────┘

Desktop (≥ 1024px):
┌──────────┬──────────────────────────┐
│ Logo     │  Page Title    [offline] │
│ ──────── │  [avatar ▼]              │
│ Jobs     ├──────────────────────────┤
│ Team*    │                          │
│ Settings*│      Page Content        │
│ ──────── │                          │
│ [theme]  │                          │
└──────────┴──────────────────────────┘
* Admin only
```

### Card Style

```tsx
// Bordered cards with priority indicator
<Card className="border border-border hover:border-primary/50 transition-colors">
  <div className="border-l-4 border-l-{priority-color}">
    {/* Content */}
  </div>
</Card>
```

### Animations (Minimal)

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);

/* Applied to: button hover, card hover, drag start, modal open */
```

### Offline Indicator

- Location: Header, right side
- Online: Hidden or subtle green dot
- Offline: `<Badge variant="outline"><WifiOff /> Offline</Badge>`
- Syncing: `<Badge variant="outline"><RefreshCw className="animate-spin" /> 3 pending</Badge>`

### Accessibility & Touch

- **Touch targets**: Minimum 48x48px (glove-friendly)
- **Contrast**: WCAG AAA (7:1) for critical elements
- **Focus rings**: 3px, high-visibility
- **Color**: Never rely on color alone - always icons + text
- **Card density**: Compact on desktop, spacious on mobile

### shadcn/ui Components Used

**Core**: button, card, badge, dialog, sheet, dropdown-menu, tabs, avatar
**Layout**: sidebar, separator
**Forms**: input, textarea, select, checkbox, label
**Feedback**: toast (sonner), skeleton, tooltip

## Current Status

### What's Working
- [x] Google OAuth authentication
- [x] Jobs list (loads from Supabase)
- [x] Kanban board with drag-drop
- [x] Create/edit jobs, columns, tasks
- [x] Task detail view with comments
- [x] Data persists to Supabase
- [x] Admin vs Field role UI differences

### What's Next (Priority Order)
1. **Photo capture/upload** - Document completed work
2. **Offline support** - Sync queue, conflict resolution
3. **Real-time updates** - Supabase subscriptions
4. **Admin features** - User management, reporting

## Environment Variables

Required in `.env.local` and Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Development Guidelines

### Before Starting Any Work
1. **Read this entire file** - Especially UI Design System and architecture sections
2. **Check Current Status** - Know what's working and what's next
3. **Follow established patterns** - Use existing components and utilities
4. **Update this file** - After completing significant work, update Current Status and Session Log

### Code Standards
- TypeScript strict mode; never use `any`
- All data operations through repository abstraction
- Prefer server components; client only when needed

### Git Workflow
```
main (production)
  └── develop (staging)
        └── feature/* or fix/*
```

- Never commit directly to `main`
- Feature branches → develop → main
- Commit format: `Add/Update/Fix: short description`

## Supabase Configuration

**Authentication → URL Configuration:**
- Site URL: `https://your-domain.vercel.app`
- Redirect URLs:
  - `http://localhost:3000/callback`
  - `https://your-domain.vercel.app/callback`
  - `https://*.vercel.app/callback`

**Google OAuth:**
- Configure in Supabase Dashboard → Authentication → Providers → Google
- Get credentials from Google Cloud Console

## Session Log

### January 8, 2026 - Data Layer Integration
- Created `SupabaseRepository` implementing full `DataRepository` interface
- Added `RepositoryProvider` context and `useRepository()` hook
- All pages now load/save data from Supabase
- Fixed hybrid data problem (reads from mock, writes to Supabase)

### January 7, 2026 - Auth Fixes
- Fixed Vercel build errors (Suspense boundaries)
- Fixed database trigger for user profile creation
- Added RLS INSERT policies for profiles

### January 6, 2026 - UI + Auth
- Implemented shadcn/ui with Linear-inspired theme
- Added Google OAuth authentication
- Created hybrid navigation (sidebar desktop, header mobile)
