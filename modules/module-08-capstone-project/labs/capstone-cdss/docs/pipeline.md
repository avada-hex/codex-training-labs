# Capstone CDSS Pipeline

## 1. Specification

- **Goal:** Surface a single-page dashboard where clinicians input vitals/symptoms and receive an explainable risk score and care-plan trigger.
- **Data shape:** Numeric vitals (heart rate, respiratory rate, temperature, systolic/diastolic BP, oxygen saturation) plus a checklist of symptoms; payload must map to `POST /api/assess`.
- **Acceptance criteria:** API returns `{ assessment, stages }`, with `assessment` containing `riskScore`, `riskLevel`, `carePlan`, `summary`, and `contributors`, and `stages` enumerating the six agentic steps with statuses/metrics.

## 2. Coding

- **Backend:** Build `backend/src` with helpers for input validation, risk scoring heuristics, and stage construction. The router orchestrates the pipeline, logging each stage and returning both the assessment and structured stage metadata for the frontend.
- **Frontend:** Create a Vite/React dashboard that displays the stage timeline and result cards, animates stage progression while the backend is processing, and gracefully surfaces errors when missing fields or the API fails.

## 3. Testing

- **Unit/Helper tests:** Jest tests for the risk evaluator (score thresholds, symptom weighting) and stage builder (stage ordering/status). Place tests under `backend/tests`.
- **Integration:** Supertest hits `/api/assess` with valid and invalid data to verify status codes, JSON shape, and stage metadata.
- **Manual/UI:** Run the frontend dev server, submit sample vitals, and confirm the timeline updates, the backend response is shown, and the cards describe the risk/care plan.

## 4. Deployment checklist

1. Run `npm run build` in the backend/frontends. (Backend has no bundler; ensure Node dependencies installed.)
2. Start the backend via `npm run start` and verify `http://localhost:4002/api/assess` responds with JSON.
3. Serve the frontend via `npm run preview` or deploy the Vite build to any static host; ensure it proxies to the backend.
4. Demonstrate agentic workflow by showing the timeline + cards in the README while narrating the spec → implementation → testing → deployment story.
