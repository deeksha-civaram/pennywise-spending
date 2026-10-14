
/**
 * Transport layer.
 *
 * Two modes:
 *
 * 1. Backend mode — when VITE_API_BASE_URL is set,
 *    every service call becomes a real HTTP request to the Spring Boot API.
 *    The auth token is sent as a Bearer header.
 *
 * 2. Demo mode — a localStorage-backed mock.
 *
 * See BACKEND.md for the exact backend endpoints.
 */

export const API_BASE_URL = (
  import.meta.env["VITE_API_BASE_URL"] as string | undefined
)?.replace(/\/$/, "");

export const isMockMode = !API_BASE_URL;

const TOKEN_KEY = "pennywise.authToken";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;

  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

const LATENCY_MS = 220;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function delay<T>(
  value: T,
  ms = LATENCY_MS,
): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Makes a real HTTP request to the Spring Boot API.
 * Only used when not in mock mode.
 */
export async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getAuthToken();

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, options);
  } catch {
    throw new ApiError(
      "Could not reach the Pennywise server. Check that the backend is running.",
      0,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    // The response body was not JSON.
  }

  if (!response.ok) {
    const message =
      (payload as { message?: string } | null)?.message ??
      `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status);
  }

  return payload as T;
}
