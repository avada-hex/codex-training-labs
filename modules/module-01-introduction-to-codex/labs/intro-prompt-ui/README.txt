Intro Prompt UI Lab · Todo List
------------------------------
This lab replaces the previous intro prompt UI with a lightweight todo list experience that demonstrates how to keep a React form in sync with a Node/Express API. The frontend submits new tasks to the backend, which retains them in memory and returns the updated list for display.

## Running the lab
1. Backend:
   ```
   cd modules/module-01-introduction-to-codex/labs/intro-prompt-ui/backend
   npm install
   npm start
   ```
   The server listens on port 5200 and exposes `/api/tasks` for both fetching and adding todo items.

2. Frontend:
   ```
   cd modules/module-01-introduction-to-codex/labs/intro-prompt-ui/frontend
   npm install
   npm run dev
   ```
   Vite serves the UI on `http://localhost:5175/` and proxies `/api` to the backend so the dev server can talk to the API without CORS issues.

Once both servers are running, open the frontend URL, type a task into the box, then click “Add Task” to see it appear at the top of the list.

## API surface overview
- `GET /api/tasks` — returns `{ tasks: [{ id, text }] }` with the newest entries first so the UI can render them immediately after loading.
- `POST /api/tasks` — accepts `{ text: string }`, rejects empty submissions with a 400 error, and replies with `{ task: { id, text } }`.

## Notes
- Tasks live only in memory. Stopping the backend clears the saved list.
- The frontend displays error banners if it cannot reach the backend or if the POST request is rejected, so you can see what needs to be fixed before retrying.
