import type { Budget, Category, Transaction } from "@/types";

const USER_ID = "u_demo";

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const now = new Date();
const Y = now.getFullYear();
const M = now.getMonth() + 1;
const prev = new Date(Y, M - 2, 1);
const PY = prev.getFullYear();
const PM = prev.getMonth() + 1;
const prev2 = new Date(Y, M - 3, 1);
const P2Y = prev2.getFullYear();
const P2M = prev2.getMonth() + 1;

export const seedCategories: Category[] = [
  { id: "c1", userId: USER_ID, name: "Salary", type: "INCOME" },
  { id: "c2", userId: USER_ID, name: "Freelance", type: "INCOME" },
  { id: "c3", userId: USER_ID, name: "Other", type: "INCOME" },
  { id: "c4", userId: USER_ID, name: "Food", type: "EXPENSE" },
  { id: "c5", userId: USER_ID, name: "Groceries", type: "EXPENSE" },
  { id: "c6", userId: USER_ID, name: "Rent", type: "EXPENSE" },
  { id: "c7", userId: USER_ID, name: "Electricity", type: "EXPENSE" },
  { id: "c8", userId: USER_ID, name: "Mobile Recharge", type: "EXPENSE" },
  { id: "c9", userId: USER_ID, name: "Internet", type: "EXPENSE" },
  { id: "c10", userId: USER_ID, name: "Transport", type: "EXPENSE" },
  { id: "c11", userId: USER_ID, name: "Fuel", type: "EXPENSE" },
  { id: "c12", userId: USER_ID, name: "Shopping", type: "EXPENSE" },
  { id: "c13", userId: USER_ID, name: "Healthcare", type: "EXPENSE" },
  { id: "c14", userId: USER_ID, name: "Education", type: "EXPENSE" },
  { id: "c15", userId: USER_ID, name: "Entertainment", type: "EXPENSE" },
  { id: "c16", userId: USER_ID, name: "EMI", type: "EXPENSE" },
  { id: "c17", userId: USER_ID, name: "Travel", type: "EXPENSE" },
  { id: "c18", userId: USER_ID, name: "Other", type: "EXPENSE" },
];

type Row = [Transaction["type"], number, string, string, "cur" | "prev" | "prev2", number];

const rows: Row[] = [
  // current month
  ["INCOME", 35000, "Salary", "Monthly salary credited", "cur", 1],
  ["INCOME", 6500, "Freelance", "Website work for local shop", "cur", 12],
  ["EXPENSE", 8000, "Rent", "House rent paid to owner", "cur", 2],
  ["EXPENSE", 2500, "Groceries", "Monthly kirana store bill", "cur", 3],
  ["EXPENSE", 1800, "Electricity", "Electricity bill", "cur", 5],
  ["EXPENSE", 399, "Mobile Recharge", "Prepaid recharge — 84 days", "cur", 5],
  ["EXPENSE", 799, "Internet", "Broadband monthly plan", "cur", 6],
  ["EXPENSE", 2000, "Fuel", "Petrol for two-wheeler", "cur", 7],
  ["EXPENSE", 1500, "Food", "Lunch and tea at office", "cur", 8],
  ["EXPENSE", 700, "Transport", "Auto and bus fare", "cur", 9],
  ["EXPENSE", 1200, "Shopping", "Clothes from local market", "cur", 11],
  ["EXPENSE", 450, "Entertainment", "Movie tickets", "cur", 13],
  ["EXPENSE", 3500, "EMI", "Laptop EMI", "cur", 15],
  ["EXPENSE", 600, "Healthcare", "Medicines from pharmacy", "cur", 16],
  ["EXPENSE", 950, "Food", "Weekend dinner with family", "cur", 18],
  // previous month
  ["INCOME", 35000, "Salary", "Monthly salary credited", "prev", 1],
  ["INCOME", 4000, "Freelance", "Logo design project", "prev", 14],
  ["EXPENSE", 8000, "Rent", "House rent paid to owner", "prev", 2],
  ["EXPENSE", 2350, "Groceries", "Monthly kirana store bill", "prev", 4],
  ["EXPENSE", 1650, "Electricity", "Electricity bill", "prev", 5],
  ["EXPENSE", 399, "Mobile Recharge", "Prepaid recharge", "prev", 6],
  ["EXPENSE", 799, "Internet", "Broadband monthly plan", "prev", 6],
  ["EXPENSE", 1800, "Fuel", "Petrol for two-wheeler", "prev", 8],
  ["EXPENSE", 1700, "Food", "Office canteen and snacks", "prev", 10],
  ["EXPENSE", 3500, "EMI", "Laptop EMI", "prev", 15],
  ["EXPENSE", 2200, "Travel", "Weekend trip bus tickets", "prev", 20],
  // two months ago
  ["INCOME", 35000, "Salary", "Monthly salary credited", "prev2", 1],
  ["EXPENSE", 8000, "Rent", "House rent paid to owner", "prev2", 2],
  ["EXPENSE", 2600, "Groceries", "Monthly kirana store bill", "prev2", 4],
  ["EXPENSE", 2100, "Electricity", "Electricity bill (summer)", "prev2", 5],
  ["EXPENSE", 3500, "EMI", "Laptop EMI", "prev2", 15],
  ["EXPENSE", 5200, "Education", "Online course fee", "prev2", 18],
  ["EXPENSE", 1400, "Food", "Eating out", "prev2", 21],
];

export const seedTransactions: Transaction[] = rows.map(
  ([type, amount, category, description, when, day], i) => {
    const date =
      when === "cur" ? iso(Y, M, day) : when === "prev" ? iso(PY, PM, day) : iso(P2Y, P2M, day);
    const stamp = `${date}T09:00:00.000Z`;
    return {
      id: `t${i + 1}`,
      userId: USER_ID,
      type,
      amount,
      category,
      date,
      description,
      createdAt: stamp,
      updatedAt: stamp,
    };
  },
);

export const seedBudgets: Budget[] = [
  { id: "b1", userId: USER_ID, month: `${Y}-${String(M).padStart(2, "0")}`, amount: 25000 },
];

export const DEMO_USER_ID = USER_ID;
