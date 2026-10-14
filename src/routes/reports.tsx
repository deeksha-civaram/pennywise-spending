import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransactions } from "@/hooks/useFinance";
import { formatCurrency, formatDate } from "@/utils/format";
import { categoryTotals, totals } from "@/utils/stats";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports | Pennywise" },
      { name: "description", content: "Analyse spending over a date range and export your transactions to CSV." },
      { property: "og:title", content: "Reports | Pennywise" },
      { property: "og:description", content: "Analyse spending over a date range and export your transactions to CSV." },
    ],
  }),
  component: ReportsPage,
});

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function firstOfMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function ReportsPage() {
  const { data: transactions, isLoading, isError } = useTransactions();
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());

  const ranged = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((t) => t.date >= from && t.date <= to);
  }, [transactions, from, to]);

  const rangeTotals = totals(ranged);
  const byCategory = categoryTotals(ranged);
  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of ranged) {
      if (t.type !== "EXPENSE") continue;
      map.set(t.date, (map.get(t.date) ?? 0) + t.amount);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date: formatDate(date).slice(0, 5), value }));
  }, [ranged]);

  const handleExport = () => {
    if (ranged.length === 0) {
      toast.error("No transactions in this date range to export");
      return;
    }
    const header = "Date,Type,Category,Description,Amount (INR)";
    const lines = ranged.map((t) =>
      [
        t.date,
        t.type,
        `"${t.category.replace(/"/g, '""')}"`,
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount.toFixed(2),
      ].join(","),
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pennywise-transactions-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${ranged.length} transactions to CSV`);
  };

  return (
    <AppShell
      title="Reports"
      subtitle="Spending analysis for a date range"
      actions={
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-1 h-4 w-4" />
          Export CSV
        </Button>
      }
    >
      {isLoading ? (
        <LoadingBlock rows={6} />
      ) : isError || !transactions ? (
        <ErrorBlock />
      ) : (
        <div className="space-y-5">
          <div className="panel flex flex-wrap items-end gap-3 p-4">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <p className="pb-2 text-xs text-muted-foreground">
              {ranged.length} transaction{ranged.length === 1 ? "" : "s"} in range
            </p>
          </div>

          <section className="grid gap-4 sm:grid-cols-3">
            <div className="panel p-4">
              <p className="text-sm text-muted-foreground">Income</p>
              <p className="num mt-1 font-display text-xl font-semibold text-income">
                {formatCurrency(rangeTotals.income)}
              </p>
            </div>
            <div className="panel p-4">
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="num mt-1 font-display text-xl font-semibold text-expense">
                {formatCurrency(rangeTotals.expenses)}
              </p>
            </div>
            <div className="panel p-4">
              <p className="text-sm text-muted-foreground">Net balance</p>
              <p className="num mt-1 font-display text-xl font-semibold">
                {formatCurrency(rangeTotals.balance)}
              </p>
            </div>
          </section>

          {ranged.length === 0 ? (
            <EmptyBlock title="No transactions in this range" hint="Try widening the dates." />
          ) : (
            <section className="grid gap-4 lg:grid-cols-2">
              <div className="panel p-4">
                <h2 className="text-sm font-semibold">Daily Expenses</h2>
                <p className="mb-4 text-xs text-muted-foreground">Within selected range</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        stroke="var(--color-muted-foreground)"
                        tickFormatter={(v: number) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }}
                      />
                      <Bar dataKey="value" name="Expenses" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="panel p-4">
                <h2 className="text-sm font-semibold">Expenses by Category</h2>
                <p className="mb-2 text-xs text-muted-foreground">Within selected range</p>
                {byCategory.length === 0 ? (
                  <EmptyBlock title="No expenses in this range" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={byCategory.slice(0, 6)} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                          {byCategory.slice(0, 6).map((entry, i) => (
                            <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </AppShell>
  );
}
