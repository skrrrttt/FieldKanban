import { HardHat } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 mb-8 text-foreground hover:text-primary transition-colors"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
          <HardHat className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold">FieldKanban</span>
      </Link>

      {/* Content */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground">
        Field construction task management
      </p>
    </div>
  );
}
