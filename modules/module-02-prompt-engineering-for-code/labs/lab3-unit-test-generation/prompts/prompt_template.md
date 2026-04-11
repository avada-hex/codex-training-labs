# Prompt Template: Generate pytest tests for a single function

Use the sections below when asking the assistant to write tests for `score_utils`. Fill in the `<...>` areas with the particular behavior you want to cover.

```
You are a pytest expert. Please inspect the following function and generate a new test module. Use clear test names, keep tests independent, and import only what is needed.

Function to test:
<copy or describe the entire `calculate_final_score` or `is_eligible_for_reward` function>

Behavior to assert:
- `<describe the basic happy path, e.g., bonus increases the score>`
- `<describe rounding expectations or tolerance>`
- `<describe default parameter behavior or threshold edge case>`

Constraints:
- Output valid Python using `pytest`.
- Require the assistant to assert floats with `pytest.approx` when rounding might be ambiguous.
- Keep the helper imports to the fewest possible.
```

After you get the generated module, compare it to `tests/test_score_utils.py` and note any missing cases or stylistic differences. If you add new cases, record them so the next learner can build on your prompt.
