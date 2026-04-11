# Module 3: Debugging with Codex (1 Hour)

## Focus
- Use Codex to explain runtime errors, including the root cause and remediation steps.
- Analyze stack traces and map them back to repository files.
- Craft prompts that help Codex fix runtime failures and harden the code.

## Labs structure (1–2 hours each)
> Labs rely on a tiny React dashboard that accepts stack traces or log entries, and a Node/Express backend that returns Codex-style explanations/fixes.

### Lab 3.1 – Explain and Fix Stack Traces (labs/stack-trace-playground)
- Deliverables: React textarea where students paste a stack trace; Node/Express endpoint returns structured diagnostics (bad line, root cause, fix suggestion) plus a patch preview.
- Learning: feed real stack traces, discuss why Codex recommends certain fixes, and compare improvements vs. manual debugging.

### Lab 3.2 – Buggy Scripts Rescue (labs/buggy-scripts-lab)
- Deliverables: minimal repository of 5 intentionally broken JavaScript/Node scripts; React UI lets students select a script, send the error to the backend, and review curated fixes.
- Learning: practice describing the desired behavior, reviewing code suggestions, and applying the fix in a controlled toy repo.

## Exercise summary
Ask participants to run the lab locally, collect five failing scripts, and document how Codex explained the root cause along with the patch it suggested.
