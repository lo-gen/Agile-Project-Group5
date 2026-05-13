import pandas as pd
def find_route(df, start, end):
    source_col = "source_airport" if "source_airport" in df.columns else "source"
    destination_col = "destination_airport" if "destination_airport" in df.columns else "destination"

    if source_col not in df.columns or destination_col not in df.columns:
        raise KeyError(
            "DataFrame must include either "
            "('source_airport', 'destination_airport') "
            "or ('source', 'destination') columns."
        )

    queue = [[start]]
    visited = set()

    while queue:

        route = queue.pop(0)
        current_airport = route[-1]

        if current_airport == end:
            return route

        if current_airport not in visited:

            visited.add(current_airport)

            possible_routes = df[df[source_col] == current_airport]

            for _, row in possible_routes.iterrows():

                next_airport = row[destination_col]

                if next_airport not in visited:
                    new_route = route + [next_airport]
                    queue.append(new_route)

    return None
