import { ApiError, delay, isMockMode, newId, readStore, request, writeStore } from "./apiClient";
import { DEMO_USER_ID, seedTransactions } from "./seedData";
import type { Transaction, TransactionInput } from "@/types";

const KEY = "pennywise.transactions";

function all(): Transaction[] {
  return readStore<Transaction[]>(KEY, seedTransactions);
}

/** GET /api/transactions */
export async function getTransactions(): Promise<Transaction[]> {
  if (!isMockMode) return request<Transaction[]>("GET", "/transactions");
  return delay(
    all()
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date)),
  );
}

/** GET /api/transactions/{id} */
export async function getTransaction(id: string): Promise<Transaction> {
  if (!isMockMode) return request<Transaction>("GET", `/transactions/${id}`);
  const found = all().find((t) => t.id === id);
  if (!found) throw new ApiError("Transaction not found", 404);
  return delay(found);
}

/** POST /api/transactions */
export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  if (!isMockMode) return request<Transaction>("POST", "/transactions", input);
  const stamp = new Date().toISOString();
  const created: Transaction = {
    id: newId("t"),
    userId: DEMO_USER_ID,
    type: input.type,
    amount: input.amount,
    category: input.category,
    date: input.date,
    description: input.description,
    createdAt: stamp,
    updatedAt: stamp,
  };
  writeStore(KEY, [created, ...all()]);
  return delay(created);
}

/** PUT /api/transactions/{id} */
export async function updateTransaction(id: string, input: TransactionInput): Promise<Transaction> {
  if (!isMockMode) return request<Transaction>("PUT", `/transactions/${id}`, input);
  const list = all();
  const existing = list.find((t) => t.id === id);
  if (!existing) throw new ApiError("Transaction not found", 404);
  const updated: Transaction = { ...existing, ...input, updatedAt: new Date().toISOString() };
  writeStore(
    KEY,
    list.map((t) => (t.id === id ? updated : t)),
  );
  return delay(updated);
}

/** DELETE /api/transactions/{id} */
export async function deleteTransaction(id: string): Promise<void> {
  if (!isMockMode) return request<void>("DELETE", `/transactions/${id}`);
  writeStore(
    KEY,
    all().filter((t) => t.id !== id),
  );
  return delay(undefined);
}
