import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "neutral" | "income" | "expense";
}) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon ? (
          <Icon
            className={cn(
              "h-4 w-4",
              tone === "income" && "text-income",
              tone === "expense" && "text-expense",
              tone === "neutral" && "text-primary",
            )}
          />
        ) : null}
      </div>
      <p
        className={cn(
          "num mt-2 font-display text-2xl font-semibold",
          tone === "income" && "text-income",
          tone === "expense" && "text-expense",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
