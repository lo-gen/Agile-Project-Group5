import { useState } from 'react'
import type { FormEvent } from 'react'

type AffiliateForm = {
  fullName: string
  email: string
  website: string
  audience: string
}

const initialForm: AffiliateForm = {
  fullName: '',
  email: '',
  website: '',
  audience: '',
}

export default function AffiliateProgramPage() {
  const [form, setForm] = useState<AffiliateForm>(initialForm)
  const [submitted, setSubmitted] = useState(false)

  function updateField(field: keyof AffiliateForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-eco-bg px-4 py-10 font-sans text-eco-text sm:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-eco-border bg-eco-panel p-7">
          <p className="inline-flex rounded-full border border-eco-border px-3 py-1 text-xs font-medium text-eco-green">
            EcoRoute Affiliate Program
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight">
            Share EcoRoute with your audience and earn from every qualified signup.
          </h1>
          <p className="mt-4 text-sm leading-6 text-eco-muted">
            Once approved, you will receive a personal affiliate link, dashboard access, and support assets to help you promote EcoRoute.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="rounded-xl border border-eco-border bg-eco-bg/60 p-4">
              <p className="text-sm font-semibold">Recurring commission</p>
              <p className="mt-2 text-xs text-eco-muted">Earn 20% for each referred user on active paid plans.</p>
            </article>
            <article className="rounded-xl border border-eco-border bg-eco-bg/60 p-4">
              <p className="text-sm font-semibold">Fast payouts</p>
              <p className="mt-2 text-xs text-eco-muted">Monthly payouts through your preferred payment method.</p>
            </article>
            <article className="rounded-xl border border-eco-border bg-eco-bg/60 p-4">
              <p className="text-sm font-semibold">Ready-made assets</p>
              <p className="mt-2 text-xs text-eco-muted">Get banners, copy snippets, and launch tips.</p>
            </article>
          </div>

          <a
            href="/"
            className="mt-8 inline-flex rounded-md border border-eco-border px-4 py-2 text-sm font-medium transition hover:border-eco-green hover:text-eco-green"
          >
            Back to emissions calculator
          </a>
        </section>

        <section className="rounded-2xl border border-eco-border bg-eco-panel p-7">
          <h2 className="text-xl font-semibold">Apply to join</h2>

          {submitted ? (
            <div className="mt-4 rounded-lg border border-eco-green/40 bg-eco-green/10 p-4 text-sm">
              Application received. We will review your profile and email your affiliate link within 2 business days.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm text-eco-muted">Full name</span>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  className="w-full rounded-md border border-eco-border bg-eco-bg px-3 py-2 text-sm outline-none transition focus:border-eco-green"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-eco-muted">Email</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  className="w-full rounded-md border border-eco-border bg-eco-bg px-3 py-2 text-sm outline-none transition focus:border-eco-green"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-eco-muted">Website or social profile</span>
                <input
                  type="url"
                  required
                  value={form.website}
                  onChange={(event) => updateField('website', event.target.value)}
                  className="w-full rounded-md border border-eco-border bg-eco-bg px-3 py-2 text-sm outline-none transition focus:border-eco-green"
                  placeholder="https://"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-eco-muted">How will you promote us?</span>
                <textarea
                  required
                  value={form.audience}
                  onChange={(event) => updateField('audience', event.target.value)}
                  className="h-28 w-full resize-none rounded-md border border-eco-border bg-eco-bg px-3 py-2 text-sm outline-none transition focus:border-eco-green"
                  placeholder="Tell us about your audience and channels"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-md bg-eco-green px-4 py-2 text-sm font-semibold text-eco-bg transition hover:opacity-90"
              >
                Submit application
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
