import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login | Personal Pennywise" },
      { name: "description", content: "Sign in to your personal expense tracker account." },
      { property: "og:title", content: "Login | Personal Pennywise" },
      { property: "og:description", content: "Sign in to your personal expense tracker account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@pennywise.app");
  const [password, setPassword] = useState("demo1234");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) next.email = "Enter a valid email address";
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-base font-semibold text-primary-foreground">
            ₹
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold">Pennywise</p>
            <p className="text-xs text-muted-foreground">Personal finance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="panel space-y-4 p-5">
          <div>
            <h1 className="font-display text-xl font-semibold">Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the demo account below or your own.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors["email"] ? <p className="text-xs text-destructive">{errors["email"]}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors["password"] ? <p className="text-xs text-destructive">{errors["password"]}</p> : null}
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Login"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo login: demo@pennywise.app / demo1234
        </p>
      </div>
    </div>
  );
}
