import useStored from "../lib/useStored"
import { heute } from "../lib/datum"
import { datumLang } from "./Kalender"
import { HabitTracker, ProgrammeSektion } from "./KalenderSeite"
import { useZiel } from "./ZielSeite"
import { WOCHEN_KEYS, standardTage, tagesName, normEintrag } from "../lib/splits"
import { uebungVon } from "../lib/uebungen"
import { konzeptVon, methodeVon, FARBEN, FASTEN_STANDARD } from "../lib/ernaehrung"
import { Card, SectionLink, Button, cx } from "./ui"

function begruessung() {
  const stunde = new Date().getHours()
  if (stunde < 11) return "Guten Morgen"
  if (stunde < 18) return "Guten Tag"
  return "Guten Abend"
}

export default function Dashboard({ onNavigate, onStartTraining }) {
  const { plan } = useZiel()

  return (
    <div>
      <p className="text-sm text-muted">{datumLang(heute())}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
        {begruessung()}, <span className="text-gradient">Matthias</span>
      </h1>

      {/* 1. Tagesansicht: Habits nur anzeigen & abhaken */}
      <div className="mt-6">
        <HabitTracker nurAnzeige />
      </div>

      {/* 2. Training heute – direkt starten */}
      <TrainingHeute onStart={onStartTraining} onOeffnen={() => onNavigate("training")} />

      {/* 3. Programme & Phasen */}
      <ProgrammeSektion />

      {/* 4. Ernährung */}
      <div className="mt-10">
        <ErnaehrungVorschau plan={plan} onOeffnen={() => onNavigate("ernaehrung")} />
      </div>
    </div>
  )
}

// ---- Training heute: heutige Einheit + „Training starten" ----------------
function TrainingHeute({ onStart, onOeffnen }) {
  const [wochenplan] = useStored("trainingsplanUebungen", {})
  const { profil } = useZiel()

  const tagKey = WOCHEN_KEYS[(new Date().getDay() + 6) % 7]
  const eintraege = (wochenplan[tagKey] ?? []).map(normEintrag)
  const tageWahl = profil.tageWahl ?? standardTage(profil.trainingsTage ?? 3)
  const einheit = tagesName(profil.splitWahl ?? "oberUnter", tageWahl, tagKey)
  const ruhetag = eintraege.length === 0
  const namen = eintraege.map((e) => uebungVon(e.id)?.name).filter(Boolean).join(", ")

  return (
    <section className="mt-10">
      <SectionLink onClick={onOeffnen}>Training heute</SectionLink>
      <div className="relative mt-3 overflow-hidden rounded-2xl border border-accent/30 bg-surface p-5 shadow-[var(--shadow-glow)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
        {ruhetag ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-ink">Ruhetag</p>
              <p className="mt-0.5 text-sm text-muted">Heute steht kein Training an – Erholung zählt auch.</p>
            </div>
            <Button variant="subtle" onClick={onOeffnen}>Plan ansehen</Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-ink">{einheit ?? "Training"}</p>
                <p className="mt-0.5 text-sm text-muted">{eintraege.length} Übungen</p>
              </div>
              <Button onClick={onStart} className="px-5 py-2.5">▶ Training starten</Button>
            </div>
            {namen && <p className="mt-3 truncate text-xs text-muted">{namen}</p>}
          </>
        )}
      </div>
    </section>
  )
}

// ---- Ernährung: Konzept, Fasten, kcal-Ziel -------------------------------
function ErnaehrungVorschau({ plan, onOeffnen }) {
  const [konzeptId] = useStored("ernaehrungKonzept", "standard")
  const [fasten] = useStored("fasten", FASTEN_STANDARD)
  const konzept = konzeptVon(konzeptId)
  const methode = methodeVon(fasten.methode)

  return (
    <Card as="button" onClick={onOeffnen} className="w-full p-5 text-left transition-colors hover:border-accent/40">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Ernährung</span>
        <span className="text-accent/60">→</span>
      </div>
      <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-ink">
        <span className={cx("h-2.5 w-2.5 rounded-full", FARBEN[konzept.farbe].punkt)} />
        {konzept.name}
      </p>
      <p className="mt-0.5 text-sm text-muted">
        Fasten: {methode.name}
        {plan ? ` · ${plan.kalorien} kcal Ziel` : ""}
      </p>
    </Card>
  )
}
