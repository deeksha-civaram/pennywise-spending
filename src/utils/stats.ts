import type { Transaction } from "@/types";
import { monthKey, monthOf, shortMonthLabel } from "./format";

export function sumBy(transactions: Transaction[], type: Transaction["type"]): number {
  return transactions.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
}

export function inMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((t) => monthOf(t.date) === month);
}

export interface Totals {
  income: number;
  expenses: number;
  balance: number;
}

export function totals(transactions: Transaction[]): Totals {
  const income = sumBy(transactions, "INCOME");
  const expenses = sumBy(transactions, "EXPENSE");
  return { income, expenses, balance: income - expenses };
}

export function categoryTotals(
  transactions: Transaction[],
  type: Transaction["type"] = "EXPENSE",
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== type) continue;
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function lastMonths(count: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    keys.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  }
  return keys;
}

export function monthlySeries(
  transactions: Transaction[],
  count = 6,
): { month: string; label: string; income: number; expenses: number }[] {
  return lastMonths(count).map((key) => {
    const rows = inMonth(transactions, key);
    return {
      month: key,
      label: shortMonthLabel(key),
      income: sumBy(rows, "INCOME"),
      expenses: sumBy(rows, "EXPENSE"),
    };
  });
}
