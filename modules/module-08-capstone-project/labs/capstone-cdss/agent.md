# Agentic Narration

## Task decomposition

1. **Understand the requirement** – Codex interprets “build a CDSS that ingests vitals/symptoms and recommends a care plan with explainable steps.”
2. **Break into subtasks** – Validate payload → compute risk score → generate stage metadata → build frontend timeline + result cards → document pipeline and agentic log.
3. **Plan prompts/code** – Prompt for an Express route plus helper modules (validators, risk heuristics, stage builder) and a React/Vite dashboard with a timeline component.

## Execution log

- **Code prompts:** Guided Codex to generate `evaluateRisk`, stage builder, and timeline component; each prompt specified expected stage names, status semantics, and metrics to include.
- **Tests prompts:** Asked Codex to create Jest/Supertest tests verifying the risk level logic and `/api/assess` behavior; the test suite ensures stage order and stage statuses.
- **Manual verification:** Ran the frontend to confirm stages animate, the risk/care card populates, and errors show when vitals are missing.

## Checks & adjustments

- **Checking stage:** Backend stage builder sets `Checking` to `warning` when risk is High; this stage logs the verification step and is echoed in the UI timeline.
- **Adjusting stage:** When risk exceeds the safe threshold, stage details state the alert plan; otherwise, the stage is skipped with a message about continued monitoring.
- **Completed stage:** Always confirms the final risk level and care plan, so the UI can reference it when narrating the final outcome.

## Deployment reflection

The pipeline notes in `docs/pipeline.md` capture the spec → coding → testing → deployment flow. Use the README to narrate how Codex planned the job, executed it, verified it, and then kept adjusting the timeline until completion.
