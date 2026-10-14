import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL, isMockMode } from "@/services/apiClient";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Pennywise" },
      { name: "description", content: "View your account details and Pennywise app configuration." },
      { property: "og:title", content: "Settings | Pennywise" },
      { property: "og:description", content: "View your account details and Pennywise app configuration." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();

  return (
    <AppShell title="Settings" subtitle="Account and app configuration">
      <div className="max-w-2xl space-y-5">
        <section className="panel space-y-3 p-5">
          <h2 className="text-sm font-semibold">Account</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-secondary px-3 py-2.5">
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{user?.name}</p>
            </div>
            <div className="rounded-md bg-secondary px-3 py-2.5">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>
        </section>

        <section className="panel space-y-3 p-5">
          <h2 className="text-sm font-semibold">Currency & locale</h2>
          <p className="text-sm text-muted-foreground">
            All amounts are shown in Indian Rupees (₹) with Indian digit grouping
            (₹1,50,000), formatted with the en-IN locale. Dates use DD/MM/YYYY.
          </p>
        </section>

        <section className="panel space-y-3 p-5">
          <h2 className="text-sm font-semibold">Backend connection</h2>
          {isMockMode ? (
            <p className="text-sm text-muted-foreground">
              Pennywise is currently running on{" "}
              <span className="font-medium text-foreground">built-in demo storage</span> (data is
              kept in this browser). To connect your Spring Boot backend, set the{" "}
              <code className="rounded bg-secondary px-1 py-0.5 text-xs">VITE_API_BASE_URL</code>{" "}
              environment variable to your API origin (for example{" "}
              <code className="rounded bg-secondary px-1 py-0.5 text-xs">http://localhost:8080</code>)
              and restart the app. See <code className="rounded bg-secondary px-1 py-0.5 text-xs">BACKEND.md</code>{" "}
              for the required endpoints.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Connected to backend at{" "}
              <code className="rounded bg-secondary px-1 py-0.5 text-xs">{API_BASE_URL}</code>.
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
