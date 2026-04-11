"""Simple translator that turns heavily structured pseudocode into Python."""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Iterable, List, Optional


class PseudocodeTranslator:
    """Translate just enough pseudocode to demonstrate Codex-style conversion."""

    INDENT_KEYWORDS = {"FOR", "IF", "ELSE"}

    def __init__(self, indent_size: int = 4) -> None:
        self.indent_size = indent_size
        self.indent_level = 0
        self.block_stack: List[str] = []

    def translate(self, lines: Iterable[str]) -> List[str]:
        python_lines: List[str] = []
        for raw_line in lines:
            stripped = raw_line.strip()
            if not stripped or stripped.startswith("//"):
                continue

            upper = stripped.upper()

            end_match = re.match(r"END\s+(FOR|IF)", stripped, re.IGNORECASE)
            if end_match:
                self._close_block(end_match.group(1).upper())
                continue

            if upper == "ELSE":
                self._start_else()
                python_lines.append(self._format_line("else:"))
                self.indent_level += 1
                continue

            if set_line := self._translate_set(stripped):
                python_lines.append(self._format_line(set_line))
                continue

            if add_line := self._translate_add(stripped):
                python_lines.append(self._format_line(add_line))
                continue

            if print_line := self._translate_print(stripped):
                python_lines.append(self._format_line(print_line))
                continue

            if return_line := self._translate_return(stripped):
                python_lines.append(self._format_line(return_line))
                continue

            if for_line := self._translate_for(stripped):
                python_lines.append(self._format_line(for_line))
                self._push_block("FOR")
                continue

            if if_line := self._translate_if(stripped):
                python_lines.append(self._format_line(if_line))
                self._push_block("IF")
                continue

            raise ValueError(f"Unsupported pseudocode line: {stripped}")

        return python_lines

    def _format_line(self, code: str) -> str:
        """Add indentation for the current line."""
        return f"{' ' * (self.indent_level * self.indent_size)}{code}"

    def _push_block(self, block_type: str) -> None:
        self.block_stack.append(block_type)
        self.indent_level += 1

    def _close_block(self, block_type: str) -> None:
        if not self.block_stack:
            raise ValueError(f"No block to end for {block_type}")

        top = self.block_stack[-1]
        if block_type == "FOR" and top == "FOR":
            self.block_stack.pop()
            self.indent_level -= 1
            return

        if block_type == "IF":
            if top == "ELSE":
                self.block_stack.pop()
                self.indent_level -= 1
                top = self.block_stack[-1] if self.block_stack else None

            if top != "IF":
                raise ValueError("END IF found without matching IF")

            self.block_stack.pop()
            self.indent_level -= 1
            return

        raise ValueError(f"Trying to close unexpected block: {block_type}")

    def _start_else(self) -> None:
        if not self.block_stack or self.block_stack[-1] != "IF":
            raise ValueError("ELSE without matching IF")
        self.indent_level -= 1
        self.block_stack.append("ELSE")

    def _translate_set(self, line: str) -> Optional[str]:
        match = re.match(r"SET\s+([A-Za-z_][\w]*)\s+TO\s+(.+)", line, re.IGNORECASE)
        if not match:
            return None
        target = match.group(1)
        expr = self._translate_expression(match.group(2))
        return f"{target} = {expr}"

    def _translate_add(self, line: str) -> Optional[str]:
        match = re.match(r"ADD\s+(.+)\s+TO\s+(.+)", line, re.IGNORECASE)
        if not match:
            return None
        expr = self._translate_expression(match.group(1))
        target = match.group(2).strip()
        return f"{target} += {expr}"

    def _translate_print(self, line: str) -> Optional[str]:
        match = re.match(r"PRINT\s+(.+)", line, re.IGNORECASE)
        if not match:
            return None
        expr = self._translate_expression(match.group(1))
        return f"print({expr})"

    def _translate_return(self, line: str) -> Optional[str]:
        match = re.match(r"RETURN\s+(.+)", line, re.IGNORECASE)
        if not match:
            return None
        expr = self._translate_expression(match.group(1))
        return f"return {expr}"

    def _translate_for(self, line: str) -> Optional[str]:
        match = re.match(
            r"FOR\s+([A-Za-z_][\w]*)\s+FROM\s+(.+?)\s+TO\s+(.+?)(?:\s+STEP\s+(.+))?$",
            line,
            re.IGNORECASE,
        )
        if not match:
            return None
        var = match.group(1)
        start = self._translate_expression(match.group(2))
        end = self._translate_expression(match.group(3))
        python_line = f"for {var} in range({start}, {end} + 1"
        if match.group(4):
            step = self._translate_expression(match.group(4))
            python_line += f", {step}"
        python_line += "):"
        return python_line

    def _translate_if(self, line: str) -> Optional[str]:
        match = re.match(r"IF\s+(.+?)\s+THEN", line, re.IGNORECASE)
        if not match:
            return None
        expr = self._translate_expression(match.group(1))
        return f"if {expr}:"

    def _translate_expression(self, expr: str) -> str:
        expr = expr.strip()
        expr = re.sub(r"(?i)LENGTH\s*\(", "len(", expr)
        expr = self._replace_word(expr, "AND", "and")
        expr = self._replace_word(expr, "OR", "or")
        expr = self._replace_word(expr, "NOT", "not")
        expr = self._replace_word(expr, "MOD", "%")
        expr = self._replace_word(expr, "DIV", "//")
        expr = self._replace_word(expr, "TRUE", "True")
        expr = self._replace_word(expr, "FALSE", "False")
        expr = re.sub(r"(?<![<>=!])=(?![=])", "==", expr)
        return expr

    @staticmethod
    def _replace_word(text: str, word: str, replacement: str) -> str:
        pattern = re.compile(rf"(?<!\w){word}(?!\w)", re.IGNORECASE)
        return pattern.sub(replacement, text)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert limited pseudocode into executable Python."
    )
    parser.add_argument(
        "--input",
        "-i",
        required=True,
        type=Path,
        help="Pseudocode file to translate (plain text).",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        help="Optional path to write the generated Python snippet.",
    )
    parser.add_argument(
        "--exec",
        action="store_true",
        help="Execute the translated code after generation.",
    )
    parser.add_argument(
        "--indent",
        type=int,
        default=4,
        help="Number of spaces to use for indentation (default: 4).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not args.input.exists():
        raise FileNotFoundError(args.input)

    lines = args.input.read_text(encoding="utf-8").splitlines()
    translator = PseudocodeTranslator(indent_size=args.indent)
    python_lines = translator.translate(lines)
    code = "\n".join(python_lines) + "\n"

    if args.output:
        args.output.write_text(code, encoding="utf-8")
    else:
        print(code)

    if args.exec:
        exec_globals: dict[str, object] = {}
        exec(code, exec_globals)


if __name__ == "__main__":
    main()
