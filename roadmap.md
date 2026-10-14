# Pennywise — roadmap

## Base (from Pixel Perfect)
- [x] Copy existing app code (dashboard, services, hooks, components, INR formatting)
- [ ] Wire AuthProvider + Pennywise branding into root route
- [ ] Verify dashboard builds and renders

## Pages
- [ ] Transactions list (search, filters, sort, pagination, edit, delete)
- [ ] Add / Edit transaction forms
- [ ] Categories CRUD
- [ ] Budgets page (INR, period spending, remaining, daily suggestion, 50/75/90/100% alerts)
- [ ] Reports page (date range, charts, CSV export)
- [ ] Settings page

## Spring Boot backend integration
- [ ] Configurable API base URL (VITE_API_BASE_URL) with mock fallback
- [ ] Real HTTP transport for auth, transactions, categories, budgets
- [ ] Token-based auth header handling, per-user isolation (backend-enforced)
- [ ] Document required endpoints in BACKEND.md

## WalletWise AI chatbot
- [ ] Chat page with suggested questions
- [ ] Server-side AI call via Lovable AI Gateway (no keys in frontend)
- [ ] Answers grounded in user's real transactions/budgets
- [ ] Expense-draft detection with confirm-before-save

## Verification
- [ ] Build clean, all routes render
- [ ] INR formatting everywhere, no $ symbols
- [ ] Final report: working vs mock vs missing backend endpoints
