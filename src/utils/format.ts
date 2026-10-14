/** Indian-style formatting helpers: ₹ amounts with lakh/crore grouping, DD/MM/YYYY dates. */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const inrPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹1,50,000 — whole rupees unless the amount has paise. */
export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const hasPaise = Math.round(abs * 100) % 100 !== 0;
  return (hasPaise ? inrPaise : inr).format(abs);
}

/** +₹35,000 / −₹8,000 */
export function formatSigned(value: number, type: "INCOME" | "EXPENSE"): string {
  return `${type === "INCOME" ? "+" : "−"}${formatCurrency(value)}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

/** 05/04/2025 */
export function formatDate(iso: string): string {
  const [y = "", m = "", d = ""] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function monthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthDate(key: string): Date {
  const [y = "1970", m = "01"] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1);
}

export function monthLabel(key: string): string {
  return monthDate(key).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function shortMonthLabel(key: string): string {
  return monthDate(key).toLocaleDateString("en-IN", { month: "short" });
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function monthOf(iso: string): string {
  return iso.slice(0, 7);
}
