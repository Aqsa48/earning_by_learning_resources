"""Plot a small daily-weather CSV without replacing missing readings with zero."""
import argparse
import csv
from datetime import date
import math
from pathlib import Path


def read_weather(path):
    with Path(path).open(newline='', encoding='utf-8-sig') as stream:
        reader = csv.DictReader(stream)
        if not reader.fieldnames or not {'date', 'rain_mm', 'temp_c'}.issubset(reader.fieldnames):
            raise ValueError('Expected date, rain_mm and temp_c columns')
        if len(set(reader.fieldnames)) != len(reader.fieldnames):
            raise ValueError('Column names must be unique')
        rows, dates = [], set()
        for row in reader:
            if None in row or any(value is None for value in row.values()):
                raise ValueError(f'Malformed row on line {reader.line_num}')
            day = date.fromisoformat(row['date'])
            if day.isoformat() != row['date']:
                raise ValueError('Dates must use YYYY-MM-DD format')
            if day in dates:
                raise ValueError('Dates must be unique')
            dates.add(day)
            values = []
            for key in ['rain_mm', 'temp_c']:
                value = float(row[key]) if row[key].strip() else None
                if value is not None and not math.isfinite(value):
                    raise ValueError('Measurements must be finite or empty')
                values.append(value)
            if values[0] is not None and values[0] < 0:
                raise ValueError('Rainfall cannot be negative')
            rows.append({'date': day, 'rain_mm': values[0], 'temp_c': values[1]})
    if not rows:
        raise ValueError('Dataset has no observations')
    return sorted(rows, key=lambda row: row['date'])


def summarize(rows, metric):
    values = [row[metric] for row in rows if row[metric] is not None]
    return {'observed': len(values), 'missing': len(rows)-len(values),
            'total': sum(values) if values else None,
            'mean': sum(values)/len(values) if values else None}


def plot_weather(rows, output):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    dates = [row['date'] for row in rows]
    figure, axes = plt.subplots(2, 1, figsize=(10, 6), sharex=True, layout='constrained')
    rainfall = [row['rain_mm'] if row['rain_mm'] is not None else float('nan') for row in rows]
    temperatures = [row['temp_c'] if row['temp_c'] is not None else float('nan') for row in rows]
    axes[0].bar(dates, rainfall, color='#5064ce')
    missing_dates = [row['date'] for row in rows if row['rain_mm'] is None]
    if missing_dates:
        axes[0].scatter(missing_dates, [0]*len(missing_dates), marker='x', color='#c84a32', label='Missing rainfall (not zero)')
        axes[0].legend()
    axes[0].set_ylabel('Rainfall (mm)')
    axes[0].set_title('Synthetic daily weather — learning example')
    axes[1].plot(dates, temperatures, marker='o', color='#ba442e')
    axes[1].set_ylabel('Temperature (°C)')
    axes[1].set_xlabel('Date')
    figure.autofmt_xdate()
    figure.savefig(output, dpi=160)
    plt.close(figure)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', nargs='?', type=Path, default=Path(__file__).with_name('sample.csv'))
    parser.add_argument('--output', type=Path, default=Path('weather-chart.png'))
    args = parser.parse_args(argv)
    try:
        if args.input.resolve() == args.output.resolve():
            raise ValueError('Output must differ from input')
        rows = read_weather(args.input)
        plot_weather(rows, args.output)
        print('Rainfall:', summarize(rows, 'rain_mm'))
        print('Temperature:', summarize(rows, 'temp_c'))
        print(f'Saved {args.output}')
        return 0
    except (OSError, ValueError, csv.Error) as error:
        parser.exit(2, f'weather: {error}\n')


if __name__ == '__main__':
    raise SystemExit(main())
