import useStored from "../lib/useStored"
import { supabase, cloudAktiv } from "../lib/supabase"
import StilWaehler from "./StilWaehler"
import { Card, PageHeader, SectionTitle, Button } from "./ui"

// Zentrale Einstellungen der App. Erste Einstellung: Design/Erscheinungsbild.
// Weiter unten: Erst-Einrichtung erneut starten und (mit Cloud) das Konto.
export default function Einstellungen({ session }) {
  const [, setOnboardingFertig] = useStored("onboardingFertig", false)

  return (
    <div>
      <PageHeader
        title="Einstellungen"
        subtitle="Passe die App an dich an – Aussehen, Einrichtung und Konto."
      />

      {/* 1. Design / Erscheinungsbild */}
      <StilWaehler variant="voll" />

      {/* 2. Erst-Einrichtung */}
      <section className="mt-8">
        <SectionTitle>Einrichtung</SectionTitle>
        <Card className="mt-3 flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-medium text-ink">Erst-Einrichtung erneut durchlaufen</p>
            <p className="mt-0.5 text-xs text-muted">
              Ziel, Trainingsplan und Ernährung Schritt für Schritt neu festlegen.
            </p>
          </div>
          <Button variant="subtle" onClick={() => setOnboardingFertig(false)}>
            Einrichtung starten
          </Button>
        </Card>
      </section>

      {/* 3. Konto (nur mit Cloud/Login) */}
      {cloudAktiv && session && (
        <section className="mt-8">
          <SectionTitle>Konto</SectionTitle>
          <Card className="mt-3 flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{session.user?.email}</p>
              <p className="mt-0.5 text-xs text-muted">
                Angemeldet – deine Daten werden geräteübergreifend synchronisiert.
              </p>
            </div>
            <Button variant="subtle" onClick={() => supabase.auth.signOut()}>
              Abmelden
            </Button>
          </Card>
        </section>
      )}
    </div>
  )
}
