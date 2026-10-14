# Pennywise — Spring Boot backend contract

The frontend talks to a separate Spring Boot REST API. Set `VITE_API_BASE_URL`
(e.g. `http://localhost:8080`) to enable backend mode; without it the app runs
on built-in demo storage in the browser.

Base path: `${VITE_API_BASE_URL}/api`

## Authentication

### POST /api/auth/register
Request: `{ "name": string, "email": string, "password": string }`
Response 200: `{ "token": string, "user": { "id": string, "name": string, "email": string } }`
Errors: 409 if the email already exists.

### POST /api/auth/login
Request: `{ "email": string, "password": string }`
Response 200: `{ "token": string, "user": { "id": string, "name": string, "email": string } }`
Errors: 401 on bad credentials.

The token is sent as `Authorization: Bearer <token>` on every request below.
The backend MUST resolve the user from the token and scope all data to that
user — never trust a userId sent from the client.

## Transactions

### GET /api/transactions
Response 200: `Transaction[]` for the authenticated user, any order.

### GET /api/transactions/{id}
Response 200: `Transaction`. Errors: 404 if not found or owned by another user.

### POST /api/transactions
Request: `{ "type": "INCOME" | "EXPENSE", "amount": number, "category": string, "date": "yyyy-mm-dd", "description": string }`
Response 200: the created `Transaction` (with server-generated `id`, `createdAt`, `updatedAt`).

### PUT /api/transactions/{id}
Request: same body as POST. Response 200: the updated `Transaction`.

### DELETE /api/transactions/{id}
Response 204 (empty body).

`Transaction` shape:
```json
{
  "id": "string",
  "type": "INCOME | EXPENSE",
  "amount": 120.0,
  "category": "Food",
  "date": "2026-10-14",
  "description": "Lunch at canteen",
  "createdAt": "2026-10-14T09:00:00Z",
  "updatedAt": "2026-10-14T09:00:00Z"
}
```
Amounts are rupees (number, paise allowed). Do not apply any currency conversion.

## Categories

### GET /api/categories
Response 200: `Category[]` — `{ "id": string, "name": string, "type": "INCOME" | "EXPENSE" }`.

### POST /api/categories
Request: `{ "name": string, "type": "INCOME" | "EXPENSE" }`. Response 200: created `Category`.
Errors: 409 on duplicate name+type.

### PUT /api/categories/{id}
Request: same as POST. Response 200: updated `Category`.

### DELETE /api/categories/{id}
Response 204.

## Budgets

### GET /api/budgets
Response 200: `Budget[]` — `{ "id": string, "month": "yyyy-mm", "amount": number }`.

### PUT /api/budgets/{month}
Creates or replaces the budget for month `yyyy-mm`.
Request: `{ "amount": number }`. Response 200: the saved `Budget`.

### DELETE /api/budgets/{month}
Response 204.

## WalletWise AI chat

### POST /api/chat
Request:
```json
{
  "message": "How much did I spend on food this month?",
  "history": [{ "role": "user" | "assistant", "content": "..." }]
}
```
Response 200: `{ "reply": string }`.

The backend should load the authenticated user's transactions and budgets from
the database, pass them as context to the AI provider, and return the answer.
The AI provider API key must live only in backend configuration
(e.g. `application.yml` / environment variable) — never in the frontend.

## Error format

All error responses should be JSON: `{ "message": "human readable message" }`.

## CORS

During development, allow the frontend origin (e.g. `http://localhost:5173` or
the Lovable preview origin) for the `/api/**` paths, including the
`Authorization` and `Content-Type` headers.
