import { createFileRoute, Link } from "@tanstack/react-router";
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
import { TrendingUp, TrendingDown, Wallet, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SummaryCard } from "@/components/common/SummaryCard";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { Button } from "@/components/ui/button";
import { useBudgets, useTransactions } from "@/hooks/useFinance";
import { formatCurrency, formatDate, monthKey, monthLabel } from "@/utils/format";
import { categoryTotals, inMonth, monthlySeries, totals } from "@/utils/stats";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Personal Pennywise" },
      {
        name: "description",
        content:
          "See total income, expenses, balance, monthly spending and recent transactions in rupees.",
      },
      { property: "og:title", content: "Dashboard | Personal Pennywise" },
      {
        property: "og:description",
        content: "See total income, expenses, balance and monthly spending in rupees.",
      },
    ],
  }),
  component: DashboardPage,
});

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function DashboardPage() {
  const { data: transactions, isLoading, isError } = useTransactions();
  const { data: budgets } = useBudgets();

  const thisMonth = monthKey();

  return (
    <AppShell title="Dashboard" subtitle={monthLabel(thisMonth)}>
      {isLoading ? (
        <LoadingBlock rows={6} />
      ) : isError || !transactions ? (
        <ErrorBlock />
      ) : transactions.length === 0 ? (
        <EmptyBlock
          title="No transactions yet"
          hint="Add your first income or expense to see your summary here."
          action={
            <Button asChild size="sm">
              <Link to="/transactions/new">Add transaction</Link>
            </Button>
          }
        />
      ) : (
        (() => {
          const all = totals(transactions);
          const monthRows = inMonth(transactions, thisMonth);
          const monthTotals = totals(monthRows);
          const budget = budgets?.find((b) => b.month === thisMonth)?.amount ?? 0;
          const series = monthlySeries(transactions, 6);
          const byCategory = categoryTotals(monthRows).slice(0, 5);
          const recent = transactions.slice(0, 6);
          const usedPct = budget > 0 ? Math.min(100, (monthTotals.expenses / budget) * 100) : 0;

          return (
            <div className="space-y-5">
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  label="Total Income"
                  value={formatCurrency(all.income)}
                  hint="All time"
                  icon={TrendingUp}
                  tone="income"
                />
                <SummaryCard
                  label="Total Expenses"
                  value={formatCurrency(all.expenses)}
                  hint="All time"
                  icon={TrendingDown}
                  tone="expense"
                />
                <SummaryCard
                  label="Available Balance"
                  value={formatCurrency(all.balance)}
                  hint="Income − Expenses"
                  icon={Wallet}
                />
                <SummaryCard
                  label="This Month's Spending"
                  value={formatCurrency(monthTotals.expenses)}
                  hint={
                    budget > 0
                      ? `${Math.round(usedPct)}% of ${formatCurrency(budget)} budget`
                      : "No budget set"
                  }
                  icon={CalendarDays}
                />
              </section>

              <section className="grid gap-4 lg:grid-cols-3">
                <div className="panel p-4 lg:col-span-2">
                  <h2 className="text-sm font-semibold">Monthly Income vs Expenses</h2>
                  <p className="mb-4 text-xs text-muted-foreground">Last 6 months</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={series} barGap={6}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                          stroke="var(--color-muted-foreground)"
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                          stroke="var(--color-muted-foreground)"
                          tickFormatter={(v: number) => `₹${v / 1000}k`}
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid var(--color-border)",
                            fontSize: 12,
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="income" name="Income" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" name="Expenses" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="panel p-4">
                  <h2 className="text-sm font-semibold">Category-wise Expenses</h2>
                  <p className="mb-2 text-xs text-muted-foreground">{monthLabel(thisMonth)}</p>
                  {byCategory.length === 0 ? (
                    <EmptyBlock title="No expenses this month" />
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={byCategory}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={48}
                            outerRadius={78}
                            paddingAngle={2}
                          >
                            {byCategory.map((entry, i) => (
                              <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              borderRadius: 8,
                              border: "1px solid var(--color-border)",
                              fontSize: 12,
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </section>

              <section className="panel">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h2 className="text-sm font-semibold">Recent Transactions</h2>
                  <Link to="/transactions" className="text-sm font-medium text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {recent.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{t.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.category} · {formatDate(t.date)}
                        </p>
                      </div>
                      <p
                        className={`num shrink-0 text-sm font-semibold ${
                          t.type === "INCOME" ? "text-income" : "text-expense"
                        }`}
                      >
                        {t.type === "INCOME" ? "+" : "−"}
                        {formatCurrency(t.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          );
        })()
      )}
    </AppShell>
  );
}
