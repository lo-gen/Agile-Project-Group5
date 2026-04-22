export default function AboutPage() {
  return (
    <div className="min-h-screen bg-eco-bg px-4 py-10 font-sans text-eco-text sm:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-2xl border border-eco-border bg-eco-panel p-7">
          <p className="inline-flex rounded-full border border-eco-border px-3 py-1 text-xs font-medium text-eco-green">
            About
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight">
            About EcoRoute
          </h1>
          <p className="mt-4 text-sm leading-6 text-eco-muted">
            EcoRoute is a student project designed to make flight emissions visible and comparable. We believe that informed choices drive change—knowing the environmental impact of your travel helps you make decisions aligned with your values.
          </p>

          <h2 className="mt-8 text-xl font-semibold">Our mission</h2>
          <p className="mt-3 text-sm leading-6 text-eco-muted">
            We're working toward UN Sustainable Development Goal 13 (Climate Action) by providing accessible, accurate emissions data for air travel across Europe. Every calculation is grounded in the ICAO Carbon Emissions Calculator methodology.
          </p>

          <h2 className="mt-8 text-xl font-semibold">How it works</h2>
          <div className="mt-4 space-y-3 text-sm text-eco-muted">
            <p>
              <span className="font-semibold text-eco-text">Great-circle distance</span> is calculated between airports using the Haversine formula, with a 95 km detour factor added to account for real-world routing.
            </p>
            <p>
              <span className="font-semibold text-eco-text">Emission factors</span> differ by haul type—short-haul flights (&lt;1,500 km) emit 0.255 kg CO₂ per km per passenger, while long-haul flights emit 0.195 kg CO₂ per km per passenger.
            </p>
            <p>
              <span className="font-semibold text-eco-text">Cabin class</span> multipliers reflect floor-space allocation: Economy (1.0×), Business (1.5×), and First Class (2.0×).
            </p>
            <p>
              <span className="font-semibold text-eco-text">Radiative Forcing Index (RFI)</span> is multiplied by 2.7 to account for non-CO₂ warming effects of aviation at altitude, including contrails and nitrogen oxides.
            </p>
          </div>

          <h2 className="mt-8 text-xl font-semibold">Compare your options</h2>
          <p className="mt-3 text-sm leading-6 text-eco-muted">
            EcoRoute lets you compare the emissions of flights with alternative transport modes like train or car travel. Use this tool to understand the true climate cost of your journey and discover lower-impact alternatives.
          </p>

          <a
            href="#/"
            className="mt-8 inline-flex rounded-md border border-eco-border px-4 py-2 text-sm font-medium transition hover:border-eco-green hover:text-eco-green"
          >
            Back to emissions calculator
          </a>
        </section>
      </div>
    </div>
  )
}
