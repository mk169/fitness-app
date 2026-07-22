import { useEffect, useRef, useState } from "react"
import useStored from "../lib/useStored"
import { heute } from "../lib/datum"
import { uebungVon } from "../lib/uebungen"
import { verlaufVon, overloadVorschlag, e1rm } from "../lib/training"
import { Card, Check, cx, icons } from "./ui"

// Inline-Satz-Logger im „Stronger“-Stil: pro Übung eine Karte mit
// Spalten Set · Vorher · Wdh · KG · ✓. Sätze werden direkt hier abgehakt
// und ins gemeinsame trainingLog geschrieben – derselbe Speicher, den auch
// die Timer-Session und die Fortschritts-Statistik nutzen.

// „Vorher“-Werte: die Sätze der letzten abgeschlossenen Einheit (vor heute).
function vorherSaetze(log, uebungId, heuteKey) {
  const verlauf = verlaufVon(log, uebungId).filter((v) => v.datum < heuteKey)
  const letzte = verlauf[verlauf.length - 1]
  return letzte ? letzte.saetze : []
}

export default function InlineLogger({ eintraege }) {
  return (
    <div className="space-y-3">
      {eintraege.map((e) => (
        <UebungsKarte key={e.id} eintrag={e} />
      ))}
    </div>
  )
}

function UebungsKarte({ eintrag }) {
  const [log, setLog] = useStored("trainingLog", [])
  const [, setChecks] = useStored("checks", {})
  const heuteKey = heute()
  const uebung = uebungVon(eintrag.id)

  // Bearbeitbare Zeilen: einmal seed'en (aus heutigen Logs + Zielvorgabe).
  const [rows, setRows] = useState([])
  const seeded = useRef(false)

  useEffect(() => {
    if (seeded.current) return
    seeded.current = true
    const heuteSaetze = log
      .filter((s) => s.datum === heuteKey && s.uebungId === eintrag.id)
      .sort((a, b) => a.id - b.id)
    const v = overloadVorschlag(log, eintrag.id, heuteKey)
    const zielG = v?.gewicht ?? eintrag.gewicht ?? 0
    const zielW = v?.wdh ?? eintrag.wdh ?? 10
    const geloggt = heuteSaetze.map((s) => ({
      gewicht: s.gewicht ? String(s.gewicht) : "",
      wdh: s.wdh ? String(s.wdh) : "",
      logId: s.id,
    }))
    const fehlend = Math.max(0, (eintrag.saetze || 1) - geloggt.length)
    const leer = Array.from({ length: fehlend }, () => ({
      gewicht: zielG ? String(zielG) : "",
      wdh: zielW ? String(zielW) : "",
      logId: null,
    }))
    setRows([...geloggt, ...leer])
  }, [eintrag, log, heuteKey])

  if (!uebung) return null

  const cali = uebung.geraet === "Körpergewicht"
  const vorher = vorherSaetze(log, eintrag.id, heuteKey)
  const erledigt = rows.filter((r) => r.logId).length
  const alleFertig = rows.length > 0 && erledigt === rows.length

  // Tages-Häkchen der Übung an den Satz-Fortschritt koppeln.
  function syncCheck(anzahlDone) {
    const fertig = anzahlDone >= (eintrag.saetze || 1)
    setChecks((alt) => {
      const tag = alt[heuteKey] ?? {}
      const u = { ...(tag.uebungen ?? {}) }
      if (fertig) u[eintrag.id] = true
      else delete u[eintrag.id]
      return { ...alt, [heuteKey]: { ...tag, uebungen: u } }
    })
  }

  function setFeld(i, feld, wert) {
    setRows((alt) => {
      const neu = alt.map((r, j) => (j === i ? { ...r, [feld]: wert } : r))
      // Bereits geloggten Satz live im Speicher aktualisieren.
      const row = neu[i]
      if (row.logId) {
        setLog((l) =>
          l.map((s) =>
            s.id === row.logId ? { ...s, gewicht: Number(row.gewicht) || 0, wdh: Number(row.wdh) || 0 } : s
          )
        )
      }
      return neu
    })
  }

  function toggle(i, an) {
    const row = rows[i]
    if (an) {
      const w = Number(row.wdh)
      if (w < 1) return // ohne Wiederholungen kein Satz
      const logId = Date.now() + Math.random()
      setLog((l) => [
        ...l,
        { id: logId, datum: heuteKey, uebungId: eintrag.id, gewicht: Number(row.gewicht) || 0, wdh: w },
      ])
      setRows((alt) => alt.map((r, j) => (j === i ? { ...r, logId } : r)))
      syncCheck(erledigt + 1)
    } else {
      setLog((l) => l.filter((s) => s.id !== row.logId))
      setRows((alt) => alt.map((r, j) => (j === i ? { ...r, logId: null } : r)))
      syncCheck(erledigt - 1)
    }
  }

  function addSatz() {
    setRows((alt) => {
      const last = alt[alt.length - 1]
      return [...alt, { gewicht: last?.gewicht ?? "", wdh: last?.wdh ?? "", logId: null }]
    })
  }

  function ausVerlauf() {
    if (vorher.length === 0) return
    setRows((alt) =>
      alt.map((r, i) => {
        if (r.logId) return r // Geloggtes nicht überschreiben
        const v = vorher[i] ?? vorher[vorher.length - 1]
        return { ...r, gewicht: v.gewicht ? String(v.gewicht) : "", wdh: String(v.wdh) }
      })
    )
  }

  const numCls =
    "w-full rounded-lg border border-white/10 bg-surface-2 px-2 py-2 text-center text-base font-semibold tabular-nums text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"

  return (
    <Card className={cx("overflow-hidden p-0", alleFertig && "border-success/40")}>
      {/* Kopf: Icon + Name + Fortschritt */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent-soft">
          {icons.training("h-5 w-5")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{uebung.name}</p>
          <p className="text-xs text-muted">
            {cali ? "Körpergewicht" : uebung.geraet} · Ziel {eintrag.saetze}×{eintrag.wdh}
            {eintrag.gewicht > 0 ? ` @ ${eintrag.gewicht} kg` : ""}
          </p>
        </div>
        <span
          className={cx(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
            alleFertig ? "bg-success/15 text-success-soft" : "bg-white/10 text-muted"
          )}
        >
          {erledigt}/{rows.length}
        </span>
      </div>

      {/* Spaltenköpfe */}
      <div className="grid grid-cols-[2.2rem_1fr_1fr_1fr_2.6rem] items-center gap-2 px-4 pt-3 text-[10px] font-semibold uppercase tracking-wider text-faint">
        <span className="text-center">Set</span>
        <span className="text-center">Vorher</span>
        <span className="text-center">Wdh</span>
        <span className="text-center">{cali ? "Zusatz" : "KG"}</span>
        <span className="text-center">✓</span>
      </div>

      {/* Sätze */}
      <div className="space-y-1.5 px-4 py-3">
        {rows.map((r, i) => {
          const v = vorher[i]
          return (
            <div
              key={i}
              className={cx(
                "grid grid-cols-[2.2rem_1fr_1fr_1fr_2.6rem] items-center gap-2 rounded-xl border px-2 py-1.5 transition-colors",
                r.logId ? "border-success/30 bg-success/[0.06]" : "border-white/[0.06] bg-surface-2/40"
              )}
            >
              <span className="text-center text-sm font-semibold text-muted">{i + 1}</span>
              <span className="text-center text-xs text-faint">
                {v ? `${v.wdh}${v.gewicht ? ` × ${v.gewicht}` : ""}` : "–"}
              </span>
              <input
                type="number" min="0" inputMode="numeric" value={r.wdh}
                onChange={(e) => setFeld(i, "wdh", e.target.value)}
                className={numCls}
              />
              <input
                type="number" min="0" step="0.5" inputMode="decimal" value={r.gewicht}
                onChange={(e) => setFeld(i, "gewicht", e.target.value)}
                placeholder={cali ? "0" : ""}
                className={numCls}
              />
              <div className="flex justify-center">
                <Check checked={!!r.logId} onChange={(an) => toggle(i, an)} title="Satz erledigt" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Aktionen */}
      <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] px-4 py-2.5">
        <button
          onClick={addSatz}
          className="rounded-lg border border-white/10 bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
        >
          + Satz
        </button>
        <button
          onClick={ausVerlauf}
          disabled={vorher.length === 0}
          className="rounded-lg border border-white/10 bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink disabled:opacity-40"
        >
          ↻ Aus Verlauf laden
        </button>
        {erledigt > 0 && (
          <span className="ml-auto text-xs text-faint">
            Bestwert heute: {Math.max(...rows.filter((r) => r.logId).map((r) => e1rm(Number(r.gewicht) || 0, Number(r.wdh) || 0)))}
            {cali ? " Wdh." : " kg (e1RM)"}
          </span>
        )}
      </div>
    </Card>
  )
}
