from pathlib import Path
import tempfile
import unittest
from weather_plot import read_weather, summarize


class WeatherTests(unittest.TestCase):
    def test_synthetic_sample(self):
        data = read_weather(Path(__file__).with_name('sample.csv'))
        self.assertEqual(len(data), 14)
        rain = summarize(data, 'rain_mm')
        self.assertEqual(rain['observed'], 12)
        self.assertEqual(rain['missing'], 2)
        self.assertEqual(rain['total'], 17)
        self.assertAlmostEqual(rain['mean'], 17/12)

    def test_invalid_measurements_and_dates(self):
        for row in ['2026-01-01,-1,2', '2026-01-01,inf,2', '2026-02-30,1,2', '2026-01-01,1']:
            with self.subTest(row=row), tempfile.TemporaryDirectory() as folder:
                path = Path(folder)/'bad.csv'
                path.write_text('date,rain_mm,temp_c\n'+row+'\n', encoding='utf-8')
                with self.assertRaises(ValueError):
                    read_weather(path)

    def test_missing_values_remain_missing(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)/'empty-values.csv'
            path.write_text('date,rain_mm,temp_c\n2026-01-01,,\n', encoding='utf-8')
            summary = summarize(read_weather(path), 'rain_mm')
            self.assertIsNone(summary['total'])
            self.assertIsNone(summary['mean'])


if __name__ == '__main__':
    unittest.main()
