import { useRef, useState } from "react"
import useStored, { exportiereDaten, importiereDaten } from "../lib/useStored"
import { supabase, cloudAktiv } from "../lib/supabase"
import StilWaehler from "./StilWaehler"
import { Card, PageHeader, SectionTitle, Button } from "./ui"

// Zentrale Einstellungen der App. Erste Einstellung: Design/Erscheinungsbild.
// Weiter unten: Erst-Einrichtung, Daten-Backup und (mit Cloud) das Konto.
export default function Einstellungen({ session }) {
  const [, setOnboardingFertig] = useStored("onboardingFertig", false)

  return (
    <div>
      <PageHeader
        title="Einstellungen"
        subtitle="Passe die App an dich an – Aussehen, Einrichtung, Daten und Konto."
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

      {/* 3. Daten (Backup) */}
      <DatenSektion />

      {/* 4. Konto (nur mit Cloud/Login) */}
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

// Daten-Backup: alles als JSON exportieren und wieder importieren.
function DatenSektion() {
  const dateiRef = useRef(null)
  const [meldung, setMeldung] = useState("")

  function exportieren() {
    const blob = new Blob([JSON.stringify(exportiereDaten(), null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mogged-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importieren(e) {
    const datei = e.target.files?.[0]
    if (!datei) return
    try {
      const n = importiereDaten(JSON.parse(await datei.text()))
      setMeldung(`${n} Einträge importiert – App wird neu geladen…`)
      setTimeout(() => window.location.reload(), 900)
    } catch (err) {
      setMeldung(`Import fehlgeschlagen: ${err.message}`)
    } finally {
      e.target.value = ""
    }
  }

  return (
    <section className="mt-8">
      <SectionTitle>Daten</SectionTitle>
      <Card className="mt-3 flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-medium text-ink">Backup deiner Daten</p>
          <p className="mt-0.5 text-xs text-muted">
            Alles (Profil, Pläne, Logs, Mahlzeiten …) als JSON sichern oder wiederherstellen.
          </p>
          {meldung && <p className="mt-1.5 text-xs text-accent-soft">{meldung}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="subtle" onClick={exportieren}>Exportieren</Button>
          <Button variant="subtle" onClick={() => dateiRef.current?.click()}>Importieren</Button>
          <input
            ref={dateiRef}
            type="file"
            accept="application/json,.json"
            onChange={importieren}
            className="hidden"
          />
        </div>
      </Card>
    </section>
  )
}
