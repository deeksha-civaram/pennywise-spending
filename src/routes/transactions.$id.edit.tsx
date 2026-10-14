import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { useCategories, useUpdateTransaction } from "@/hooks/useFinance";
import { getTransaction } from "@/services/transactionService";
import type { TransactionInput } from "@/types";

export const Route = createFileRoute("/transactions/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Transaction | Pennywise" },
      { name: "description", content: "Update an existing income or expense." },
      { property: "og:title", content: "Edit Transaction | Pennywise" },
      { property: "og:description", content: "Update an existing income or expense." },
    ],
  }),
  component: EditTransactionPage,
});

function EditTransactionPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const updateMutation = useUpdateTransaction();

  const { data: transaction, isLoading, isError } = useQuery({
    queryKey: ["transactions", id],
    queryFn: () => getTransaction(id),
  });

  const handleSubmit = async (input: TransactionInput) => {
    try {
      await updateMutation.mutateAsync({ id, input });
      toast.success("Transaction updated");
      navigate({ to: "/transactions" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update transaction");
    }
  };

  return (
    <AppShell title="Edit Transaction" subtitle="Update this income or expense">
      {isLoading || !categories ? (
        <LoadingBlock rows={5} />
      ) : isError || !transaction ? (
        <ErrorBlock message="Could not find that transaction." />
      ) : (
        <TransactionForm
          categories={categories}
          initial={{
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            date: transaction.date,
            description: transaction.description,
          }}
          submitLabel="Save changes"
          pending={updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate({ to: "/transactions" })}
        />
      )}
    </AppShell>
  );
}
