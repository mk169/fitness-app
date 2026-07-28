import useStored from "../lib/useStored"
import { heute, tageBis } from "../lib/datum"
import { datumLang } from "./Kalender"
import { KalenderPanel, HabitTracker } from "./KalenderSeite"
import { useZiel } from "./ZielSeite"
import { useTrainingsUebersicht } from "./TrainingsplanSeite"
import Koerperkarte from "./Koerperkarte"
import { MUSKELGRUPPEN } from "../lib/uebungen"
import { SPLITS } from "../lib/splits"
import { konzeptVon, methodeVon, FARBEN, FASTEN_STANDARD } from "../lib/ernaehrung"
import { Card, SectionLink, cx } from "./ui"

function begruessung() {
  const stunde = new Date().getHours()
  if (stunde < 11) return "Guten Morgen"
  if (stunde < 18) return "Guten Tag"
  return "Guten Abend"
}

function Abschnitt({ titel, onOeffnen, children }) {
  return (
    <section className="mt-10">
      <SectionLink onClick={onOeffnen}>{titel}</SectionLink>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export default function Dashboard({ onNavigate }) {
  const { plan } = useZiel()

  return (
    <div>
      <p className="text-sm text-muted">{datumLang(heute())}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
        {begruessung()}, <span className="text-gradient">Matthias</span>
      </h1>

      {/* 1. Heute – Habits zum Abhaken (aus dem Kalender/Habit-Tracker) */}
      <div className="mt-6">
        <HabitTracker />
      </div>

      {/* 2. + 3. Trainings- und Ernährungsplan */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <TrainingVorschau onOeffnen={() => onNavigate("training")} />
        <ErnaehrungVorschau plan={plan} onOeffnen={() => onNavigate("ernaehrung")} />
      </div>

      {/* 4. Ziel & Anpassung */}
      <ZielBanner plan={plan} onOeffnen={() => onNavigate("ziel")} />

      <Abschnitt titel="Kalender" onOeffnen={() => onNavigate("kalender")}>
        <KalenderPanel />
      </Abschnitt>
    </div>
  )
}

function ZielBanner({ plan, onOeffnen }) {
  if (!plan) {
    return (
      <button
        onClick={onOeffnen}
        className="mt-10 flex w-full items-center justify-between rounded-2xl border border-dashed border-[color:var(--ov-15)] px-5 py-4 text-left transition-colors hover:border-accent/50"
      >
        <span>
          <span className="block text-sm font-semibold text-ink">Ziel festlegen</span>
          <span className="mt-0.5 block text-xs text-muted">
            Definiere dein Ziel – Ernährung und Training richten sich danach.
          </span>
        </span>
        <span className="text-accent/60">→</span>
      </button>
    )
  }

  const dl = plan.deadline
  return (
    <Card
      as="button"
      onClick={onOeffnen}
      className="mt-10 w-full p-5 text-left transition-colors hover:border-accent/40"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            Ziel &amp; Anpassung
          </span>
          <p className="mt-1 text-lg font-semibold text-ink">{plan.modusInfo.name}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-center text-sm">
          <span className="rounded-lg bg-surface-2 px-3 py-1.5 font-medium text-ink">
            {plan.kalorien} kcal
          </span>
          <span className="rounded-lg bg-rose-500/15 px-3 py-1.5 font-medium text-rose-300">
            {plan.makros.protein} g P
          </span>
          <span className="rounded-lg bg-amber-500/15 px-3 py-1.5 font-medium text-amber-300">
            {plan.makros.fett} g F
          </span>
          <span className="rounded-lg bg-sky-500/15 px-3 py-1.5 font-medium text-sky-300">
            {plan.makros.kohlenhydrate} g C
          </span>
        </div>
      </div>
      {dl && (
        <p className="mt-3 text-xs text-muted">
          Deadline {new Date(dl.datum).toLocaleDateString("de-DE")} ({tageBis(dl.datum)}) ·{" "}
          {dl.differenz > 0 ? "+" : ""}{dl.differenz} kg ·{" "}
          <span className={dl.realistisch ? "text-emerald-400" : "text-rose-400"}>
            {dl.realistisch ? "realistisch" : "ambitioniert"}
          </span>
        </p>
      )}
    </Card>
  )
}

function TrainingVorschau({ onOeffnen }) {
  const { anzahl, muskeln } = useTrainingsUebersicht()
  const { profil } = useZiel()
  const split = SPLITS[profil.splitWahl ?? "oberUnter"]

  return (
    <Card as="button" onClick={onOeffnen} className="p-5 text-left transition-colors hover:border-accent/40">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Trainingsplan</span>
        <span className="text-accent/60">→</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="w-28 shrink-0">
          <Koerperkarte aktiv={muskeln} labels={false} />
        </div>
        <div>
          <p className="text-lg font-semibold text-ink">{split?.name ?? "—"}</p>
          <p className="mt-0.5 text-sm text-muted">
            {anzahl} Trainingstage · {muskeln.size > 0 ? `${muskeln.size} Muskelgruppen` : "noch nichts geplant"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {[...muskeln].slice(0, 4).map((m) => (
              <span key={m} className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent-soft">
                {MUSKELGRUPPEN[m]?.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function ErnaehrungVorschau({ plan, onOeffnen }) {
  const [konzeptId] = useStored("ernaehrungKonzept", "standard")
  const [fasten] = useStored("fasten", FASTEN_STANDARD)
  const konzept = konzeptVon(konzeptId)
  const methode = methodeVon(fasten.methode)

  return (
    <Card as="button" onClick={onOeffnen} className="p-5 text-left transition-colors hover:border-accent/40">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Ernährungsplan</span>
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
