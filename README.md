# Drugan's Drums & Guitars — Dashboard

Central dashboard and authentication hub for the Drugan's Drums & Guitars app suite.

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Seed the super admin user
npm run seed

# Start development (two terminals)
npm run dev:server   # Express API on :3000
npm run dev:client   # Vue dev server on :5173
```

Default super admin credentials (change in `.env`):
- **Email:** admin@drugansdrums.com
- **Password:** changeme123

## Project Structure

```
server/           Express API
  routes/auth.js    Login, logout, verify (SSO endpoint)
  routes/admin.js   User management (super_admin only)
  routes/users.js   User profile / settings
  middleware/auth.js JWT + role middleware
  db.js             SQLite via better-sqlite3
  seed.js           Creates initial super admin

client/           Vue 3 + Vite
  src/views/        Login, Dashboard, UserSettings, AdminSettings
  src/stores/auth.js Pinia auth store
  src/router/       Vue Router with auth guards
```

## Cross-Subdomain Auth (SSO)

Authentication works across all `*.drugansdrums.com` apps via a shared httpOnly cookie:

1. Set `COOKIE_DOMAIN=.drugansdrums.com` in `.env` for production
2. Other apps call `GET https://dashboard.drugansdrums.com/api/auth/verify` with `credentials: 'include'` to validate the user
3. Add each app's origin to `CLIENT_ORIGIN` (comma-separated) for CORS

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret for signing JWT tokens |
| `COOKIE_DOMAIN` | Cookie domain (`.drugansdrums.com` in prod, `localhost` for dev) |
| `PORT` | Server port (default: 3000) |
| `CLIENT_ORIGIN` | Allowed CORS origins (comma-separated) |
| `SUPER_ADMIN_EMAIL` | Super admin email for seed |
| `SUPER_ADMIN_PASSWORD` | Super admin password for seed |

## Production

```bash
npm run build   # Build Vue client
npm start       # Serve API + static client
```
