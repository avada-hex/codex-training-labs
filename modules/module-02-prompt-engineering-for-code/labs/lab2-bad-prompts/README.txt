# Lab 2: Bad Prompt Detective

This lab explores how small mistakes in prompt writing can derail Codex-style assistants and how precise prompts rescue the task.

## What to do

1. Read each entry in `prompt_pairs.md` and identify why the “Bad prompt” either omits details, uses ambiguous language, or makes assumptions Codex can’t fulfill reliably.
2. Compare the “Improved prompt” column and note the specific changes (added constraints, explicit output format, clear step-by-step instructions, etc.).
3. Use the checklist in `prompt_checklist.txt` to rate how well your own prompts avoid the same pitfalls.
4. (Optional) Try feeding the improved prompt to your current assistant and compare the outputs to what you’d expect from the original version.

## Learning goals

- Recognize ambiguity, missing context, and vagueness in prompts.
- Learn to add structure, persona framing, or explicit examples so Codex can deliver precise output.
- Practice iterating on prompts: start with a rough version, then add clarifications until it behaves consistently.

## Workshop ideas

1. Pair up learners and have one read a “bad prompt” aloud while the other uses the checklist to propose at least two improvements; swap roles so everyone practices spotting problems.
2. Run a live demo: feed the bad prompt to Codex, capture the unexpected output, then rerun with the improved prompt and highlight the differences.
3. Maintain a shared board (Doc or whiteboard) for new prompt pitfalls discovered during the session so future iterations expand `prompt_pairs.md`.
