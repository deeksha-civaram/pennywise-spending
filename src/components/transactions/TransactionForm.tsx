import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { todayIso } from "@/utils/format";
import type { Category, TransactionInput, TransactionType } from "@/types";

const schema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .positive("Amount must be greater than 0")
    .max(10000000, "Amount looks too large"),
  category: z.string().min(1, "Select a category"),
  date: z.string().min(1, "Select a date"),
  description: z
    .string()
    .trim()
    .min(2, "Add a short description")
    .max(120, "Keep the description under 120 characters"),
});

export function TransactionForm({
  categories,
  initial,
  submitLabel,
  pending,
  onSubmit,
  onCancel,
}: {
  categories: Category[];
  initial?: TransactionInput;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (input: TransactionInput) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? "EXPENSE");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [description, setDescription] = useState(initial?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const options = categories.filter((c) => c.type === type);

  const handleType = (next: TransactionType) => {
    setType(next);
    if (!categories.some((c) => c.type === next && c.name === category)) setCategory("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      type,
      amount: Number(amount),
      category,
      date,
      description,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} className="panel max-w-xl space-y-5 p-5">
      <div className="space-y-2">
        <Label>Transaction type</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["EXPENSE", "INCOME"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleType(option)}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            inputMode="decimal"
            placeholder="e.g. 8000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {errors["amount"] ? <p className="text-xs text-destructive">{errors["amount"]}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          {errors["date"] ? <p className="text-xs text-destructive">{errors["date"]}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {options.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors["category"] ? <p className="text-xs text-destructive">{errors["category"]}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="e.g. House rent paid to owner"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors["description"] ? (
          <p className="text-xs text-destructive">{errors["description"]}</p>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
