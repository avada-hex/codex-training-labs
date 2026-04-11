# Parallel Execution Worktree Lab

This doc describes the **skills & threads** lab that sits next to the Module 05 theory so learners can inspect a full worktree, add/remove skills or threads, and watch Codex-style parallel execution unfold.

## Worktree overview
The `labs/parallel-worktree` folder is the runnable project. It simulates a Codex workflow where each **skill** is a focused helper (analysis, writing, formatting) and each **thread** groups several skills together to work on a single top-level task. Running the lab spawns every thread concurrently, so you can watch how Codex can merge parallel results without juggling actual prompts.

## Key folders
- `labs/parallel-worktree/skills`: JSON defs with `name`, `description`, `parameters`, and `durationMs`. Each file is a skill stub Codex could invoke.
- `labs/parallel-worktree/threads`: JSON defs with `name`, `description`, and `skills` (skill names to run sequentially inside the thread). Threads are executed in parallel using the runner script.
- `labs/parallel-worktree/parallel-runner.js`: The orchestrator. It loads the skill/thread files, runs each thread via `Promise.all`, logs the skill outputs, and simulates concurrency using `setTimeout`.

## Running the lab
1. `cd labs/parallel-worktree`
2. `npm install` (only needed once; there are no external dependencies, so this file just records metadata.)
3. `npm start` or `node parallel-runner.js`

The runner prints thread start/completion timestamps and a condensed result object for each thread. Because threads start at (roughly) the same time, you can track overlapping timing in the console logs.

## Adding or removing a skill (easy experimentation)
1. Add a new `.json` file to `skills/` with `name`, `description`, `parameters` (an array of inputs), and `durationMs` (millisecond delay).
2. Use the same `name` inside a thread definition so the runner knows which skill to invoke.
3. Delete a JSON file to remove a skill; the runner will throw an error if a thread still references it, which is a teachable moment about dependency checks.

## Adding or removing a thread (parallel branching)
1. Create a new `.json` file in `threads/` with `skills` listing the names from `skills/` you want to sequence.
2. Threads are independent workstreams, so you can add one that focuses on research, another on cleanup, and compare how they run together.
3. Delete a thread file to immediately retire that branch; rerunning the lab shows fewer parallel flows.

## Observing parallel execution
While the runner waits for each skill inside a thread (to simulate sequential subtasks), every thread kicks off simultaneously via `Promise.all`. Have learners change the `durationMs` values or add/remove skills/threads to see how concurrency changes without touching the orchestration logic.

## Study prompts
- What happens if two threads share the same skill name but expect different parameters? Try duplicating a skill file with a suffix to separate concerns.
- How could you visualize the logs? Extend the runner to write to a JSON trace file or console table.
- How would you translate a real Codex skill prompt into the `description` field so future learners know what to ask the model for?
