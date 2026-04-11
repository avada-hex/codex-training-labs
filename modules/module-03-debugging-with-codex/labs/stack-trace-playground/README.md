# Lab 3.1 – Explain and Fix Stack Traces

This lab pairs a lightweight React dashboard with an Express diagnostics service so you can practice translating a raw stack trace into actionable Codex-style feedback.

## Project layout

- `frontend/` — Vite-powered React UI with a textarea for pasting stack traces, sample traces to seed the activity, and a card that renders the returned diagnostic plus a patch preview.
- `backend/` — Express API that accepts `POST /stack-trace` payloads and returns a structured response (bad line, root cause, fix suggestion, patch preview). The service can be replaced with Codex once you are comfortable with the prompt flows.

## Getting started

1. `cd frontend && npm install && npm run dev` to start the React UI on `http://localhost:5173/`.
2. In another terminal, `cd backend && npm install && npm run dev` to run the diagnostics endpoint on port 4000.
3. The front end proxies API calls under `/api`, so you can submit traces without adjusting the fetch base URL.

## Lab steps

1. Paste a stack trace (real or contrived) into the textarea and click **Explain this trace**.
2. Read the returned diagnostic to identify the bad line, the root cause, and the patch suggestion. Use the patch preview to ground your remediation before applying it manually.
3. Discuss why Codex chose a particular fix vs. applying one you would write yourself.

## Exercise summary

Complete this checklist before wrapping up:

1. Run both the frontend and backend locally to confirm the UI renders a diagnostic card for at least three distinct traces (real or sample).
2. Collect five failing scenarios from your codebase or intentionally broken samples, and paste each trace into the debugger UI.
3. For every trace, document the returned root cause and replicate the patch preview in a separate note or document editor.
4. Reflect on any gaps between the automated suggestion and your manual fix—note them in the lab write-up so you can compare Codex’s reasoning next time.
