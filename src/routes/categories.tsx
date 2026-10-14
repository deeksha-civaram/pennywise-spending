import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/common/StateBlocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { useCategories, useDeleteCategory, useSaveCategory } from "@/hooks/useFinance";
import type { Category, TransactionType } from "@/types";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories | Pennywise" },
      { name: "description", content: "Manage your income and expense categories." },
      { property: "og:title", content: "Categories | Pennywise" },
      { property: "og:description", content: "Manage your income and expense categories." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategories();
  const saveMutation = useSaveCategory();
  const deleteMutation = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<TransactionType>("EXPENSE");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setType("EXPENSE");
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setType(c.type);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (name.trim().length < 2) {
      toast.error("Category name must be at least 2 characters");
      return;
    }
    try {
      await saveMutation.mutateAsync({ id: editing?.id, input: { name, type } });
      toast.success(editing ? "Category updated" : "Category added");
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save category");
    }
  };

  const handleDelete = async (c: Category) => {
    try {
      await deleteMutation.mutateAsync(c.id);
      toast.success(`Deleted "${c.name}"`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete category");
    }
  };

  const income = (categories ?? []).filter((c) => c.type === "INCOME");
  const expense = (categories ?? []).filter((c) => c.type === "EXPENSE");

  const renderGroup = (title: string, list: Category[]) => (
    <section className="panel">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {list.length === 0 ? (
        <div className="p-4">
          <EmptyBlock title={`No ${title.toLowerCase()} categories`} />
        </div>
      ) : (
        <div className="divide-y divide-border">
          {list.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-medium">{c.name}</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" aria-label="Edit category" onClick={() => openEdit(c)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Delete category">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{c.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Existing transactions keep their category name, but it will no longer be
                        available for new transactions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(c)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <AppShell
      title="Categories"
      subtitle="Organise your income and expenses"
      actions={
        <Button variant="outline" size="sm" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Add Category
        </Button>
      }
    >
      {isLoading ? (
        <LoadingBlock rows={6} />
      ) : isError || !categories ? (
        <ErrorBlock />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {renderGroup("Expense Categories", expense)}
          {renderGroup("Income Categories", income)}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle>
            <DialogDescription>Categories group your transactions for reports and budgets.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Groceries"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["EXPENSE", "INCOME"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setType(option)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      type === option
                        ? "border-primary bg-secondary text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {option === "EXPENSE" ? "Expense" : "Income"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
