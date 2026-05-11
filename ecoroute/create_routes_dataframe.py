from pathlib import Path

import pandas as pd


def load_routes_dataframe() -> pd.DataFrame:
    routes_file = Path(__file__).resolve().parent / "Routes.txt"
    columns = [
        "airline",
        "airline_id",
        "source_airport",
        "source_airport_id",
        "destination_airport",
        "destination_airport_id",
        "codeshare",
        "stops",
        "equipment",
    ]

    return pd.read_csv(
        routes_file,
        names=columns,
        header=None,
        na_values=["\\N"],
    )


if __name__ == "__main__":
    df_routes = load_routes_dataframe()
    print(df_routes.head())
