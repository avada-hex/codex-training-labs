# Capstone CDSS Lab

This lab showcases a **clinical decision support** system where Codex analyzes vitals and symptoms, explains the reasoning (Understanding → Decomposing → Executing → Checking → Adjusting → Completed), and returns a risk score plus a care plan.

## Lab layout

- `backend/` – Express API exposing `POST /api/assess`; returns both the risk assessment payload and structured `stages` that mirror the agentic workflow.
- `frontend/` – Vite/React dashboard that submits vitals, animates the timeline, and renders cards for the risk and care plan so you can narrate Codex’s work.
- `docs/pipeline.md` – Full specification → coding → testing → deployment pipeline, including acceptance criteria and handoffs.
- `agent.md` – Captured agentic recording of decomposed tasks, prompts, adjustments, and verification steps.

## Running the stack

1. **Backend**
   ```powershell
   cd modules/module-08-capstone-project/labs/capstone-cdss/backend
   npm install
   npm run start
   ```
   Server starts on `http://localhost:4002` and serves `/api/assess`.

2. **Frontend**
   ```powershell
   cd modules/module-08-capstone-project/labs/capstone-cdss/frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5174`. Vite proxies `/api` to port 4002 so both services can run locally.

3. **Demonstration flow**
   - Enter sample vitals and symptom toggles; each submission triggers the Codex timeline.
   - The timeline updates stage badges/colors while the backend processes the request, so you can explain the agentic reasoning live.
   - Once the response arrives, the risk score, level, and care plan populate the cards so you can tie the timeline to the actual recommendation.
   - Use `docs/pipeline.md` and `agent.md` to guide a narrative that describes the specification → coding → testing → deployment pipeline and the agent adjustments.

## Teaching tips

- Walk through each stage badge while narrating the plan/prompt/code/test/adjust loop.
- Highlight the `docs/pipeline.md` file to explain the required specs (clinical goal, data expectations, acceptance criteria) before you code.
- Use `agent.md` during the wrap-up to mention how tasks were decomposed, how prompts guided each implementation phase, and what verification steps were run.
