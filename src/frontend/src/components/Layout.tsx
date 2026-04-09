import { Link, useLocation } from "@tanstack/react-router";
import { BarChart2, Heart } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const appId = encodeURIComponent(
    typeof window !== "undefined"
      ? window.location.hostname
      : "habit-drift-analyzer",
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header — sticky only, no relative (they conflict as position utilities) */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-surface/80 backdrop-blur-sm">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/assets/generated/hero-bg.dim_1440x400.png"
            alt=""
            className="w-full h-full object-cover object-top opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/95" />
        </div>
        <div className="relative container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-accent-primary flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-background" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-widest uppercase text-foreground">
                HabitDrift
              </h1>
              <p className="text-xs text-muted-foreground tracking-wider">
                Predictive Analytics
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                currentPath === "/"
                  ? "bg-accent-primary text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
              }`}
            >
              Log Habits
            </Link>
            <Link
              to="/analytics"
              className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                currentPath === "/analytics"
                  ? "bg-accent-primary text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
              }`}
            >
              Analytics
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 mt-auto">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} HabitDrift — Predictive Habit Analytics
          </span>
          <span className="flex items-center gap-1">
            Built with{" "}
            <Heart className="w-3 h-3 text-risk-critical fill-risk-critical" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary hover:underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
