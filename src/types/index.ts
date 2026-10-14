export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // yyyy-mm
  amount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface CategoryInput {
  name: string;
  type: TransactionType;
}
