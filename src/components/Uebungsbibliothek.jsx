import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { UEBUNGEN, KATEGORIEN, MUSKELGRUPPEN } from "../lib/uebungen"
import { uebungDetail } from "../lib/uebungDetails"
import { musterVon } from "../lib/uebungAnimation"
import Koerperkarte from "./Koerperkarte"
import UebungAnimation from "./UebungAnimation"
import { Card, SectionTitle, Pill, Button, inputCls, cx } from "./ui"

// Durchsuchbare Übungsbibliothek mit Detailansicht: tippe eine Übung an und
// sieh Anleitung, Coaching-Hinweise, typische Fehler und die farbig
// markierten Zielmuskeln auf der Körperkarte.
export default function Uebungsbibliothek() {
  const [offen, setOffen] = useState(false)
  const [suche, setSuche] = useState("")
  const [kat, setKat] = useState("Alle")
  const [detailId, setDetailId] = useState(null)

  const gefiltert = useMemo(() => {
    const q = suche.trim().toLowerCase()
    return UEBUNGEN.filter((u) => {
      if (kat !== "Alle" && u.kategorie !== kat) return false
      if (!q) return true
      const inMuskel = (u.muskeln ?? []).some((m) =>
        (MUSKELGRUPPEN[m]?.name ?? m).toLowerCase().includes(q)
      )
      return u.name.toLowerCase().includes(q) || u.geraet.toLowerCase().includes(q) || inMuskel
    })
  }, [suche, kat])

  return (
    <section className="mt-10">
      <SectionTitle
        right={
          <button
            onClick={() => setOffen((o) => !o)}
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-soft transition-colors hover:text-ink"
          >
            {offen ? "Zuklappen" : "Öffnen"}
          </button>
        }
      >
        Übungsbibliothek
      </SectionTitle>

      {offen && (
        <div className="mt-3">
          <input
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Übung, Gerät oder Muskel suchen…"
            className={inputCls}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {["Alle", ...KATEGORIEN].map((k) => (
              <Pill key={k} active={kat === k} onClick={() => setKat(k)} className="px-3.5 py-1.5 text-xs">
                {k}
              </Pill>
            ))}
          </div>

          <p className="mt-3 text-xs text-faint">{gefiltert.length} Übungen</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {gefiltert.map((u) => (
              <button
                key={u.id}
                onClick={() => setDetailId(u.id)}
                className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--ov-06)] bg-surface-2 px-3.5 py-2.5 text-left transition-colors hover:border-accent/40"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{u.name}</span>
                  <span className="block truncate text-xs text-faint">
                    {(u.muskeln ?? []).map((m) => MUSKELGRUPPEN[m]?.name ?? m).join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-[color:var(--ov-06)] px-2 py-0.5 text-[10px] text-muted">
                  {u.geraet}
                </span>
              </button>
            ))}
            {gefiltert.length === 0 && (
              <p className="text-sm text-muted">Keine Übung gefunden.</p>
            )}
          </div>
        </div>
      )}

      {detailId && <UebungDetailModal id={detailId} onClose={() => setDetailId(null)} />}
    </section>
  )
}

// Detail-Overlay einer einzelnen Übung.
export function UebungDetailModal({ id, onClose }) {
  const [ansicht, setAnsicht] = useState("bewegung")
  const d = uebungDetail(id)
  if (!d) return null

  // Über ein Portal an <body> gehängt, damit das fixierte Overlay nicht von
  // transformierten Vorfahren (z. B. .animate-page) eingefangen wird.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <Card
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-b-none rounded-t-3xl p-5 sm:rounded-3xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-ink">{d.name}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-medium text-accent-soft">
                {d.kategorie}
              </span>
              <span className="rounded-full bg-[color:var(--ov-06)] px-2.5 py-0.5 text-[11px] text-muted">
                {d.geraet}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full border border-[color:var(--ov-10)] bg-surface-2 px-3 py-1 text-sm text-muted transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Anleitung</p>
            <ol className="mt-2 space-y-2">
              {d.anleitung.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink/90">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-[11px] font-semibold text-accent-soft">
                    {i + 1}
                  </span>
                  <span className="min-w-0">{s}</span>
                </li>
              ))}
            </ol>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-400">Technik-Tipps</p>
                <ul className="mt-1.5 space-y-1">
                  {d.tipps.map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink/90">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span className="min-w-0">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-400">Häufige Fehler</p>
                <ul className="mt-1.5 space-y-1">
                  {d.fehler.map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink/90">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      <span className="min-w-0">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[260px]">
            <div className="mb-3 flex rounded-lg border border-[color:var(--ov-10)] bg-surface-2 p-0.5 text-xs">
              {[
                { k: "bewegung", l: "Bewegung" },
                { k: "muskeln", l: "Muskeln" },
              ].map((o) => (
                <button
                  key={o.k}
                  onClick={() => setAnsicht(o.k)}
                  className={cx(
                    "flex-1 rounded-md px-2.5 py-1 font-medium transition-colors",
                    ansicht === o.k ? "bg-accent-gradient text-white" : "text-muted hover:text-ink"
                  )}
                >
                  {o.l}
                </button>
              ))}
            </div>

            {ansicht === "bewegung" ? (
              <div className="rounded-2xl border border-[color:var(--ov-06)] bg-surface-2 p-3">
                <UebungAnimation muster={musterVon(d)} />
                <p className="mt-1 text-center text-[11px] text-faint">Bewegungsablauf – Schleife</p>
              </div>
            ) : (
              <>
                <Koerperkarte intensitaet={d.zielKarte} labels />
                <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-accent)" }} />
                    primär
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "color-mix(in srgb, var(--color-accent) 45%, transparent)" }} />
                    unterstützend
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="subtle" onClick={onClose}>Schließen</Button>
        </div>
      </Card>
    </div>,
    document.body
  )
}

// Kleiner Info-Button, der die Detailansicht einer Übung öffnet (für die
// Wiederverwendung in Session-/Plan-Ansichten).
export function UebungInfoButton({ id, className }) {
  const [offen, setOffen] = useState(false)
  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOffen(true)
        }}
        aria-label="Übungsdetails"
        className={cx(
          "grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[color:var(--ov-10)] text-[11px] font-semibold text-muted transition-colors hover:border-accent/40 hover:text-accent-soft",
          className
        )}
      >
        i
      </button>
      {offen && <UebungDetailModal id={id} onClose={() => setOffen(false)} />}
    </>
  )
}
