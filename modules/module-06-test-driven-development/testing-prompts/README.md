# Testing prompts for the ToDo stack

This directory documents the second pass: how to generate test cases (or prompts for Copilot/ChatGPT/other test writers) covering every major testing prism that applies to the React + Node ToDo app.

For each testing type below you will find a short description plus example prompts or command templates you could feed to a test generator, describe-coded test suite, or creative partner.

---

## 1. Unit testing
- Focus: isolate single functions (backend validation, task state toggling) without touching the network.
- Prompt: "Write Jest tests for `validateTaskPayload` in `backend/src/index.js` that cover a valid title, missing title, and whitespace-only title."
- Alternative: "Create one Jest test that asserts `toggleCompletion` flips `task.completed` for an in-memory task list." 

## 2. Integration testing
- Focus: server + persistence layer (here the in-memory list) to ensure endpoints behave end-to-end.
- Prompt: "Using Supertest, implement integration tests that POST `/tasks`, assert a 201 response, then GET `/tasks` to verify the created task is present and uncompleted."
- Option: "Write a Mocha suite that exercises the POST and PATCH endpoints in sequence to confirm toggling clears the completed flag as expected."

## 3. End-to-end testing
- Focus: full user story including UI and backend.
- Prompt: "Draft a Cypress test where the user fills the React form, submits it, sees the new task in the list, and marks it completed, while validations check for backend responses."
- Option: "Create a Playwright script that launches the frontend, hits the form, and asserts the visual state after toggling completion."

## 4. Front-end testing
- Focus: the React components and local state logic.
- Prompt: "Generate React Testing Library tests that verify: (a) the form is required, (b) submitting with valid data clears inputs, (c) pressing the completion button toggles text."
- Option: "Use Jest DOM to assert the `status` message updates when the backend mock returns success or error."

## 5. API testing
- Focus: contract-level behavior of the Node server.
- Prompt: "Write Postman/Newman tests validating `GET /tasks` returns JSON array, `POST /tasks` requires `title`, and `PATCH /tasks/:id/complete` returns 404 for missing IDs."
- Option: "Describe OpenAPI schema assertions that `POST /tasks` responds with schema containing `id`, `title`, `createdAt`, etc."

## 6. Performance testing
- Focus: request throughput, response time under load.
- Prompt: "Suggest a k6 script that ramps up to 50 virtual users POSTing different tasks and measures the 95th percentile response time."
- Alternative: "Use Artillery to run 200 sequential GET requests and fail if median response time exceeds 150ms."

## 7. Security testing
- Focus: input validation, CORS, and payload sanitization.
- Prompt: "Describe how to fuzz `POST /tasks` with script injections or long titles and assert the API rejects unsafe payloads with 400 responses."
- Option: "Propose an OWASP ZAP scan configuration that targets the `/tasks` endpoint and reports on open redirects or injection flaws."

## 8. Regression testing
- Focus: detect new bugs after updates.
- Prompt: "Create a regression suite that replays unit, integration, and UI tests for the create and toggle flows, tagging them so pipelines can pick them up."
- Option: "Outline a GitHub Actions job that runs `npm run test` (frontend) and `node backend/src/index.test.js` after every deployment."

## 9. Smoke testing
- Focus: quick sanity checks before deeper suites.
- Prompt: "List shell commands that hit `/tasks` endpoints once to ensure the server starts, e.g., `curl http://localhost:4000/tasks` and `curl -X POST ...` verifying 201."
- Option: "Script a simple test that launches `npm run dev`, waits for the Vite server, then navigates to `/` and checks the page loads." 

## 10. Acceptance testing
- Focus: business-level requirements (user journey from form to backend record).
- Prompt: "Write a Cucumber feature describing the flow where a user adds a task through the UI and sees it stored in the backend list."
- Option: "Draft a QA checklist ensuring the React form submits, the backend shares the saved task, and completed state toggles persist."
