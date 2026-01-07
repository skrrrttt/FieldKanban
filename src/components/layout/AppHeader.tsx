"use client";

import Link from "next/link";
import { HardHat, WifiOff, RefreshCw } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useOffline } from "@/lib/hooks/useOffline";
import { useAppStore } from "@/lib/store/app-store";
import { useAuth } from "@/lib/hooks/useAuth";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const { isOnline, pendingOperations } = useOffline();
  const currentUser = useAppStore((state) => state.currentUser);
  const { signOut } = useAuth();
  const { isMobile } = useSidebar();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4 safe-area-inset-top">
      {/* Left: Sidebar trigger + Logo (mobile) or Page title (desktop) */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* Mobile: Show logo */}
        {isMobile && (
          <Link href="/jobs" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <HardHat className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">FieldKanban</span>
          </Link>
        )}

        {/* Desktop: Show page title */}
        {!isMobile && title && (
          <h1 className="text-lg font-semibold">{title}</h1>
        )}
      </div>

      {/* Right: Status indicators + User (mobile) */}
      <div className="ml-auto flex items-center gap-2">
        {/* Offline/Sync Status Badge */}
        {!isOnline ? (
          <Badge variant="outline" className="gap-1.5 text-destructive border-destructive/50">
            <WifiOff className="h-3 w-3" />
            <span className="hidden sm:inline">Offline</span>
          </Badge>
        ) : pendingOperations > 0 ? (
          <Badge variant="outline" className="gap-1.5 text-warning border-warning/50">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span className="hidden sm:inline">{pendingOperations} syncing</span>
            <span className="sm:hidden">{pendingOperations}</span>
          </Badge>
        ) : null}

        {/* Theme Toggle (desktop - mobile has it in sidebar) */}
        {!isMobile && <ThemeToggle />}

        {/* User Menu (mobile only - desktop has it in sidebar) */}
        {isMobile && currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {currentUser.role}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ThemeToggle />
                <span className="ml-2">Theme</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={signOut}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Sign in button if no user */}
        {!currentUser && (
          <Button asChild size="sm">
            <Link href="/login">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
