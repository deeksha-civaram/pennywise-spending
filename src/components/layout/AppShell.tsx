import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Wallet,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Transactions", to: "/transactions", icon: ArrowLeftRight },
  { label: "Categories", to: "/categories", icon: Tags },
  { label: "Budget", to: "/budget", icon: Wallet },
  { label: "Reports", to: "/reports", icon: FileBarChart },
  { label: "WalletWise AI", to: "/walletwise", icon: Sparkles },
  { label: "Settings", to: "/settings", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active =
          item.to === "/"
            ? pathname === "/"
            : pathname.startsWith(item.to);

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-secondary text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-base font-semibold text-primary-foreground">
        ₹
      </div>

      <div className="leading-tight">
        <p className="font-display text-sm font-semibold">Pennywise</p>
        <p className="text-xs text-muted-foreground">
          Personal finance
        </p>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) {
      navigate({ to: "/login" });
    }
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card p-4 md:flex">
        <div className="px-1 pb-6">
          <Brand />
        </div>

        <NavLinks />

        <div className="mt-auto space-y-3 pt-6">
          <div className="rounded-md bg-secondary px-3 py-2.5">
            <p className="truncate text-sm font-medium">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile navigation menu */}
              <Sheet
                open={mobileOpen}
                onOpenChange={setMobileOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-64 p-4">
                  <SheetTitle className="sr-only">
                    Menu
                  </SheetTitle>

                  <div className="px-1 pb-6">
                    <Brand />
                  </div>

                  <NavLinks
                    onNavigate={() => setMobileOpen(false)}
                  />

                  <button
                    onClick={handleLogout}
                    className="mt-6 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </SheetContent>
              </Sheet>

              <div>
                <h1 className="font-display text-lg font-semibold">
                  {title}
                </h1>

                {subtitle ? (
                  <p className="text-xs text-muted-foreground">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2">
              {actions}

              <Button asChild size="sm">
                <Link to="/transactions/new">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Transaction
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
