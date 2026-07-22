import { useEffect, useState } from "react"
import useStored from "../lib/useStored"
import { heute } from "../lib/datum"
import { uebungVon, muskelnVon } from "../lib/uebungen"
import { SPLITS, WOCHEN_KEYS, standardTage, tagesName, planTag, normEintrag } from "../lib/splits"
import { verlaufVon } from "../lib/training"
import { montagVon } from "../lib/statistik"
import { useZiel } from "./ZielSeite"
import InlineLogger from "./InlineLogger"
import { TrainingsHeatmap } from "./Streak"
import { Card, PageHeader, SectionTitle, Button, cx, labelCls, icons } from "./ui"

// Trainings-Zentrale in fester Reihenfolge:
//   1. Heute – Inline-Logging (Stronger-Stil), Timer-Session als Fokus-Modus
//   2. Cardio-Einstieg (Lauf/Walk)
//   3. Wochenplan
//   4. 4-Wochen-Plan-Übersicht
//   5. Fortschritt (Kurven + Streak/Heatmap)
//   6. Ganz unten: eine Taste „Trainingsplan anpassen“.

const WOCHENTAGE = [
  { key: "mo", name: "Montag", kurz: "Mo" },
  { key: "di", name: "Dienstag", kurz: "Di" },
  { key: "mi", name: "Mittwoch", kurz: "Mi" },
  { key: "do", name: "Donnerstag", kurz: "Do" },
  { key: "fr", name: "Freitag", kurz: "Fr" },
  { key: "sa", name: "Samstag", kurz: "Sa" },
  { key: "so", name: "Sonntag", kurz: "So" },
]

const LEER = { mo: [], di: [], mi: [], do: [], fr: [], sa: [], so: [] }

function heutigerTagKey() {
  return WOCHEN_KEYS[(new Date().getDay() + 6) % 7]
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function TrainingsplanSeite({ onNavigate }) {
  const [wochenplan] = useStored("trainingsplanUebungen", LEER)
  const { profil } = useZiel()
  const [fokusModus, setFokusModus] = useState(false)

  const tagKey = heutigerTagKey()
  const heuteEintraege = planTag(wochenplan, tagKey)
  const tageWahl = profil.tageWahl ?? standardTage(profil.trainingsTage ?? 3)
  const splitWahl = profil.splitWahl ?? "oberUnter"
  const einheitName = tagesName(splitWahl, tageWahl, tagKey)

  if (fokusModus) {
    return (
      <SessionAnsicht
        eintraege={heuteEintraege}
        profil={profil}
        einheitName={einheitName}
        onEnde={() => setFokusModus(false)}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Training"
        subtitle={`${SPLITS[splitWahl]?.name} · ${tageWahl.length}× / Woche`}
      />

      {/* 1. Heute – Inline-Logging */}
      <HeuteBlock
        eintraege={heuteEintraege}
        einheitName={einheitName}
        onFokus={() => setFokusModus(true)}
      />

      {/* 2. Wochenplan */}
      <Wochenplan wochenplan={wochenplan} splitWahl={splitWahl} tageWahl={tageWahl} tagKey={tagKey} />

      {/* 3. 4-Wochen-Plan */}
      <VierWochenPlan wochenplan={wochenplan} splitWahl={splitWahl} tageWahl={tageWahl} />

      {/* 4. Fortschritt */}
      <ProgressStatistik wochenplan={wochenplan} />

      {/* 5. Eine Taste zur Anpassung */}
      <button
        onClick={() => onNavigate("anpassung", { fokus: "training" })}
        className="mt-8 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-surface px-5 py-4 text-left transition-colors hover:border-accent/50"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
            {icons.zahnrad("h-5 w-5")}
          </span>
          <span>
            <span className="block font-semibold text-ink">Trainingsplan anpassen</span>
            <span className="mt-0.5 block text-xs text-muted">Split, Tage, Übungen &amp; Ziele</span>
          </span>
        </span>
        <span className="text-accent">→</span>
      </button>
    </div>
  )
}

// ---- 1. Heute: Inline-Logging-Karte(n) + Fokus-Modus ----
function HeuteBlock({ eintraege, einheitName, onFokus }) {
  const [checks] = useStored("checks", {})
  const heuteKey = heute()
  const tages = checks[heuteKey] ?? {}
  const abgehakt = eintraege.filter((e) => tages.uebungen?.[e.id]).length
  const alleFertig = eintraege.length > 0 && abgehakt === eintraege.length

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            Heute{einheitName && eintraege.length > 0 ? ` · ${einheitName}` : ""}
          </p>
          <p className="mt-0.5 text-xl font-bold tracking-tight text-ink">
            {eintraege.length === 0
              ? "Ruhetag"
              : alleFertig
                ? "Training abgeschlossen 💪"
                : `${abgehakt}/${eintraege.length} Übungen erledigt`}
          </p>
        </div>
        {eintraege.length > 0 && (
          <Button variant="subtle" onClick={onFokus} className="gap-1.5">
            {icons.stats("h-4 w-4")} Fokus-Modus (Timer)
          </Button>
        )}
      </div>

      {eintraege.length === 0 ? (
        <Card className="mt-3 p-6 text-center text-sm text-muted">
          Heute ist Ruhetag. Genieße die Erholung – Regeneration ist Teil des Plans.
        </Card>
      ) : (
        <div className="mt-3">
          <InlineLogger eintraege={eintraege} />
        </div>
      )}
    </section>
  )
}

// ---- 2. Wochenplan-Übersicht ----
function Wochenplan({ wochenplan, splitWahl, tageWahl, tagKey }) {
  const [checks] = useStored("checks", {})
  const heuteKey = heute()

  return (
    <section className="mt-8">
      <SectionTitle>Wochenplan</SectionTitle>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {WOCHENTAGE.map((t) => {
          const eintraege = planTag(wochenplan, t.key)
          const istHeute = t.key === tagKey
          const fertig =
            istHeute &&
            eintraege.length > 0 &&
            eintraege.every((e) => checks[heuteKey]?.uebungen?.[e.id])
          const geraete = new Set(eintraege.map((e) => uebungVon(e.id)?.geraet === "Körpergewicht" ? "Cali" : "Gym"))
          const modus = eintraege.length === 0 ? null : geraete.size > 1 ? "Mix" : [...geraete][0]
          return (
            <div
              key={t.key}
              className={cx(
                "rounded-xl border bg-surface p-3.5",
                istHeute ? "border-accent/60" : "border-white/[0.06]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cx(
                  "text-xs font-semibold uppercase tracking-wide",
                  istHeute ? "text-accent-soft" : "text-faint"
                )}>
                  {t.name}
                </span>
                {fertig ? (
                  <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success-soft">
                    ✓ fertig
                  </span>
                ) : modus ? (
                  <span
                    className={cx(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      modus === "Cali"
                        ? "bg-success/15 text-success-soft"
                        : modus === "Mix"
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-white/10 text-muted"
                    )}
                  >
                    {modus}
                  </span>
                ) : null}
              </div>
              {eintraege.length === 0 ? (
                <p className="mt-1.5 text-xs text-faint">Ruhetag</p>
              ) : (
                <>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {tagesName(splitWahl, tageWahl, t.key) ?? "Training"} · {eintraege.length} Übungen
                  </p>
                  <p className="mt-1 truncate text-xs text-muted">
                    {eintraege.map((e) => uebungVon(e.id)?.name).filter(Boolean).join(", ")}
                  </p>
                </>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ---- 4. 4-Wochen-Plan: aktuelle + 3 folgende Wochen mit Abhak-Status ----
function VierWochenPlan({ wochenplan, splitWahl, tageWahl }) {
  const [checks] = useStored("checks", {})
  const heuteKey = heute()
  const basis = montagVon(new Date())

  const wochen = Array.from({ length: 4 }, (_, w) => {
    const montag = new Date(basis)
    montag.setDate(montag.getDate() + w * 7)
    const sonntag = new Date(montag)
    sonntag.setDate(sonntag.getDate() + 6)

    const tage = WOCHEN_KEYS.filter((k) => tageWahl.includes(k)).map((k) => {
      const d = new Date(montag)
      d.setDate(d.getDate() + WOCHEN_KEYS.indexOf(k))
      const dk = dateKey(d)
      const eintraege = planTag(wochenplan, k)
      const vorbei = dk <= heuteKey
      const fertig =
        vorbei &&
        eintraege.length > 0 &&
        eintraege.every((e) => checks[dk]?.uebungen?.[e.id])
      return {
        name: tagesName(splitWahl, tageWahl, k) ?? "Training",
        anzahl: eintraege.length,
        fertig,
      }
    })
    return { w, montag, sonntag, tage }
  })

  const fmt = (d) => `${d.getDate()}.${d.getMonth() + 1}.`

  return (
    <section className="mt-8">
      <SectionTitle>4-Wochen-Plan</SectionTitle>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {wochen.map(({ w, montag, sonntag, tage }) => (
          <Card key={w} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">
                Woche {w + 1}
                {w === 0 && (
                  <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent-soft">
                    aktuell
                  </span>
                )}
              </span>
              <span className="text-xs text-faint">{fmt(montag)}–{fmt(sonntag)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tage.map((t, i) => (
                <span
                  key={i}
                  className={cx(
                    "flex items-center gap-1 rounded-lg border px-2 py-1 text-xs",
                    t.fertig
                      ? "border-success/40 bg-success/10 text-success-soft"
                      : "border-white/10 bg-surface-2 text-muted"
                  )}
                >
                  {t.fertig && <span>✓</span>}
                  {t.name}
                  <span className="text-[10px] text-faint">{t.anzahl}</span>
                </span>
              ))}
              {tage.length === 0 && <span className="text-xs text-faint">Keine Trainingstage gewählt.</span>}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

// ---- Session: Timer + Inline-Logging (Fokus-Modus) ----
function SessionAnsicht({ eintraege, profil, einheitName, onEnde }) {
  const [phase, setPhase] = useState("setup") // setup | laeuft
  const [minuten, setMinuten] = useState(String(profil.zeitProEinheit ?? 60))
  const [ende, setEnde] = useState(null)
  const [pausenRest, setPausenRest] = useState(null)
  const [, setTick] = useState(0)

  // Sekündlicher Tick, solange der Timer läuft.
  useEffect(() => {
    if (phase !== "laeuft" || pausenRest !== null) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [phase, pausenRest])

  const restSek = pausenRest ?? (ende ? Math.max(0, Math.round((ende - Date.now()) / 1000)) : 0)
  const zeit = `${String(Math.floor(restSek / 60)).padStart(2, "0")}:${String(restSek % 60).padStart(2, "0")}`
  const gesamtSek = Number(minuten) * 60 || 1
  const fortschritt = phase === "laeuft" ? 1 - restSek / gesamtSek : 0

  function starten() {
    setEnde(Date.now() + (Number(minuten) || 60) * 60 * 1000)
    setPhase("laeuft")
  }
  function pauseToggle() {
    if (pausenRest === null) {
      setPausenRest(restSek)
    } else {
      setEnde(Date.now() + pausenRest * 1000)
      setPausenRest(null)
    }
  }

  if (phase === "setup") {
    return (
      <div>
        <button onClick={onEnde} className="text-xs font-medium text-muted transition-colors hover:text-ink">
          ← Zurück
        </button>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
          Fokus-Modus{einheitName ? ` · ${einheitName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Timer einstellen, dann geht’s los. {eintraege.length} Übungen stehen an.
        </p>

        <Card className="mt-6 max-w-sm p-5">
          <label className={labelCls}>
            Dauer (Minuten)
            <input
              type="number" min="10" step="5" value={minuten}
              onChange={(e) => setMinuten(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-3 text-center text-2xl font-bold tabular-nums text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </label>
          <Button onClick={starten} className="mt-4 w-full py-3">
            ▶ Los geht’s
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* Timer-Kopf */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            Fokus-Modus{einheitName ? ` · ${einheitName}` : ""}
            {pausenRest !== null && " · Pause"}
          </p>
          <p className={cx(
            "text-5xl font-bold tabular-nums tracking-tight",
            restSek === 0 ? "text-success-soft" : "text-ink"
          )}>
            {restSek === 0 ? "Zeit um!" : zeit}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="subtle" onClick={pauseToggle}>
            {pausenRest !== null ? "▶ Weiter" : "❚❚ Pause"}
          </Button>
          <Button variant="success" onClick={onEnde}>Beenden</Button>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-accent-gradient transition-all" style={{ width: `${fortschritt * 100}%` }} />
      </div>

      {/* Inline-Logging wie auf der Hauptansicht */}
      <div className="mt-6">
        <InlineLogger eintraege={eintraege} />
      </div>
    </div>
  )
}

// ---- 5. Fortschritt: Kurven (Gewicht/Wdh/Leistung) + Streak/Heatmap ----
const METRIKEN = [
  { id: "gewicht", label: "Gewicht", einheitGym: "kg (e1RM)", einheitCali: "Wdh." },
  { id: "wdh", label: "Wdh.", einheitGym: "Wdh.", einheitCali: "Wdh." },
  { id: "leistung", label: "Leistung", einheitGym: "kg Vol.", einheitCali: "Vol." },
]

function ProgressStatistik({ wochenplan }) {
  const [log] = useStored("trainingLog", [])

  const geloggt = [...new Set(log.map((s) => s.uebungId))]
  const planIds = Object.values(wochenplan).flat().map((e) => normEintrag(e).id)
  const imPlan = [...new Set(planIds)].filter((id) => !geloggt.includes(id))
  const auswahlIds = [...geloggt, ...imPlan]
  const [gewaehlt, setGewaehlt] = useState(null)
  const [metrik, setMetrik] = useState("gewicht")
  const aktivId = gewaehlt ?? auswahlIds[0]
  const uebung = uebungVon(aktivId)
  const cali = uebung?.geraet === "Körpergewicht"

  const verlauf = aktivId ? verlaufVon(log, aktivId) : []
  const metaMetrik = METRIKEN.find((m) => m.id === metrik)
  const einheit = cali ? metaMetrik.einheitCali : metaMetrik.einheitGym

  // Rohverlauf auf die gewählte Metrik abbilden.
  const punkte = verlauf.map((v) => ({
    datum: v.datum,
    wert:
      metrik === "leistung"
        ? v.volumen
        : metrik === "wdh"
          ? Math.max(...v.saetze.map((s) => s.wdh))
          : v.best,
  }))

  const erster = punkte[0]
  const letzter = punkte[punkte.length - 1]
  const steigerung =
    erster && letzter && erster.wert > 0
      ? Math.round(((letzter.wert - erster.wert) / erster.wert) * 100)
      : null

  return (
    <section className="mt-8">
      <SectionTitle
        right={
          auswahlIds.length > 0 && (
            <select
              value={aktivId ?? ""}
              onChange={(e) => setGewaehlt(e.target.value)}
              className="rounded-lg border border-white/10 bg-surface-2 px-2.5 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            >
              {auswahlIds.map((id) => {
                const u = uebungVon(id)
                return u ? (
                  <option key={id} value={id}>
                    {u.name}{geloggt.includes(id) ? "" : " (noch kein Log)"}
                  </option>
                ) : null
              })}
            </select>
          )
        }
      >
        Fortschritt
      </SectionTitle>

      <Card className="mt-3 p-5">
        {/* Metrik-Tabs (Gewicht / Wdh / Leistung) */}
        <div className="flex gap-1 rounded-lg border border-white/10 bg-surface-2 p-0.5 text-xs">
          {METRIKEN.map((m) => (
            <button
              key={m.id}
              onClick={() => setMetrik(m.id)}
              className={cx(
                "flex-1 rounded-md px-2.5 py-1.5 font-medium transition-colors",
                metrik === m.id ? "bg-accent-gradient on-accent" : "text-muted hover:text-ink"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {punkte.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Noch keine Sätze geloggt – hake oben Sätze ab, dann erscheint hier deine Kurve.
          </p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-xs text-faint">Bestwert</p>
                <p className="font-semibold text-ink">
                  {Math.max(...punkte.map((v) => v.wert))} {einheit}
                </p>
              </div>
              <div>
                <p className="text-xs text-faint">Letzte Einheit</p>
                <p className="font-semibold text-ink">{letzter.wert} {einheit}</p>
              </div>
              {steigerung !== null && punkte.length > 1 && (
                <div>
                  <p className="text-xs text-faint">Seit Beginn</p>
                  <p className={cx("font-semibold", steigerung >= 0 ? "text-success-soft" : "text-rose-400")}>
                    {steigerung > 0 ? "+" : ""}{steigerung} %
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Diagramm punkte={punkte} einheit={einheit} />
            </div>
          </>
        )}
      </Card>

      {/* Streak + Heatmap + Diese Woche */}
      <TrainingsHeatmap />
    </section>
  )
}

// Einfaches SVG-Liniendiagramm eines Wertverlaufs.
function Diagramm({ punkte, einheit }) {
  if (punkte.length < 2) {
    return (
      <p className="text-xs text-muted">
        Nach der zweiten Einheit erscheint hier deine Fortschrittskurve.
      </p>
    )
  }

  const W = 560, H = 180, P = 30
  const werte = punkte.map((v) => v.wert)
  let min = Math.min(...werte)
  let max = Math.max(...werte)
  if (min === max) { min -= 1; max += 1 }
  const spanne = max - min
  min -= spanne * 0.1
  max += spanne * 0.1

  const x = (i) => P + (i * (W - 2 * P)) / (punkte.length - 1)
  const y = (v) => H - P - ((v - min) * (H - 2 * P)) / (max - min)
  const linie = punkte.map((v, i) => `${x(i)},${y(v.wert)}`).join(" ")
  const datumKurz = (key) => {
    const d = new Date(`${key}T00:00:00`)
    return `${d.getDate()}.${d.getMonth() + 1}.`
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5a524" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f5a524" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={P} x2={W - P}
          y1={P + f * (H - 2 * P)} y2={P + f * (H - 2 * P)}
          stroke="#ffffff" strokeOpacity="0.06"
        />
      ))}
      <polygon
        points={`${x(0)},${H - P} ${linie} ${x(punkte.length - 1)},${H - P}`}
        fill="url(#chartFill)"
      />
      <polyline points={linie} fill="none" stroke="#fcd34d" strokeWidth="2.5" strokeLinejoin="round" />
      {punkte.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v.wert)} r={i === punkte.length - 1 ? 5 : 3.5} fill="#fcd34d" />
      ))}
      <text x={x(punkte.length - 1)} y={y(punkte[punkte.length - 1].wert) - 10} textAnchor="end" fill="#f4f5f8" style={{ fontSize: 12, fontWeight: 600 }}>
        {punkte[punkte.length - 1].wert} {einheit}
      </text>
      <text x={P} y={H - 8} fill="#6b7280" style={{ fontSize: 10 }}>
        {datumKurz(punkte[0].datum)}
      </text>
      <text x={W - P} y={H - 8} textAnchor="end" fill="#6b7280" style={{ fontSize: 10 }}>
        {datumKurz(punkte[punkte.length - 1].datum)}
      </text>
    </svg>
  )
}

// Für die Dashboard-Vorschau.
export function useTrainingsUebersicht() {
  const [plan] = useStored("trainingsplanUebungen", LEER)
  const tage = WOCHENTAGE.filter((t) => (plan[t.key] ?? []).length > 0).map((t) => ({
    ...t,
    anzahl: plan[t.key].length,
  }))
  const alleMuskeln = muskelnVon(
    Object.values(plan).flat().map((e) => normEintrag(e).id)
  )
  return { anzahl: tage.length, tage, muskeln: alleMuskeln }
}
