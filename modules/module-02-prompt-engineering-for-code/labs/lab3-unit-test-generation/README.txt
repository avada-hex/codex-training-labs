# Lab 3: Generate Unit Tests from a Function

This lab guides you through designing prompts that turn a pure function into trustworthy unit tests. You will explore how to frame the behavior, edge cases, and formatting expectations so that a Codex-style assistant emits pytest-ready code.

## Files

- `src/score_utils.py` contains two helper functions along with docstrings that explain the intended behavior. Treat the docstrings as part of the prompt context when you ask for tests.
- `tests/test_score_utils.py` is the reference implementation of the tests you want the assistant to produce. Use it as a benchmark, but try crafting a prompt that generates similar coverage without looking at the file first.
- `prompts/prompt_template.md` holds a reusable prompt structure and a suggested handshake for requesting pytest cases.

## What to do

1. Inspect `src/score_utils.py` and summarize the behavior you need to preserve—bonus calculation, rounding, reward thresholds, etc.
2. Read `prompts/prompt_template.md`, then fill in the placeholders with the function name, behaviors, and edge cases.
3. Feed your filled-in prompt (along with the function text if the prompt system requires it) to the assistant and compare the generated tests with the reference tests. Pay attention to assertions, rounding tolerances, and default parameter handling.
4. Optionally, run `pytest tests/test_score_utils.py` to see the expected output and to confirm that identical or equivalent tests pass.

## Learning goals

- Specify precise acceptance criteria so the assistant covers both standard and boundary cases.
- Use docstrings, function signatures, and example inputs to ground the assistant’s reasoning.
- Evaluate generated tests for clarity, independence, and pytest best practices.

## Workshop ideas

1. Split pairs: one person writes a short prompt, the other critiques the coverage before any code is generated.
2. Run two rounds of prompt refinement—start with a general request and then add constraints such as "use `pytest.approx`" or "keep fixtures minimal".
3. Share unexpected test cases the assistant produced and discuss whether they are valid additions.
