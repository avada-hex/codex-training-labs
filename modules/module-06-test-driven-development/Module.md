# Module 6: Test-Driven Development (2 Hours)

## Focus
- Build a minimal React + Node ToDo stack so you can iterate quickly on features and keep server data in sync with the UI.
- Capture the testing story for each reliability layer (unit, integration, API, end-to-end, performance, security, regression, smoke, and acceptance).

## Labs structure (1–2 hours each)

### Lab 6.1 – ToDo first pass (todo-app)
- Deliverables: a React frontend running in Vite that submits tasks and reads the list maintained by a Node/Express backend with in-memory persistence.
- Learning: practice adding a task, hitting `/tasks`, and toggling completion while keeping the UI reactive to the saved state.

### Lab 6.2 – Testing second pass (testing-prompts)
- Deliverables: this folder lists example prompts and commands for generating automated test suites across all major categories (unit, integration, end-to-end, front-end, API, performance, security, regression, smoke, acceptance).
- Learning: clarify which inputs or prompts to feed to AIs or human writers when you want to capture each testing dimension for the stack.

## Module wrap-up
Point future work at `todo-app/README.md` for running instructions and `testing-prompts/README.md` for the testing prompts checklist. You can extend the backend with database storage or hook the test prompts folder into CI jobs when you formalize the suites.
