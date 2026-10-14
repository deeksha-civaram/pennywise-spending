import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { useCategories, useCreateTransaction } from "@/hooks/useFinance";
import type { TransactionInput } from "@/types";

export const Route = createFileRoute("/transactions/new")({
  head: () => ({
    meta: [
      { title: "Add Transaction | Pennywise" },
      { name: "description", content: "Record a new income or expense in rupees." },
      { property: "og:title", content: "Add Transaction | Pennywise" },
      { property: "og:description", content: "Record a new income or expense in rupees." },
    ],
  }),
  component: NewTransactionPage,
});

function NewTransactionPage() {
  const navigate = useNavigate();
  const { data: categories, isLoading, isError } = useCategories();
  const createMutation = useCreateTransaction();

  const handleSubmit = async (input: TransactionInput) => {
    try {
      await createMutation.mutateAsync(input);
      toast.success("Transaction added");
      navigate({ to: "/transactions" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save transaction");
    }
  };

  return (
    <AppShell title="Add Transaction" subtitle="Record a new income or expense">
      {isLoading ? (
        <LoadingBlock rows={5} />
      ) : isError || !categories ? (
        <ErrorBlock />
      ) : (
        <TransactionForm
          categories={categories}
          submitLabel="Add transaction"
          pending={createMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: "/transactions" })}
        />
      )}
    </AppShell>
  );
}
