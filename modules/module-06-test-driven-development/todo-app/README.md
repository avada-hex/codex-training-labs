# ToDo App (Module 06)

This repo demonstrates a simple ToDo experience built in two parts:

1. **Backend** – a Node/Express API under `backend/` that keeps tasks in memory, exposes `GET /tasks`, `POST /tasks`, and `PATCH /tasks/:id/complete`, and logs errors.
2. **Frontend** – a Vite-powered React app under `frontend/` that lets the user submit new tasks (title, due date, notes), displays the backend-backed list, and toggles completion.

## Running the stack

### Backend

```powershell
cd modules/module-06-test-driven-development/todo-app/backend
npm install
npm run start
```

Server listens on port `4000` by default. The app logs a confirmation message once it is ready.

### Frontend

```powershell
cd modules/module-06-test-driven-development/todo-app/frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser. The frontend uses `VITE_API_BASE` (defaults to `http://localhost:4000`) when calling the backend. Set it before `npm run dev` if you need to point to a different host or port, for example `set VITE_API_BASE=http://localhost:4000` on Windows or `export VITE_API_BASE=http://localhost:4000` on macOS/Linux.

### Flow

- Submit a task through the form; the frontend posts to `/tasks` and immediately prepends the response to the list.
- Click the action button on a task card to toggle its `completed` flag via `PATCH /tasks/:id/complete`.

The backend uses an in-memory array, so restarting the server clears the list.
