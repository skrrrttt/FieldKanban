# FieldKanban

A Progressive Web App (PWA) Kanban board designed for field construction operations. Built for crews working on job sites who need to track tasks, upload photos, and communicate updates - even when offline.

## Overview

FieldKanban bridges the gap between office management and field crews. Admins create jobs and tasks from the office, while field workers view their assignments, update statuses, add comments, and capture photos directly from their mobile devices or tablets.

**Key differentiator:** Offline-first architecture ensures field crews can work without reliable internet connectivity. Changes sync automatically when back online.

## Features

### Current (Phase 1 MVP)
- **Kanban Board** - Drag-and-drop task management with customizable columns
- **Job Management** - Organize tasks by construction job/project
- **Task Details** - View task info, location, duration estimates, and spec references
- **Comments** - Add and view comments on tasks for team communication
- **Role-Based Views** - Admins see all tasks; field users see only their assignments
- **Offline Storage** - IndexedDB caching for offline access
- **PWA Ready** - Installable on mobile devices

### Planned
- **Full Offline Sync** - Queue changes offline, sync when connected
- **Photo Capture** - Take photos from device camera, attach to tasks
- **File Attachments** - Upload and view PDFs, drawings, specs
- **Magic Link Auth** - Passwordless authentication via email
- **Real-time Updates** - Live sync across devices via Supabase
- **Push Notifications** - Get notified of task assignments and updates

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| State | Zustand |
| Drag & Drop | @dnd-kit |
| Offline Storage | IndexedDB via `idb` |
| Backend | Supabase (Postgres, Auth, Storage) |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/skrrrttt/FieldKanban.git
cd FieldKanban

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Protected routes (jobs, kanban)
│   └── (auth)/             # Auth routes (login, verify)
├── components/
│   ├── kanban/             # Board, Column, TaskCard, TaskDetail
│   ├── comments/           # CommentList, CommentForm
│   ├── jobs/               # JobList, JobCard
│   └── layout/             # Header, OfflineIndicator
├── lib/
│   ├── data/               # Repository pattern & IndexedDB
│   ├── store/              # Zustand state management
│   └── hooks/              # Custom React hooks
└── types/                  # TypeScript interfaces
```

## Architecture

FieldKanban uses a clean layered architecture:

```
UI Components → Zustand Store → Repository Interface → IndexedDB/Supabase
```

- **Repository Pattern** - Abstracts data access, allowing easy backend swaps
- **Offline-First** - All data cached locally in IndexedDB
- **Sync Queue** - Offline changes queued and synced when online (Phase 2)

## User Roles

| Role | Capabilities |
|------|--------------|
| **Admin** | Create/edit jobs, manage tasks & columns, assign users, full visibility |
| **Field** | View assigned tasks, update status, add comments, upload photos |

## Roadmap

- [x] **Phase 1: MVP** - Kanban UI, task details, comments, offline storage
- [ ] **Phase 2: Full Offline** - Sync queue, conflict resolution, background sync
- [ ] **Phase 3: File Handling** - Photo capture, file upload, PDF viewer
- [ ] **Phase 4: Backend** - Supabase auth, real-time sync, push notifications
- [ ] **Phase 5: Admin** - Column customization, user management, reporting

## Contributing

This project is in active development. See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation and known issues.

## License

MIT
