const FEATURES = [
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Flight Emissions",
    desc: "Calculate exact CO₂ output per flight using ICAO-certified methodology, cabin class multipliers, and RFI.",
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
    title: "Greener Alternatives",
    desc: "Discover lower-emission train and multi-modal routes across Europe as alternatives to flying.",
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    title: "Side-by-Side Compare",
    desc: "See flights and alternatives together — emissions, distance, and eco-impact all at a glance.",
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Journey History",
    desc: "Log in to save routes, track your total carbon footprint, and monitor your travel habits over time.",
  },
];

import { useAuth } from "../context/AuthContext";

interface LandingPageProps {
  onSignUpClick: () => void;
  onLoginClick: () => void;
}

export default function LandingPage({ onSignUpClick, onLoginClick }: LandingPageProps) {
  const { user } = useAuth();
  return (
    <div className="h-full overflow-y-auto bg-eco-bg text-eco-text">
      {/* Hero */}
      <section className="flex min-h-[55vh] flex-col items-center justify-center px-4 py-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-eco-border px-3 py-1 text-xs font-medium text-eco-green">
          Sustainable Travel Planner
        </span>
        <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Travel smarter.
          <br />
          <span className="text-eco-green">Know your carbon footprint.</span>
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-eco-muted">
          Compare emissions from flights, trains and cars across the World.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#/planner"
            className="rounded-md bg-eco-green px-5 py-2.5 text-sm font-semibold text-eco-bg transition hover:opacity-90"
          >
            Plan your route →
          </a>
          <a
            href="#/about"
            className="rounded-md border border-eco-border px-5 py-2.5 text-sm font-medium transition hover:border-eco-green hover:text-eco-green"
          >
            How it works
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-5xl border-t border-eco-border" />

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-8">
        <h2 className="mb-10 text-center text-xl font-semibold">
          Why EcoRoute?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-eco-border bg-eco-panel p-5 transition hover:border-eco-green/50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-eco-border bg-eco-bg text-eco-green">
                {f.icon}
              </div>
              <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
              <p className="mt-2 text-xs leading-5 text-eco-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sign-up CTA */}
      {!user && (
        <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-8">
          <div className="rounded-2xl border border-eco-green/30 bg-eco-panel p-8 sm:flex sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Save your journeys</h2>
              <p className="mt-2 max-w-md text-sm text-eco-muted">
                Create a free account to track your routes, monitor your carbon
                footprint over time, and revisit past comparisons.
              </p>
            </div>
            <div className="mt-6 flex shrink-0 flex-col gap-2 sm:mt-0 sm:ml-8">
              <button
                onClick={onSignUpClick}
                className="rounded-md bg-eco-green px-5 py-2.5 text-sm font-semibold text-eco-bg transition hover:opacity-90"
              >
                Create free account
              </button>
              <button
                onClick={onLoginClick}
                className="text-center text-xs text-eco-muted transition hover:text-eco-text"
              >
                Already have an account? Log in
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-8">
        <div className="rounded-2xl border border-eco-border bg-eco-panel p-8 text-center">
          <h2 className="text-2xl font-semibold">
            Ready to plan a greener journey?
          </h2>
          <p className="mt-3 text-sm text-eco-muted">
            Start comparing routes and discover how much CO₂ you can save.
          </p>
          <a
            href="#/planner"
            className="mt-6 inline-flex rounded-md bg-eco-green px-6 py-2.5 text-sm font-semibold text-eco-bg transition hover:opacity-90"
          >
            Open the planner →
          </a>
        </div>
      </section>
    </div>
  );
}
