"""A dependency-free CSV quality report for small local datasets."""
import argparse
import csv
from collections import Counter
import json
from pathlib import Path


def inspect_csv(path):
    with Path(path).open(newline="", encoding="utf-8-sig") as stream:
        reader = csv.reader(stream)
        try:
            header = next(reader)
        except StopIteration:
            raise ValueError("CSV is empty") from None
        if not header or any(not name.strip() for name in header) or len(set(header)) != len(header):
            raise ValueError("CSV needs nonempty, unique column names")
        missing = Counter({name: 0 for name in header})
        seen, rows, duplicates, malformed = set(), 0, 0, []
        for row in reader:
            if not row:
                continue
            rows += 1
            if len(row) != len(header):
                malformed.append(reader.line_num)
                continue
            key = tuple(row)
            duplicates += key in seen
            seen.add(key)
            for name, value in zip(header, row):
                if not value.strip():
                    missing[name] += 1
    return {"file": Path(path).name, "rows": rows, "valid_rows": rows-len(malformed),
            "columns": header, "missing_cells": dict(missing), "duplicate_rows": duplicates,
            "malformed_line_numbers": malformed,
            "definitions": {"missing": "empty or whitespace-only cell", "duplicate": "exact repeated row among well-formed rows"}}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args(argv)
    try:
        if args.output and args.input.resolve() == args.output.resolve():
            raise ValueError("Output must differ from input")
        result = json.dumps(inspect_csv(args.input), indent=2) + "\n"
        if args.output:
            args.output.write_text(result, encoding="utf-8")
        else:
            print(result, end="")
        return 0
    except (OSError, ValueError, csv.Error) as exc:
        parser.exit(2, f"report: {exc}\n")


if __name__ == "__main__":
    raise SystemExit(main())
