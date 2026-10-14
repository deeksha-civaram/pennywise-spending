import { ApiError, delay, isMockMode, newId, readStore, request, writeStore } from "./apiClient";
import { DEMO_USER_ID, seedCategories } from "./seedData";
import type { Category, CategoryInput } from "@/types";

const KEY = "pennywise.categories";

function all(): Category[] {
  return readStore<Category[]>(KEY, seedCategories);
}

/** GET /api/categories */
export async function getCategories(): Promise<Category[]> {
  if (!isMockMode) return request<Category[]>("GET", "/categories");
  return delay(all());
}

/** POST /api/categories */
export async function createCategory(input: CategoryInput): Promise<Category> {
  if (!isMockMode) return request<Category>("POST", "/categories", input);
  const exists = all().some(
    (c) => c.name.toLowerCase() === input.name.trim().toLowerCase() && c.type === input.type,
  );
  if (exists) throw new ApiError("A category with that name already exists", 409);
  const created: Category = {
    id: newId("c"),
    userId: DEMO_USER_ID,
    name: input.name.trim(),
    type: input.type,
  };
  writeStore(KEY, [...all(), created]);
  return delay(created);
}

/** PUT /api/categories/{id} */
export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  if (!isMockMode) return request<Category>("PUT", `/categories/${id}`, input);
  const list = all();
  const existing = list.find((c) => c.id === id);
  if (!existing) throw new ApiError("Category not found", 404);
  const updated: Category = { ...existing, name: input.name.trim(), type: input.type };
  writeStore(
    KEY,
    list.map((c) => (c.id === id ? updated : c)),
  );
  return delay(updated);
}

/** DELETE /api/categories/{id} */
export async function deleteCategory(id: string): Promise<void> {
  if (!isMockMode) return request<void>("DELETE", `/categories/${id}`);
  writeStore(
    KEY,
    all().filter((c) => c.id !== id),
  );
  return delay(undefined);
}
