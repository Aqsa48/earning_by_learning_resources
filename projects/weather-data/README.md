# Tell a small weather story

Turn two weeks of **synthetic** observations into a readable figure. This project teaches dates, units, missing measurements, and claims that stay within the evidence.

## Choose and plan

Help a reader see when rainfall was observed and how temperature changed in the sample. Plan two panels: rainfall bars and a temperature line. Keep missing readings visible. This invented dataset cannot support claims about a real station, forecasts, or long-term climate.

## Build

From the repository root, with Python 3.10 or later:

```sh
python -m venv .venv
# Activate the virtual environment for your operating system.
python -m pip install -r projects/weather-data/requirements.txt
python projects/weather-data/weather_plot.py --output weather-chart.png
python -m unittest discover -s projects/weather-data -v
```

If you downloaded the script and CSV together from the learning hub:

```sh
python weather-plot.py weather-sample.csv --output weather-chart.png
```

The output is a two-panel PNG. Missing temperature values break the line, and crosses identify missing rainfall. The script rejects duplicate or invalid dates, negative rainfall, nonfinite measurements, and malformed rows.

## Test the result

| Check | Expected result |
| --- | --- |
| Dates | 14, from 1–14 January 2026 |
| Rainfall readings | 12 observed, 2 missing |
| Measured rainfall total | 17 mm |
| Temperature readings | 13 observed, 1 missing |

A zero is an observed value. The measured total excludes missing observations; the complete period's rainfall is unknown. The observed mean uses only observed readings.

## Reflect and extend

Write one observation supported by the figure and one limitation. Ask a reader to find the missing days without your help. Record feedback in the [project log](../../PROJECT_LOG.md).

For a next version, document units for a public dataset you are allowed to use, add a cumulative chart that flags incomplete coverage, or compare plotting choices. Do not silently fill gaps with zero.

References: [Python csv](https://docs.python.org/3/library/csv.html), [Matplotlib quick start](https://matplotlib.org/stable/users/explain/quick_start.html).

The code and generated synthetic sample in this project use the MIT license in [LICENSE](LICENSE).
