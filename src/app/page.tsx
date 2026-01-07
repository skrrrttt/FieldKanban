import Link from "next/link";
import { HardHat, Clipboard, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <HardHat className="w-8 h-8 text-yellow-500" />
          <h1 className="text-xl font-bold">FieldKanban</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <HardHat className="w-16 h-16 mx-auto text-yellow-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome to FieldKanban
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Field construction task management made simple
            </p>
          </div>

          <div className="grid gap-4">
            <Link
              href="/jobs"
              className="flex items-center justify-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Clipboard className="w-5 h-5" />
              <span className="font-medium">View Jobs</span>
            </Link>

            <Link
              href="/login"
              className="flex items-center justify-center gap-3 border border-slate-300 dark:border-slate-700 px-6 py-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Sign In</span>
            </Link>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Offline-ready PWA for field teams
          </p>
        </div>
      </main>
    </div>
  );
}
