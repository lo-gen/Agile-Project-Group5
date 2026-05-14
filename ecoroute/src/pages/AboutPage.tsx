export default function AboutPage() {
  return (
    <div className="h-full overflow-y-auto bg-eco-bg px-4 py-10 font-sans text-eco-text sm:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-2xl border border-eco-border bg-eco-panel p-7">
          <p className="inline-flex rounded-full border border-eco-border px-3 py-1 text-xs font-medium text-eco-green">
            About
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight">
            About EcoRoute
          </h1>
          <p className="mt-4 text-sm leading-6 text-eco-muted">
            EcoRoute is a student project designed to make travel emissions visible
            and comparable. We believe informed choices drive change — knowing the
            environmental impact of your journey helps you make decisions aligned
            with your values.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Our mission</h2>
          <p className="mt-3 text-sm leading-6 text-eco-muted">
            We're working toward UN Sustainable Development Goal 13 (Climate
            Action) by providing accessible, accurate emissions data for air and
            ground travel. Rather than estimate emissions ourselves, we rely on
            authoritative external data sources so the numbers you see are as
            reliable as possible.
          </p>

          <h2 className="mt-8 text-xl font-semibold">How it works</h2>
          <div className="mt-4 space-y-3 text-sm text-eco-muted">
            <p>
              <span className="font-semibold text-eco-text">
                Flight emissions — Google Travel Impact Model (TIM)
              </span>{" "}
              All flight CO₂ figures come from Google's Travel Impact Model API.
              TIM is an open-source model that uses real aircraft types, seat
              configurations, load factors, and routing data to estimate
              per-passenger emissions by cabin class. It also reports a{" "}
              <span className="font-semibold text-eco-text">
                contrails impact bucket
              </span>{" "}
              (Low / Moderate / High) to indicate the non-CO₂ warming contribution
              of a specific flight.
            </p>
            <p>
              <span className="font-semibold text-eco-text">
                Flight route distance
              </span>{" "}
              is calculated locally using the Haversine formula between airports,
              with a 95 km detour factor added for real-world routing. This is used
              for display purposes only — the emissions figure itself comes from TIM.
            </p>
            <p>
              <span className="font-semibold text-eco-text">Car route distance</span>{" "}
              is fetched from the{" "}
              <span className="font-semibold text-eco-text">OSRM API</span>{" "}
              (Open Source Routing Machine), which returns the actual road distance
              and driving time between two cities. Emissions are then calculated by
              applying a factor of 0.21 kg CO₂ per km, based on a typical European
              passenger car.
            </p>
            <p>
              <span className="font-semibold text-eco-text">Train comparison</span>{" "}
              uses the straight-line distance between cities with an emission factor
              of 0.041 kg CO₂ per km, reflecting average European rail emissions
              including the electricity grid mix.
            </p>
          </div>

          <h2 className="mt-8 text-xl font-semibold">Compare your options</h2>
          <p className="mt-3 text-sm leading-6 text-eco-muted">
            EcoRoute lets you compare the emissions of a flight with car and train
            alternatives side by side. Use the planner to understand the true
            climate cost of your journey and discover lower-impact ways to travel.
          </p>

        </section>
      </div>
    </div>
  );
}
