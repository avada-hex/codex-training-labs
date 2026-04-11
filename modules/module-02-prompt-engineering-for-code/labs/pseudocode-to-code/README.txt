# Lab: Convert Pseudocode to Working Code

This lab highlights how a Codex-style assistant can read a structured
pseudocode sketch and emit executable Python. The `src/pseudocode_converter.py`
script handles the translation, and the `samples/` folder contains
illustrative pseudocode sequences.

## Getting started

1. Read a sample from `samples/` (for example, `samples/sum_and_filter.pseudo`)
   to understand the pseudocode conventions (SET, FOR, IF, RETURN, PRINT, etc.).
2. Translate it with:
   ```
   python src/pseudocode_converter.py --input samples/sum_and_filter.pseudo \
     --output samples/sum_and_filter.py
   ```
3. Run the generated code to see the concrete behavior:
   ```
   python samples/sum_and_filter.py
   ```

Each `.pseudo` file lives next to the generated Python so you can see how
Codex would expand the sketch. Current samples:

- `sum_and_filter` — apply a threshold filter and sum the remaining values.
- `average_odds` — compute the average of odd numbers with conditional handling.
- `factorial` — translate a loop-based factorial routine and print the result.

If you prefer to skip writing the intermediate file, add `--exec` to the
translator call and it will execute the generated snippet directly.

## How to extend

- Add more statements to `src/pseudocode_converter.py` if your pseudocode
  introduces new keywords (e.g., REPEAT/UNTIL, WHILE).
- Use the sample pseudocode files as a starting point to experiment with
  richer control flow and conditional logic; the translator keeps track
  of indentation so it can emit nested blocks that behave like real Python.
