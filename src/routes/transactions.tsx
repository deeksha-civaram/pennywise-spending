import { useMemo, useState } from "react";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCategories, useDeleteTransaction, useTransactions } from "@/hooks/useFinance";
import { formatCurrency, formatDate } from "@/utils/format";
import type { Transaction } from "@/types";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions | Pennywise" },
      { name: "description", content: "Browse, search, filter and manage all your income and expenses in rupees." },
      { property: "og:title", content: "Transactions | Pennywise" },
      { property: "og:description", content: "Browse, search, filter and manage all your income and expenses in rupees." },
    ],
  }),
  component: TransactionsPage,
});

const PAGE_SIZE = 10;

function TransactionsPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data: transactions, isLoading, isError } = useTransactions();
  const { data: categories } = useCategories();
  const deleteMutation = useDeleteTransaction();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sort, setSort] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!transactions) return [];
    const q = search.trim().toLowerCase();
    const rows = transactions.filter((t) => {
      if (typeFilter !== "ALL" && t.type !== typeFilter) return false;
      if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
      if (q && !`${t.description} ${t.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
    rows.sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return a.date.localeCompare(b.date);
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        default:
          return b.date.localeCompare(a.date);
      }
    });
    return rows;
  }, [transactions, search, typeFilter, categoryFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDelete = async (t: Transaction) => {
    try {
      await deleteMutation.mutateAsync(t.id);
      toast.success(`Deleted "${t.description}"`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete transaction");
    }
  };

  if (pathname !== "/transactions") return <Outlet />;

  return (
    <AppShell title="Transactions" subtitle="All your income and expenses">
      {isLoading ? (
        <LoadingBlock rows={8} />
      ) : isError || !transactions ? (
        <ErrorBlock />
      ) : (
        <div className="space-y-4">
          <div className="panel flex flex-wrap items-center gap-3 p-3">
            <Input
              className="w-full sm:w-64"
              placeholder="Search description or category…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v as typeof typeFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All categories</SelectItem>
                {(categories ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest first</SelectItem>
                <SelectItem value="date-asc">Oldest first</SelectItem>
                <SelectItem value="amount-desc">Highest amount</SelectItem>
                <SelectItem value="amount-asc">Lowest amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {pageRows.length === 0 ? (
            <EmptyBlock
              title="No transactions found"
              hint="Try changing your filters, or add a new transaction."
              action={
                <Button asChild size="sm">
                  <Link to="/transactions/new">Add transaction</Link>
                </Button>
              }
            />
          ) : (
            <div className="panel">
              <div className="divide-y divide-border">
                {pageRows.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.category} · {formatDate(t.date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <p
                        className={`num mr-2 text-sm font-semibold ${
                          t.type === "INCOME" ? "text-income" : "text-expense"
                        }`}
                      >
                        {t.type === "INCOME" ? "+" : "−"}
                        {formatCurrency(t.amount)}
                      </p>
                      <Button asChild variant="ghost" size="icon" aria-label="Edit transaction">
                        <Link to="/transactions/$id/edit" params={{ id: t.id }}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Delete transaction">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{t.description}" ({formatCurrency(t.amount)}) will be permanently
                              removed. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(t)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
              {pageCount > 1 ? (
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Page {currentPage} of {pageCount} · {filtered.length} transactions
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= pageCount}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
