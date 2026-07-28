import { useState } from "react"
import { createPortal } from "react-dom"
import useStored from "../lib/useStored"
import { wochenReport, wrappedText } from "../lib/wrapped"
import { datumLang } from "./Kalender"
import { Button } from "./ui"

// Wochenrückblick als teilbares Overlay im Marken-Look. Öffnet sich über
// einen Button auf dem Dashboard.
export default function Wrapped({ onClose }) {
  const [log] = useStored("trainingLog", [])
  const [checks] = useStored("checks", {})
  const [mahlzeiten] = useStored("mahlzeiten", [])
  const [geteilt, setGeteilt] = useState(false)

  const r = wochenReport({ log, checks, mahlzeiten })

  async function teilen() {
    const text = wrappedText(r)
    try {
      if (navigator.share) {
        await navigator.share({ title: "Meine Trainingswoche", text })
        return
      }
      await navigator.clipboard.writeText(text)
      setGeteilt(true)
      setTimeout(() => setGeteilt(false), 2000)
    } catch {
      /* abgebrochen – nichts tun */
    }
  }

  const kacheln = [
    { icon: "🏋️", wert: r.einheiten, label: r.einheiten === 1 ? "Einheit" : "Einheiten" },
    { icon: "🔁", wert: r.saetze, label: "Sätze" },
    { icon: "🏋️", wert: `${r.tonnage.toLocaleString("de-DE")}`, label: "kg bewegt" },
    { icon: "💪", wert: r.neuePRs, label: r.neuePRs === 1 ? "neuer Rekord" : "neue Rekorde" },
    { icon: "🎯", wert: r.topMuskel ?? "–", label: "Fokus-Muskel" },
    { icon: "🔥", wert: r.serie, label: r.serie === 1 ? "Wochen-Serie" : "Wochen-Serie" },
  ]

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-b-none rounded-t-3xl border border-accent/30 bg-surface p-6 shadow-[var(--shadow-glow)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-soft">
              Deine Woche
            </p>
            <h3 className="mt-1 text-2xl font-bold text-ink">
              <span className="text-gradient">Wrapped</span>
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              {datumLang(r.von)} – {datumLang(r.bis)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full border border-[color:var(--ov-10)] bg-surface-2 px-3 py-1 text-sm text-muted transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>

        {r.leer ? (
          <p className="mt-6 rounded-2xl border border-[color:var(--ov-06)] bg-surface-2 p-5 text-center text-sm text-muted">
            Diese Woche gibt es noch nichts zusammenzufassen. Starte ein Training oder hake
            deine Habits ab – dein Rückblick füllt sich von selbst.
          </p>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {kacheln.map((k, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[color:var(--ov-06)] bg-surface-2 p-4"
                >
                  <p className="text-lg">{k.icon}</p>
                  <p className="mt-1 truncate text-2xl font-bold tabular-nums text-ink">{k.wert}</p>
                  <p className="text-xs text-muted">{k.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-2xl border border-[color:var(--ov-06)] bg-surface-2 px-4 py-3">
              <span className="text-sm text-muted">🥗 Ernährung eingehalten</span>
              <span className="text-sm font-semibold text-ink">{r.ernaehrungTage} / 7 Tage</span>
            </div>
            {r.kcalSchnitt > 0 && (
              <div className="mt-2 flex items-center justify-between rounded-2xl border border-[color:var(--ov-06)] bg-surface-2 px-4 py-3">
                <span className="text-sm text-muted">⌀ Kalorien pro Tag</span>
                <span className="text-sm font-semibold text-ink">
                  {r.kcalSchnitt.toLocaleString("de-DE")} kcal
                </span>
              </div>
            )}
          </>
        )}

        <div className="mt-5 flex gap-2">
          <Button onClick={teilen} className="flex-1">
            {geteilt ? "✓ Kopiert" : "Teilen"}
          </Button>
          <Button variant="subtle" onClick={onClose}>
            Schließen
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
