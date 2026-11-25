# Build a CSV quality report

Make a small tool for someone who needs to check a CSV before analysis. This complete first version reports empty cells, exact duplicate rows, and malformed row lengths. It uses Python's standard library and never uploads data.

From the repository root, using Python 3.10 or later:

```sh
python projects/csv-quality-report/report.py projects/csv-quality-report/sample.csv
python projects/csv-quality-report/report.py projects/csv-quality-report/sample.csv --output quality.json
python -m unittest discover -s projects/csv-quality-report -v
```

The synthetic sample has **4 rows**, **1 missing `rain_mm` cell**, **1 duplicate row**, and **no malformed lines**. Empty or whitespace-only cells count as missing; zero is observed data. Duplicate detection compares exact cell strings. It does not normalize dates, numbers, or spaces. Missing counts and duplicates exclude malformed rows, reported by physical CSV line number.

The script stores unique rows in memory, so use it for small local datasets. It does not infer types, validate units, or replace domain-specific checks.

## Choose, plan, build, reflect

- **Choose:** help a learner inspect rainfall observations before plotting.
- **Plan:** produce a readable JSON report. Leave automatic corrections and large-file processing for later.
- **Build:** run the sample, inspect the code, then try a CSV you are allowed to use.
- **Reflect:** ask someone whether the report explains what to check next. Record feedback in the [project log](../../PROJECT_LOG.md).

## Extend one behavior

Pick one: support a missing token such as `NA`, add a JSON schema, or count unique values per column. Write an input and expected output before changing the script. Add the example and test to a pull request.

This project can demonstrate a useful skill. Completing it does not establish demand or guarantee paid work.

## Worked example

Open the [interactive CSV lesson](https://aqsabrohi.me/earning_by_learning_resources/#project=csv-quality), or follow these steps locally. No additional Python packages are needed.

### Predict the original sample

Read [sample.csv](sample.csv) before running the tool. The header names three columns; the four following rows are data. One rainfall cell is empty. Two rows contain measured zero rainfall; these cells are present. The last row exactly repeats the preceding row, adding one duplicate.

From the repository root:

```sh
python projects/csv-quality-report/report.py projects/csv-quality-report/sample.csv --output quality.json
```

If you downloaded the script and sample from the website into one folder, use:

```sh
python csv-report.py csv-sample.csv --output quality.json
```

Open `quality.json` in a text editor. These fields should match; `file` depends on your input filename, and `definitions` supplies descriptive metadata:

```json
{
  "rows": 4,
  "valid_rows": 4,
  "columns": ["station", "date", "rain_mm"],
  "missing_cells": {"station": 0, "date": 0, "rain_mm": 1},
  "duplicate_rows": 1,
  "malformed_line_numbers": []
}
```

On the website, choose **Original rainfall sample** and paste the JSON into **Your JSON quality report**, then select **Check my report**. Alternatively, run **Try sample CSV** and select **Use current checker report**. Eight checks compare row counts, column order, each column's missing count, duplicates, and malformed line numbers. File names and descriptive metadata are ignored. Passing verifies this exercise's expected fields, not correctness on all possible CSVs. The existing Python playground has a separate three-row experiment; its printed output is not this JSON report.

### Try an edge case before reading its solution

Use [edge-cases.csv](edge-cases.csv). Predict how the quoted comma, whitespace-only cell, and short final row affect the report. Then run:

```sh
python projects/csv-quality-report/report.py projects/csv-quality-report/edge-cases.csv --output edge-quality.json
```

For website downloads in one folder:

```sh
python csv-report.py csv-edge-cases.csv --output edge-quality.json
```

Choose **Quoted comma and malformed row** in the browser lesson and paste your output. You can also upload the selected exercise CSV to the browser checker and use its current report.

<details>
<summary>Explain the edge-case result</summary>

There are **5 data rows**, **4 well-formed rows**, **1 missing rainfall cell**, **1 duplicate**, and **1 malformed row starting on physical line 6**. The quoted `"Alpine, A"` station is one field. The whitespace-only rainfall cell counts as missing. The last row has two cells instead of three: report it separately and exclude it from missing and duplicate counts. All other expected fields match the original sample.

</details>

### Common mistakes

| Symptom | What to check |
| --- | --- |
| Five rows reported for the original sample | Exclude the header from data rows. |
| Three missing rainfall cells in the original sample | Test for trimmed empty text; zero is a real observation. |
| The quoted station becomes two columns | Use `csv.reader`, not `line.split(',')`. |
| Two duplicates instead of one | Count repeats after the first occurrence. |
| The short edge-case row adds a missing cell | Separate malformed row lengths before counting missing cells. |
| `NA` unexpectedly counts as observed | This version treats `NA` as text. Add an explicit missing-token rule and test if needed. |

### Make one change and keep the evidence

Change one observed rainfall value to an empty cell in a copy of the sample. Predict the new missing count, run the checker, and record the actual result. Run the repository tests after changing your implementation:

```sh
python -m unittest discover -s projects/csv-quality-report -v
```

Record the input, expected result, actual result, and one limitation in your [project log](../../PROJECT_LOG.md). The website leaves your project checkboxes under your control.
