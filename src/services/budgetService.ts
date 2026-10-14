import { ApiError, delay, isMockMode, newId, readStore, request, writeStore } from "./apiClient";
import { DEMO_USER_ID, seedBudgets } from "./seedData";
import type { Budget } from "@/types";

const KEY = "pennywise.budgets";

function all(): Budget[] {
  return readStore<Budget[]>(KEY, seedBudgets);
}

/** GET /api/budgets */
export async function getBudgets(): Promise<Budget[]> {
  if (!isMockMode) return request<Budget[]>("GET", "/budgets");
  return delay(all());
}

/** PUT /api/budgets/{month} — creates or replaces the budget for a month (yyyy-mm). */
export async function setBudget(month: string, amount: number): Promise<Budget> {
  if (!isMockMode) return request<Budget>("PUT", `/budgets/${month}`, { amount });
  const list = all();
  const existing = list.find((b) => b.month === month);
  if (!existing) {
    const created: Budget = { id: newId("b"), userId: DEMO_USER_ID, month, amount };
    writeStore(KEY, [...list, created]);
    return delay(created);
  }
  const updated: Budget = { ...existing, amount };
  writeStore(
    KEY,
    list.map((b) => (b.month === month ? updated : b)),
  );
  return delay(updated);
}

/** DELETE /api/budgets/{month} */
export async function deleteBudget(month: string): Promise<void> {
  if (!isMockMode) return request<void>("DELETE", `/budgets/${month}`);
  writeStore(
    KEY,
    all().filter((b) => b.month !== month),
  );
  return delay(undefined);
}
