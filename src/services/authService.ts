import {
  ApiError,
  delay,
  isMockMode,
  newId,
  readStore,
  request,
  setAuthToken,
  writeStore,
} from "./apiClient";
import type { User } from "@/types";

const SESSION_KEY = "pennywise.session";
const ACCOUNTS_KEY = "pennywise.accounts";

interface Account extends User {
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

const demoAccount: Account = {
  id: "u_demo",
  name: "Maya Sharma",
  email: "demo@pennywise.app",
  password: "demo1234",
};

function accounts(): Account[] {
  return readStore<Account[]>(ACCOUNTS_KEY, [demoAccount]);
}

export function getSession(): User | null {
  return readStore<User | null>(SESSION_KEY, null);
}

/** POST /api/auth/login */
export async function login(email: string, password: string): Promise<User> {
  if (!isMockMode) {
    const res = await request<AuthResponse>("POST", "/auth/login", { email, password });
    setAuthToken(res.token);
    writeStore(SESSION_KEY, res.user);
    return res.user;
  }
  const account = accounts().find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!account || account.password !== password) {
    throw new ApiError("Incorrect email or password", 401);
  }
  const user: User = { id: account.id, name: account.name, email: account.email };
  writeStore(SESSION_KEY, user);
  return delay(user);
}

/** POST /api/auth/register */
export async function register(name: string, email: string, password: string): Promise<User> {
  if (!isMockMode) {
    const res = await request<AuthResponse>("POST", "/auth/register", { name, email, password });
    setAuthToken(res.token);
    writeStore(SESSION_KEY, res.user);
    return res.user;
  }
  const list = accounts();
  if (list.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) {
    throw new ApiError("An account with that email already exists", 409);
  }
  const account: Account = {
    id: newId("u"),
    name: name.trim(),
    email: email.trim(),
    password,
  };
  writeStore(ACCOUNTS_KEY, [...list, account]);
  const user: User = { id: account.id, name: account.name, email: account.email };
  writeStore(SESSION_KEY, user);
  return delay(user);
}

export async function logout(): Promise<void> {
  setAuthToken(null);
  writeStore<User | null>(SESSION_KEY, null);
  return delay(undefined);
}
