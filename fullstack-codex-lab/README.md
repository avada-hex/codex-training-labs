# Fullstack Codex Lab

## Setup

### Backend
cd backend-dotnet
dotnet run

> **Note:** The backend now enforces a secure JWT secret. Set the `FULLSTACK_CODEX_JWT_SECRET` environment variable (at least 32 characters) before running so `JwtSettings:Secret` is populated. The placeholder in the committed `appsettings*.json` files will cause the application to fail fast until a real secret is supplied.

### Frontend
cd frontend-react
npm install
npm start

## Responses & error handling

- The authentication endpoints always return a consistent `success`, `message`, and payload shape so clients can rely on friendly text (errors now include optional `details` entries and every success carries a helpful `message`).
- Unexpected server errors are captured by a centralized handler; the API emits a structured JSON error (with trace id and optional detail in development) and logs the exception before returning a 500 status.

## Tasks
- Implement login API with JWT
- Connect frontend
- Add validation
