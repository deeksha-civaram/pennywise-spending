import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as transactionService from "@/services/transactionService";
import * as categoryService from "@/services/categoryService";
import * as budgetService from "@/services/budgetService";
import type { CategoryInput, TransactionInput } from "@/types";

export const queryKeys = {
  transactions: ["transactions"] as const,
  categories: ["categories"] as const,
  budgets: ["budgets"] as const,
};

export function useTransactions() {
  return useQuery({ queryKey: queryKeys.transactions, queryFn: transactionService.getTransactions });
}

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: categoryService.getCategories });
}

export function useBudgets() {
  return useQuery({ queryKey: queryKeys.budgets, queryFn: budgetService.getBudgets });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionInput) => transactionService.createTransaction(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.transactions }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionInput }) =>
      transactionService.updateTransaction(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.transactions }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.transactions }),
  });
}

export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: CategoryInput }) =>
      id ? categoryService.updateCategory(id, input) : categoryService.createCategory(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

export function useSetBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ month, amount }: { month: string; amount: number }) =>
      budgetService.setBudget(month, amount),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.budgets }),
  });
}
