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
  Bot,
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
import { FloatingWalletWise } from "@/components/layout/FloatingWalletWise";

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
    <nav className="flex flex-col gap-1.5">
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
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary/15 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>

            <span>{item.label}</span>

            {item.label === "WalletWise AI" && (
              <Sparkles className="ml-auto h-3.5 w-3.5 text-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-violet-500/20">
        ₹
      </div>

      <div className="leading-tight">
        <p className="font-display text-sm font-bold tracking-tight">
          Pennywise
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Personal finance
        </p>
      </div>
    </div>
  );
}

function UserCard({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-secondary/50 p-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
        {name?.trim()?.charAt(0)?.toUpperCase() || "U"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}

function LogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
    >
      <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
      Logout
    </button>
  );
}

function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const isAIPage = /walletwise|ai assistant/i.test(title);

  return (
    <div className="flex min-w-0 items-center gap-3">
      {isAIPage && (
        <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-400/25 bg-gradient-to-br from-violet-500/20 to-indigo-500/15 text-violet-300 shadow-sm shadow-violet-500/10">
          <Bot className="h-6 w-6" strokeWidth={1.7} />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-emerald-400" />
        </div>
      )}

      <div className="min-w-0">
        <h1 className="font-display text-lg font-semibold tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
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
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/80 bg-card/80 p-4 backdrop-blur-xl md:flex">
        <div className="px-1 pb-8 pt-1">
          <Brand />
        </div>

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/75">
          Workspace
        </p>

        <NavLinks />

        <div className="mt-auto space-y-3 border-t border-border/70 pt-5">
          <UserCard name={user.name} email={user.email} />
          <LogoutButton onClick={handleLogout} />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              {/* Mobile navigation */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-xl md:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-72 p-4">
                  <SheetTitle className="sr-only">
                    Navigation menu
                  </SheetTitle>

                  <div className="px-1 pb-8 pt-1">
                    <Brand />
                  </div>

                  <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/75">
                    Workspace
                  </p>

                  <NavLinks onNavigate={() => setMobileOpen(false)} />

                  <div className="mt-6 space-y-3 border-t border-border/70 pt-5">
                    <UserCard name={user.name} email={user.email} />
                    <LogoutButton onClick={handleLogout} />
                  </div>
                </SheetContent>
              </Sheet>

              <PageTitle title={title} subtitle={subtitle} />
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2">
              {actions}

              <Button asChild size="sm" className="rounded-xl shadow-sm">
                <Link to="/transactions/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">Add Transaction</span>
                  <span className="sm:hidden">Add</span>
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

      {/* Floating WalletWise robot and chatbot */}
      <FloatingWalletWise />
    </div>
  );
}