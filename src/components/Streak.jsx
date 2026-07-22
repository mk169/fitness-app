import useStored from "../lib/useStored"
import {
  wochenStreak, trainingsTage, wochenKennzahlen, heatmapDaten,
} from "../lib/statistik"
import Koerperkarte from "./Koerperkarte"
import { Card, SectionTitle, cx, icons } from "./ui"

// Streak-Streifen fürs Dashboard: Wochen-Streak + „Diese Woche“ (Reps/Volumen).
export function StreakBanner() {
  const [log] = useStored("trainingLog", [])
  const [checks] = useStored("checks", {})

  const streak = wochenStreak(trainingsTage(log, checks))
  const woche = wochenKennzahlen(log)

  return (
    <Card className="mt-6 flex items-stretch gap-3 overflow-hidden p-0">
      <div className="flex items-center gap-3 border-r border-white/[0.06] px-5 py-4">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent">
          {icons.flamme("h-6 w-6")}
        </span>
        <div>
          <p className="text-2xl font-bold tabular-nums text-ink">{streak}</p>
          <p className="text-xs text-muted">Wochen-Streak</p>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-3 items-center gap-2 px-4 py-3 text-center">
        <div>
          <p className="text-lg font-bold tabular-nums text-ink">{woche.saetze}</p>
          <p className="text-[11px] text-muted">Sätze</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums text-ink">{woche.reps}</p>
          <p className="text-[11px] text-muted">Reps</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums text-ink">
            {(woche.volumen / 1000).toFixed(1)}<span className="text-xs font-normal text-muted">t</span>
          </p>
          <p className="text-[11px] text-muted">Volumen</p>
        </div>
      </div>
    </Card>
  )
}

const STUFEN = [
  "bg-white/[0.05]",
  "bg-accent/30",
  "bg-accent/60",
  "bg-accent",
]
const TAGE_KURZ = ["Mo", "", "Mi", "", "Fr", "", "So"]

// Volle Fortschritts-Karte für die Trainingsseite: Kontributions-Heatmap,
// Streak und „Diese Woche“ mit Körperkarte (Reps/Volumen).
export function TrainingsHeatmap() {
  const [log] = useStored("trainingLog", [])
  const [checks] = useStored("checks", {})

  const spalten = heatmapDaten(log, checks, [], 26)
  const streak = wochenStreak(trainingsTage(log, checks))
  const woche = wochenKennzahlen(log)

  return (
    <Card className="mt-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-accent">{icons.flamme("h-5 w-5")}</span>
          <span className="text-lg font-bold tabular-nums text-ink">{streak}</span>
          <span className="text-sm text-muted">Wochen-Streak</span>
        </div>
        <span className="text-xs text-faint">letzte 26 Wochen</span>
      </div>

      {/* Heatmap: Wochen als Spalten, Mo–So als Zeilen */}
      <div className="mt-4 flex gap-2">
        <div className="flex flex-col justify-between py-0.5 text-[9px] leading-none text-faint">
          {TAGE_KURZ.map((t, i) => (
            <span key={i} className="h-[11px]">{t}</span>
          ))}
        </div>
        <div className="flex gap-[3px] overflow-x-auto">
          {spalten.map((woche2, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {woche2.map((tag, ti) => (
                <span
                  key={ti}
                  title={`${tag.datum}${tag.intensitaet ? " · trainiert" : ""}`}
                  className={cx(
                    "h-[11px] w-[11px] rounded-[3px]",
                    tag.zukunft ? "bg-transparent" : STUFEN[tag.intensitaet]
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Diese Woche: Kennzahlen + Körperkarte */}
      <div className="mt-5 grid gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-[1fr_auto]">
        <div>
          <SectionTitle>Diese Woche</SectionTitle>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            {[
              { l: "Sätze", v: woche.saetze },
              { l: "Reps", v: woche.reps },
              { l: "Volumen", v: `${(woche.volumen / 1000).toFixed(1)} t` },
            ].map((k) => (
              <div key={k.l} className="rounded-xl bg-surface-2 py-3">
                <p className="text-xl font-bold tabular-nums text-ink">{k.v}</p>
                <p className="text-[11px] text-muted">{k.l}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {woche.muskeln.size === 0 ? (
              <p className="text-xs text-faint">Noch keine Sätze diese Woche geloggt.</p>
            ) : (
              [...woche.muskeln].map((m) => (
                <span key={m} className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent-soft">
                  {m}
                </span>
              ))
            )}
          </div>
        </div>
        <div className="mx-auto w-44 shrink-0">
          <Koerperkarte aktiv={woche.muskeln} farbe="#f5a524" labels={false} />
        </div>
      </div>
    </Card>
  )
}
