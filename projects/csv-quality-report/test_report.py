from pathlib import Path
import tempfile
import unittest
from report import inspect_csv


class ReportTests(unittest.TestCase):
    def test_sample(self):
        result = inspect_csv(Path(__file__).with_name("sample.csv"))
        self.assertEqual(result["rows"], 4)
        self.assertEqual(result["missing_cells"]["rain_mm"], 1)
        self.assertEqual(result["duplicate_rows"], 1)

    def test_malformed_and_quoted_cells(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "example.csv"
            path.write_text('name,value\n"A, B",1\nC\nD, \n', encoding="utf-8")
            result = inspect_csv(path)
            self.assertEqual(result["malformed_line_numbers"], [3])
            self.assertEqual(result["valid_rows"], 2)
            self.assertEqual(result["missing_cells"]["value"], 1)

    def test_duplicate_headers(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "example.csv"
            path.write_text('a,a\n1,2\n', encoding="utf-8")
            with self.assertRaises(ValueError):
                inspect_csv(path)


if __name__ == "__main__":
    unittest.main()
