# Module 8: Capstone Project (2 Hours)

## Focus
- Apply everything learned so far to a realistic, domain-specific build.
- Frame requirements into prompts, generate the necessary code, and verify it via testing/debugging prompts.
- Encourage documenting the prompt history alongside the generated artifacts.

## Project options (choose one)
Each capstone lives under labs/capstone-<option> with a tiny React front/back seed.
1. **EHR API Development** (labs/capstone-ehr-api) – React form for creating patient records and a Node/Express API with sample routes (`POST /patients`, `GET /patients/:id`).
2. **Clinical Data Processing Pipelines** (labs/capstone-data-pipeline) – React UI to upload CSV/JSON and a Node worker that describes transformation steps through Codex prompts.
3. **Medical Coding Automation** (labs/capstone-med-coding) – React interface to paste clinical notes; Node backend that suggests ICD codes plus justification.
4. **Clinical Decision Support System** (labs/capstone-cdss) – React dashboard for symptoms and vitals, Node endpoint that recommends alerts or care plans. This lab ships pipeline documentation (`docs/pipeline.md`) and an agent log (`agent.md`) so students can narrate the plan → code → test → deploy story.

## Lab structure (1–2 hours)
- Each capstone starts from a minimal repo (single React page + single Express router) so you can focus on prompt design, test generation, and documentation.
- Write prompts for requirements → code → tests → debugging. Capture the conversation in a prompt-log file inside each lab folder.
- Use Module.md to sketch the workflow, highlight evaluation criteria (prompt clarity, correctness, test coverage), and outline the delivery steps for each option. For the CDSS lab, leverage `docs/pipeline.md` and `agent.md` when you teach the agentic narrative.
