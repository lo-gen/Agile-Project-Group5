import argparse
import ast
import csv
import json
import re
import sys
from pathlib import Path
from typing import Any


def load_valid_iata_codes(routes_path: Path) -> set[str]:
    valid_codes: set[str] = set()

    with routes_path.open("r", encoding="utf-8") as file:
        reader = csv.reader(file)
        for row in reader:
            if len(row) < 5:
                continue

            source_iata = row[2].strip().upper()
            destination_iata = row[4].strip().upper()

            if source_iata and source_iata != "\\N":
                valid_codes.add(source_iata)
            if destination_iata and destination_iata != "\\N":
                valid_codes.add(destination_iata)

    return valid_codes


def load_cities_from_ts(cities_ts_path: Path) -> list[dict[str, Any]]:
    content = cities_ts_path.read_text(encoding="utf-8")

    array_match = re.search(
        r"export\s+const\s+cities\s*:\s*City\[\]\s*=\s*(\[[\s\S]*\])\s*$",
        content,
        flags=re.MULTILINE,
    )
    if not array_match:
        raise ValueError("Could not find `cities` array in cities.ts")

    array_text = array_match.group(1)

    python_like = re.sub(r"(\b[A-Za-z_][A-Za-z0-9_]*)\s*:", r'"\1":', array_text)
    python_like = re.sub(r"\btrue\b", "True", python_like, flags=re.IGNORECASE)
    python_like = re.sub(r"\bfalse\b", "False", python_like, flags=re.IGNORECASE)
    python_like = re.sub(r"\bnull\b", "None", python_like, flags=re.IGNORECASE)

    try:
        parsed = ast.literal_eval(python_like)
    except (SyntaxError, ValueError) as exc:
        raise ValueError(f"Failed parsing cities.ts into Python structure: {exc}") from exc

    if not isinstance(parsed, list):
        raise ValueError("Parsed cities payload is not a list")

    return parsed


def filter_cities_by_routes(
    cities: list[dict[str, Any]], valid_iata_codes: set[str]
) -> list[dict[str, Any]]:
    return [
        city
        for city in cities
        if isinstance(city, dict)
        and isinstance(city.get("iata"), str)
        and city["iata"].upper() in valid_iata_codes
    ]


def build_filtered_cities(cities_ts_path: Path, routes_path: Path) -> list[dict[str, Any]]:
    valid_iata_codes = load_valid_iata_codes(routes_path)
    cities = load_cities_from_ts(cities_ts_path)
    return filter_cities_by_routes(cities, valid_iata_codes)


def to_typescript_cities_file(cities: list[dict[str, Any]]) -> str:
    lines: list[str] = ["import type { City } from '../types'", "", "export const cities: City[] = ["]

    preferred_order = ["id", "name", "city", "country", "iata", "lat", "lng"]
    for city in cities:
        ordered_keys = [key for key in preferred_order if key in city]
        ordered_keys.extend(key for key in city if key not in preferred_order)
        fields = ", ".join(
            f'{key}: {json.dumps(city[key], ensure_ascii=False)}' for key in ordered_keys
        )
        lines.append(f"  {{ {fields} }},")

    lines.append("]")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    script_dir = Path(__file__).resolve().parent
    default_cities_path = script_dir / "src" / "data" / "cities.ts"
    default_routes_path = script_dir / "Routes_filtered.txt"
    default_output_path = script_dir / "src" / "data" / "cities_clean.ts"

    parser = argparse.ArgumentParser(
        description="Filter cities.ts by IATA codes found in Routes.txt and write a TypeScript file."
    )
    parser.add_argument(
        "--cities",
        type=Path,
        default=default_cities_path,
        help="Path to cities.ts (default: ecoroute/src/data/cities.ts)",
    )
    parser.add_argument(
        "--routes",
        type=Path,
        default=default_routes_path,
        help="Path to Routes.txt (default: ecoroute/Routes.txt)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=default_output_path,
        help="Path to output TS (default: ecoroute/src/data/cities_clean.ts)",
    )
    args = parser.parse_args()

    filtered_cities = build_filtered_cities(args.cities, args.routes)
    ts_content = to_typescript_cities_file(filtered_cities)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        ts_content,
        encoding="utf-8",
    )

    print(f"Filtered entries: {len(filtered_cities)}", file=sys.stderr)
    print(f"Wrote TS to: {args.output}", file=sys.stderr)

if __name__ == "__main__":
    main()
