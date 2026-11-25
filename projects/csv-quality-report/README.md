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
