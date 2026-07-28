import { useState } from "react"
import useStored from "../lib/useStored"
import { heute } from "../lib/datum"
import { datumLang } from "./Kalender"
import { HabitTracker, ProgrammeSektion } from "./KalenderSeite"
import { useZiel } from "./ZielSeite"
import Wrapped from "./Wrapped"
import { WOCHEN_KEYS, standardTage, tagesName, normEintrag } from "../lib/splits"
import { uebungVon } from "../lib/uebungen"
import { konzeptVon } from "../lib/ernaehrung"
import { Card, SectionLink, Button, Ring } from "./ui"

function begruessung() {
  const stunde = new Date().getHours()
  if (stunde < 11) return "Guten Morgen"
  if (stunde < 18) return "Guten Tag"
  return "Guten Abend"
}

export default function Dashboard({ onNavigate, onStartTraining }) {
  const { plan } = useZiel()
  const [wrappedOffen, setWrappedOffen] = useState(false)

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{datumLang(heute())}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
            {begruessung()}, <span className="text-gradient">Matthias</span>
          </h1>
        </div>
        <Button variant="subtle" onClick={() => setWrappedOffen(true)} className="shrink-0">
          ✨ Wrapped
        </Button>
      </div>

      {wrappedOffen && <Wrapped onClose={() => setWrappedOffen(false)} />}

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

// ---- Ernährung heute: Makro-Ringe (verbraucht vs. Ziel) ------------------
function ErnaehrungVorschau({ plan, onOeffnen }) {
  const [mahlzeiten] = useStored("mahlzeiten", [])
  const [konzeptId] = useStored("ernaehrungKonzept", "standard")
  const konzept = konzeptVon(konzeptId)
  const heuteKey = heute()

  const s = mahlzeiten
    .filter((m) => m.datum === heuteKey)
    .reduce(
      (a, m) => ({
        kcal: a.kcal + (m.kcal || 0),
        protein: a.protein + (m.protein || 0),
        fett: a.fett + (m.fett || 0),
        kh: a.kh + (m.kohlenhydrate || 0),
      }),
      { kcal: 0, protein: 0, fett: 0, kh: 0 }
    )
  const z = plan?.makros

  return (
    <Card as="button" onClick={onOeffnen} className="w-full p-5 text-left transition-colors hover:border-accent/40">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Ernährung heute</span>
        <span className="text-accent/60">→</span>
      </div>
      <div className="mt-3 flex flex-wrap items-start justify-around gap-3">
        <RingMini label="kcal" value={s.kcal} max={plan?.kalorien} color="var(--color-accent)" gross />
        <RingMini label="Protein" value={s.protein} max={z?.protein} color="var(--color-rose-300)" einheit="g" />
        <RingMini label="Fett" value={s.fett} max={z?.fett} color="var(--color-amber-300)" einheit="g" />
        <RingMini label="Carbs" value={s.kh} max={z?.kohlenhydrate} color="var(--color-sky-300)" einheit="g" />
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        {konzept.name}
        {plan ? ` · Ziel ${plan.kalorien} kcal` : ""}
      </p>
    </Card>
  )
}

function RingMini({ label, value, max, color, einheit, gross }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Ring value={value} max={max || value || 1} color={color} size={gross ? 66 : 56} stroke={gross ? 6 : 5} label={`${value}`} />
      <p className="text-[11px] font-medium text-ink">{label}</p>
      {max ? <p className="text-[10px] text-faint">/ {max} {einheit}</p> : null}
    </div>
  )
}
