# UML Diagrams – Weekly Snapshots

## Vecka 1 — MVP (2026-04-20)

Grundstrukturen: karta, utsläppsberäkning, städer och reselägen.

```mermaid
graph TD
    App --> FlightContext
    App --> FlightMap
    App --> CitySelector
    App --> TravelClassSelector
    App --> EmissionsCard
    App --> ComparisonBar

    FlightContext -->|state| FlightMap
    FlightContext -->|state| EmissionsCard
    FlightContext -->|state| ComparisonBar

    EmissionsCard -->|använder| emissions.ts
    EmissionsCard -->|använder| distance.ts
    ComparisonBar -->|data| transportModes.ts
    CitySelector -->|data| cities.ts
    FlightMap --> FlightArc
```

---

## Vecka 2 — Deployment + Sidor (2026-04-22–24)

Lade till GitHub Pages-deploy, flygtid och nya sidor.

```mermaid
graph TD
    App --> FlightContext
    App --> FlightMap
    App --> EmissionsCard
    App --> ComparisonBar
    App --> Router

    Router --> MainPage
    Router --> AboutPage
    Router --> AffiliatePage

    MainPage --> CitySelector
    MainPage --> TravelClassSelector

    EmissionsCard -->|beräknar| flightTime
    flightTime -->|använder| distance.ts

    CI["GitHub Actions CI/CD"] -->|deploy| GitHubPages
```

---

## Vecka 3 — Auth + Supabase + Historik (2026-04-25–27)

Inloggning via Supabase, sparande av flyghistorik.

```mermaid
graph TD
    App --> AuthContext
    App --> FlightContext
    App --> FlightHistorySidebar
    App --> AuthButton

    AuthContext -->|login/logout| Supabase[(Supabase DB)]
    AuthButton --> LoginModal
    LoginModal -->|autentisering| AuthContext

    FlightContext -->|state| EmissionsCard
    EmissionsCard -->|auto-save vid inloggning| useFlightHistory

    useFlightHistory -->|läser/skriver| Supabase
    FlightHistorySidebar -->|visar| useFlightHistory
    FlightHistorySidebar --> FlightHistoryItem
```

---

## Vecka 4 — Bilreseplanner + TIM API + Gruppresor (2026-04-28–05-04)

Lade till bilrutt, extern transport-API och stöd för flera passagerare.

```mermaid
graph TD
    App --> FlightContext
    App --> RoutePlannerDashboard

    FlightContext -->|passengers count| EmissionsCard

    RoutePlannerDashboard --> RoutePlannerMap
    RoutePlannerDashboard --> routePlanner.ts

    routePlanner.ts --> roadRouting.ts
    routePlanner.ts --> transport.ts
    roadRouting.ts -->|väghämtning| OSMAPI["OpenStreetMap / OSM API"]

    timApi.ts -->|hämtar data| TIMAPI["Trafikverkets TIM API"]
    timApi.ts -->|TIM-typer| tim.ts
    RoutePlannerDashboard -->|typiska utsläpp| timApi.ts

    cityFilters.ts -->|filtrera städer| CitySelector
```

---

## Vecka 5 — Konto + Sökhistorik + Favoriter (2026-05-05–11)

Kontosida med sökhistorik och favoriter.

```mermaid
graph TD
    App --> Router
    Router --> AccountPage
    Router --> MainPage
    Router --> RoutePlannerDashboard
    Router --> AboutPage

    AccountPage -->|visar| useFlightHistory
    AccountPage -->|visar| useFavorites

    useFlightHistory -->|hämtar från| Supabase[(Supabase DB)]
    useFavorites -->|hämtar från| Supabase

    AuthContext -->|inloggad användare| AccountPage
    AuthContext -->|inloggad användare| useFlightHistory
    AuthContext -->|inloggad användare| useFavorites

    FlightContext --> EmissionsCard
    EmissionsCard -->|sparar sökning| useFlightHistory
```
