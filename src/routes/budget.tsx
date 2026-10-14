import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useBudgets, useSetBudget, useTransactions } from "@/hooks/useFinance";
import { formatCurrency, monthKey, monthLabel } from "@/utils/format";
import { inMonth, totals } from "@/utils/stats";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Budget | Pennywise" },
      {
        name: "description",
        content: "Set a monthly budget in rupees and track your daily spending pace.",
      },
      { property: "og:title", content: "Budget | Pennywise" },
      {
        property: "og:description",
        content: "Set a monthly budget in rupees and track your daily spending pace.",
      },
    ],
  }),
  component: BudgetPage,
});

const ALERT_THRESHOLDS = [80, 100] as const;
const ALERTS_KEY = "pennywise.budgetAlerts";

function readFiredAlerts(month: string): number[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ALERTS_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
    return map[month] ?? [];
  } catch {
    return [];
  }
}

function markAlertFired(month: string, threshold: number) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(ALERTS_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
    map[month] = [...new Set([...(map[month] ?? []), threshold])];
    window.localStorage.setItem(ALERTS_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failures.
  }
}

function BudgetPage() {
  const { data: budgets, isLoading, isError } = useBudgets();
  const { data: transactions } = useTransactions();
  const setBudgetMutation = useSetBudget();

  const thisMonth = monthKey();
  const budget = budgets?.find((b) => b.month === thisMonth);

  const [amount, setAmount] = useState("");
  const [editing, setEditing] = useState(false);

  const monthRows = useMemo(
    () => (transactions ? inMonth(transactions, thisMonth) : []),
    [transactions, thisMonth],
  );

  const spent = totals(monthRows).expenses;
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);

  const budgetAmount = budget?.amount ?? 0;
  const remaining = Math.max(0, budgetAmount - spent);
  const usedPct = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
  const progressPct = Math.min(100, usedPct);
  const dailySuggestion = budgetAmount > 0 ? remaining / daysLeft : 0;

  // Show each toast alert once per month and threshold.
  if (budgetAmount > 0 && typeof window !== "undefined") {
    const fired = readFiredAlerts(thisMonth);

    for (const threshold of ALERT_THRESHOLDS) {
      if (usedPct >= threshold && !fired.includes(threshold)) {
        markAlertFired(thisMonth, threshold);

        if (threshold === 100) {
          toast.error(
            `Budget exceeded! You've spent ${formatCurrency(spent)} of ${formatCurrency(budgetAmount)}.`,
          );
        } else {
          toast.warning(
            `Budget warning: You've used 80% of this month's budget (${formatCurrency(spent)} of ${formatCurrency(budgetAmount)}).`,
          );
        }
      }
    }
  }

  const handleSave = async () => {
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter a valid budget amount");
      return;
    }

    try {
      await setBudgetMutation.mutateAsync({
        month: thisMonth,
        amount: value,
      });
      toast.success("Budget saved");
      setEditing(false);
      setAmount("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save budget");
    }
  };

  return (
    <AppShell title="Budget" subtitle={monthLabel(thisMonth)}>
      {isLoading ? (
        <LoadingBlock rows={5} />
      ) : isError ? (
        <ErrorBlock />
      ) : (
        <div className="max-w-2xl space-y-5">
          <section className="panel space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Monthly Budget</h2>
                <p className="text-xs text-muted-foreground">
                  {budgetAmount > 0
                    ? `${formatCurrency(budgetAmount)} for ${monthLabel(thisMonth)}`
                    : "No budget set for this month"}
                </p>
              </div>

              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAmount(budgetAmount > 0 ? String(budgetAmount) : "");
                    setEditing(true);
                  }}
                >
                  {budgetAmount > 0 ? "Edit" : "Set budget"}
                </Button>
              )}
            </div>

            {(editing || budgetAmount === 0) && (
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2">
                  <Label htmlFor="budget-amount">Amount (₹)</Label>
                  <Input
                    id="budget-amount"
                    inputMode="decimal"
                    placeholder="e.g. 10000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <Button onClick={handleSave} disabled={setBudgetMutation.isPending}>
                  {setBudgetMutation.isPending ? "Saving…" : "Save budget"}
                </Button>

                {editing && (
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            )}

            {budgetAmount > 0 && (
              <>
                {usedPct >= 100 ? (
                  <div
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm"
                  >
                    <p className="font-semibold text-destructive">
                      Budget exceeded!
                    </p>
                    <p className="text-muted-foreground">
                      You've spent {formatCurrency(spent)}, which is{" "}
                      {formatCurrency(spent - budgetAmount)} over your budget.
                    </p>
                  </div>
                ) : usedPct >= 80 ? (
                  <div
                    role="status"
                    className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm"
                  >
                    <p className="font-semibold">
                      Budget warning: {Math.round(usedPct)}% used
                    </p>
                    <p className="text-muted-foreground">
                      You have {formatCurrency(remaining)} left this month.
                      Consider reducing your spending.
                    </p>
                  </div>
                ) : (
                  <div
                    role="status"
                    className="rounded-md border border-border bg-secondary/50 p-3 text-sm"
                  >
                    <p className="font-medium">You're within your budget.</p>
                    <p className="text-muted-foreground">
                      {formatCurrency(remaining)} remaining this month.
                    </p>
                  </div>
                )}

                <Progress value={progressPct} className="h-2.5" />

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-md bg-secondary px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">Spent this month</p>
                    <p className="num text-sm font-semibold text-expense">
                      {formatCurrency(spent)}
                    </p>
                  </div>

                  <div className="rounded-md bg-secondary px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="num text-sm font-semibold text-income">
                      {formatCurrency(remaining)}
                    </p>
                  </div>

                  <div className="rounded-md bg-secondary px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">
                      Suggested daily spend
                    </p>
                    <p className="num text-sm font-semibold">
                      {formatCurrency(Math.round(dailySuggestion))}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        for {daysLeft} day{daysLeft === 1 ? "" : "s"} left
                      </span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {Math.round(usedPct)}% of your budget used. Alerts trigger at
                  80% and 100%.
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}
