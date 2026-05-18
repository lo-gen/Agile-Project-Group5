import { useLanguage } from '../context/LanguageContext'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="h-full overflow-y-auto bg-eco-bg px-4 py-10 font-sans text-eco-text sm:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-2xl border border-eco-border bg-eco-panel p-7">
          <p className="inline-flex rounded-full border border-eco-border px-3 py-1 text-xs font-medium text-eco-green">
            {t('aboutBadge')}
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight">
            {t('aboutTitle')}
          </h1>
          <p className="mt-4 text-sm leading-6 text-eco-muted">
            {t('aboutIntro')}
          </p>

          <h2 className="mt-8 text-xl font-semibold">{t('aboutMissionTitle')}</h2>
          <p className="mt-3 text-sm leading-6 text-eco-muted">
            {t('aboutMission')}
          </p>

          <h2 className="mt-8 text-xl font-semibold">{t('aboutHowItWorksTitle')}</h2>
          <div className="mt-4 space-y-3 text-sm text-eco-muted">
            <p>
              <span className="font-semibold text-eco-text">
                {t('aboutFlightEmissionsTitle')}
              </span>{' '}
              {t('aboutFlightEmissions')}
            </p>
            <p>
              <span className="font-semibold text-eco-text">
                {t('aboutFlightDistanceTitle')}
              </span>{' '}
              {t('aboutFlightDistance')}
            </p>
            <p>
              <span className="font-semibold text-eco-text">
                {t('aboutCarDistanceTitle')}
              </span>{' '}
              {t('aboutCarDistance')}
            </p>
            <p>
              <span className="font-semibold text-eco-text">{t('aboutTrainTitle')}</span>{' '}
              {t('aboutTrain')}
            </p>
          </div>

          <h2 className="mt-8 text-xl font-semibold">{t('aboutCompareTitle')}</h2>
          <p className="mt-3 text-sm leading-6 text-eco-muted">
            {t('aboutCompare')}
          </p>
        </section>
      </div>
    </div>
  )
}
