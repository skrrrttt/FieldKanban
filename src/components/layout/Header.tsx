"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HardHat, Menu, Wifi, WifiOff, RefreshCw, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOffline } from "@/lib/hooks/useOffline";
import { useAppStore } from "@/lib/store/app-store";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { isOnline, pendingOperations } = useOffline();
  const currentUser = useAppStore((state) => state.currentUser);

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white sticky top-0 z-50 safe-area-inset-top shadow-lg">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2.5 -ml-2 rounded-lg hover:bg-white/10 lg:hidden transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/jobs" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center shadow-md group-hover:bg-yellow-400 transition-colors">
              <HardHat className="w-6 h-6 text-yellow-900" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg tracking-tight">FieldKanban</span>
              <p className="text-xs text-blue-200 -mt-0.5">Construction Management</p>
            </div>
          </Link>
        </div>

        {/* Center: Navigation (desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          <NavLink href="/jobs" active={pathname.startsWith("/jobs")}>
            Jobs
          </NavLink>
          {currentUser?.role === "admin" && (
            <>
              <NavLink href="/admin/users" active={pathname.startsWith("/admin/users")}>
                Team
              </NavLink>
              <NavLink href="/admin/settings" active={pathname.startsWith("/admin/settings")}>
                Settings
              </NavLink>
            </>
          )}
        </nav>

        {/* Right: Status + User */}
        <div className="flex items-center gap-3">
          {/* Sync Status */}
          <div className="flex items-center gap-2">
            {pendingOperations > 0 && (
              <div className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-300 px-2.5 py-1 rounded-full text-sm font-medium">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">{pendingOperations} syncing</span>
              </div>
            )}

            <div
              className={cn(
                "p-2 rounded-full transition-colors",
                isOnline
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              )}
              title={isOnline ? "Online" : "Offline - changes will sync when connected"}
              aria-label={isOnline ? "Online" : "Offline"}
            >
              {isOnline ? (
                <Wifi className="w-5 h-5" />
              ) : (
                <WifiOff className="w-5 h-5" />
              )}
            </div>
          </div>

          {/* User Menu */}
          {currentUser ? (
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px]">
              <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium leading-tight">{currentUser.name}</p>
                <p className="text-xs text-blue-300 capitalize">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-blue-300 hidden sm:block" />
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-900 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors shadow-md"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-white/20 text-white"
          : "text-blue-200 hover:text-white hover:bg-white/10"
      )}
    >
      {children}
    </Link>
  );
}
