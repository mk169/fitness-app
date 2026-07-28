import { useEffect, useState } from "react"
import useStored from "../lib/useStored"
import { heute } from "../lib/datum"
import { MUSKELGRUPPEN, uebungVon, muskelnVon } from "../lib/uebungen"
import { SPLITS, WOCHEN_KEYS, standardTage, tagesName, planTag, normEintrag } from "../lib/splits"
import { e1rm, verlaufVon, overloadVorschlag } from "../lib/training"
import {
  wochenVolumen, intensitaet, bewertung, persoenlicheRekorde, konsistenz,
  tonnageVerlauf, VOLUMEN_MIN, VOLUMEN_OPT,
} from "../lib/analytik"
import { useZiel } from "./ZielSeite"
import Koerperkarte from "./Koerperkarte"
import { Card, PageHeader, SectionTitle, Button, cx, labelCls } from "./ui"

// Trainingsplan-Seite = Trainings-Zentrale: was wird heute trainiert
// (mit Session-Start), Wochenplan-Übersicht und Fortschritts-Statistik.
// Bearbeitet wird der Plan in „Ziel & Anpassung“.

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

export default function TrainingsplanSeite({ onZiel, autostart, onAutostartFertig }) {
  const [wochenplan] = useStored("trainingsplanUebungen", LEER)
  const { profil } = useZiel()
  const [sessionAktiv, setSessionAktiv] = useState(false)

  const tagKey = heutigerTagKey()
  const heuteEintraege = planTag(wochenplan, tagKey)
  const tageWahl = profil.tageWahl ?? standardTage(profil.trainingsTage ?? 3)

  // Vom Dashboard „Training starten": Session direkt öffnen (wenn heute etwas ansteht).
  useEffect(() => {
    if (!autostart) return
    if (heuteEintraege.length > 0) setSessionAktiv(true)
    onAutostartFertig?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const splitWahl = profil.splitWahl ?? "oberUnter"

  if (sessionAktiv) {
    return (
      <SessionAnsicht
        eintraege={heuteEintraege}
        profil={profil}
        einheitName={tagesName(splitWahl, tageWahl, tagKey)}
        onEnde={() => setSessionAktiv(false)}
      />
    )
  }

  return (
    <div>
      <PageHeader
        title="Trainingsplan"
        subtitle={`${SPLITS[splitWahl]?.name} · ${tageWahl.length}× / Woche`}
        right={
          onZiel && (
            <Button variant="subtle" onClick={onZiel}>
              Plan bearbeiten →
            </Button>
          )
        }
      />

      <HeuteKarte
        eintraege={heuteEintraege}
        einheitName={tagesName(splitWahl, tageWahl, tagKey)}
        onStart={() => setSessionAktiv(true)}
      />

      <Wochenplan wochenplan={wochenplan} splitWahl={splitWahl} tageWahl={tageWahl} tagKey={tagKey} />

      <AnalyseSektion />

      <ProgressStatistik wochenplan={wochenplan} />
    </div>
  )
}

// ---- Analyse: Muskel-Volumen-Heatmap, Rekorde, Konsistenz, Tonnage ----
const BEWERTUNG_STIL = {
  wenig: { chip: "bg-amber-500/15 text-amber-300", label: "zu wenig" },
  optimal: { chip: "bg-emerald-500/15 text-emerald-300", label: "optimal" },
  viel: { chip: "bg-rose-500/15 text-rose-300", label: "viel" },
}

function AnalyseSektion() {
  const [log] = useStored("trainingLog", [])
  const [wochen, setWochen] = useState(1)
  const heuteKey = heute()

  const vol = wochenVolumen(log, heuteKey, wochen)
  const intens = intensitaet(
    // Bei mehreren Wochen auf Wochenschnitt normieren, damit die Skala passt.
    Object.fromEntries(Object.entries(vol).map(([k, v]) => [k, v / wochen]))
  )
  const prs = persoenlicheRekorde(log).slice(0, 6)
  const kons = konsistenz(log, heuteKey)
  const tonnage = tonnageVerlauf(log, 8, heuteKey)
  const muskelListe = Object.entries(vol).sort((a, b) => b[1] - a[1])
  const hatDaten = log.length > 0

  return (
    <section className="mt-8">
      <SectionTitle
        right={
          <div className="flex rounded-lg border border-[color:var(--ov-10)] bg-surface-2 p-0.5 text-xs">
            {[{ w: 1, l: "1 Woche" }, { w: 4, l: "4 Wochen" }].map((o) => (
              <button
                key={o.w}
                onClick={() => setWochen(o.w)}
                className={cx(
                  "rounded-md px-2.5 py-1 font-medium transition-colors",
                  wochen === o.w ? "bg-accent-gradient text-white" : "text-muted hover:text-ink"
                )}
              >
                {o.l}
              </button>
            ))}
          </div>
        }
      >
        Analyse
      </SectionTitle>

      {!hatDaten ? (
        <Card className="mt-3 p-6 text-center text-sm text-muted">
          Noch keine Daten – logge Sätze in einer Session, dann erscheinen hier
          deine Muskel-Auslastung, Rekorde und Konsistenz.
        </Card>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Heatmap + Volumen je Muskel */}
          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
              Muskel-Auslastung {wochen > 1 ? `(${wochen} Wochen)` : "(diese Woche)"}
            </p>
            <div className="mt-2">
              <Koerperkarte intensitaet={intens} labels />
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-faint">
              <span>wenig</span>
              <span className="h-2 flex-1 rounded-full" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 22%, transparent), var(--color-accent))" }} />
              <span>viel</span>
            </div>
            {muskelListe.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {muskelListe.map(([m, saetze]) => {
                  const b = BEWERTUNG_STIL[bewertung(saetze / wochen)]
                  return (
                    <li key={m} className="flex items-center gap-2 text-sm">
                      <span className="w-28 shrink-0 text-muted">{MUSKELGRUPPEN[m]?.name ?? m}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color:var(--ov-10)]">
                        <div className="h-full rounded-full bg-accent-gradient"
                          style={{ width: `${Math.min(100, (saetze / wochen / VOLUMEN_OPT) * 100)}%` }} />
                      </div>
                      <span className="w-10 shrink-0 text-right tabular-nums text-ink">{saetze}</span>
                      <span className={cx("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium", b.chip)}>{b.label}</span>
                    </li>
                  )
                })}
              </ul>
            )}
            <p className="mt-2 text-[10px] text-faint">Richtwert: {VOLUMEN_MIN}–{VOLUMEN_OPT} Sätze / Muskel / Woche.</p>
          </Card>

          {/* Konsistenz + Tonnage + Rekorde */}
          <div className="space-y-4">
            <Card className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Konsistenz</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <KennZahl wert={kons.serie} label={kons.serie === 1 ? "Woche Serie" : "Wochen Serie"} akzent />
                <KennZahl wert={kons.tage7} label="Tage / 7" />
                <KennZahl wert={kons.tage28} label="Tage / 28" />
              </div>
              <TonnageChart reihen={tonnage} />
            </Card>

            <Card className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Persönliche Rekorde</p>
              <ul className="mt-2 divide-y divide-[color:var(--ov-06)]">
                {prs.map((r) => (
                  <li key={r.uebungId} className="flex items-center gap-3 py-2 text-sm">
                    <span className="min-w-0 flex-1 truncate text-ink">{r.name}</span>
                    <span className="font-semibold text-accent-soft">
                      {r.koerpergewicht ? `${r.wdh} Wdh.` : `${r.wert} kg`}
                    </span>
                    <span className="w-16 shrink-0 text-right text-xs text-faint">
                      {new Date(`${r.datum}T00:00:00`).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </section>
  )
}

function KennZahl({ wert, label, akzent }) {
  return (
    <div className="rounded-xl bg-[color:var(--ov-05)] py-3">
      <p className={cx("text-2xl font-bold tabular-nums", akzent ? "text-gradient" : "text-ink")}>{wert}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-faint">{label}</p>
    </div>
  )
}

// Kleiner Balken-Trend der Wochen-Tonnage (8 Wochen).
function TonnageChart({ reihen }) {
  const max = Math.max(1, ...reihen.map((r) => r.tonnage))
  return (
    <div className="mt-4">
      <p className="text-[10px] uppercase tracking-wide text-faint">Volumen / Woche (kg×Wdh)</p>
      <div className="mt-2 flex h-16 items-end gap-1">
        {reihen.map((r, i) => (
          <div key={i} className="flex-1" title={`${r.tonnage} kg×Wdh`}>
            <div
              className={cx("w-full rounded-t", i === reihen.length - 1 ? "bg-accent-gradient" : "bg-[color:var(--ov-15)]")}
              style={{ height: `${Math.max(3, (r.tonnage / max) * 56)}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Heute: Übungen mit Zielvorgaben abhaken + Session starten ----
function HeuteKarte({ eintraege, einheitName, onStart }) {
  const [checks, setChecks] = useStored("checks", {})
  const heuteKey = heute()
  const tages = checks[heuteKey] ?? {}
  const abgehakt = eintraege.filter((e) => tages.uebungen?.[e.id]).length

  function toggle(id) {
    const u = { ...(tages.uebungen ?? {}) }
    u[id] = !u[id]
    setChecks({ ...checks, [heuteKey]: { ...tages, uebungen: u } })
  }

  return (
    <section className="relative mt-6 overflow-hidden rounded-2xl border border-accent/30 bg-surface p-5 shadow-[var(--shadow-glow)]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            Heute{einheitName && eintraege.length > 0 ? ` · ${einheitName}` : ""}
          </p>
          <p className="mt-0.5 text-lg font-semibold text-ink">
            {eintraege.length === 0 ? "Ruhetag" : `${abgehakt}/${eintraege.length} Übungen erledigt`}
          </p>
        </div>
        {eintraege.length > 0 && (
          <Button onClick={onStart} className="px-5 py-2.5">
            ▶ Session starten
          </Button>
        )}
      </div>

      {eintraege.length > 0 && (
        <ul className="mt-3 grid gap-x-6 sm:grid-cols-2">
          {eintraege.map((e) => {
            const u = uebungVon(e.id)
            if (!u) return null
            const check = !!tages.uebungen?.[e.id]
            return (
              <li key={e.id} className="flex items-center gap-2.5 border-b border-[color:var(--ov-06)] py-1.5">
                <input
                  type="checkbox"
                  checked={check}
                  onChange={() => toggle(e.id)}
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
                <span className={cx("flex-1 text-sm", check ? "text-faint line-through" : "text-ink/90")}>
                  {u.name}
                </span>
                <span className="text-xs tabular-nums text-muted">
                  {e.saetze}×{e.wdh}{e.gewicht > 0 ? ` · ${e.gewicht} kg` : ""}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

// ---- Wochenplan-Übersicht ----
function Wochenplan({ wochenplan, splitWahl, tageWahl, tagKey }) {
  return (
    <section className="mt-8">
      <SectionTitle>Wochenplan</SectionTitle>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {WOCHENTAGE.map((t) => {
          const eintraege = planTag(wochenplan, t.key)
          const istHeute = t.key === tagKey
          const geraete = new Set(eintraege.map((e) => uebungVon(e.id)?.geraet === "Körpergewicht" ? "Cali" : "Gym"))
          const modus = eintraege.length === 0 ? null : geraete.size > 1 ? "Mix" : [...geraete][0]
          return (
            <div
              key={t.key}
              className={cx(
                "min-w-0 rounded-xl border bg-surface p-3.5",
                istHeute ? "border-accent/60" : "border-[color:var(--ov-06)]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cx(
                  "text-xs font-semibold uppercase tracking-wide",
                  istHeute ? "text-accent-soft" : "text-faint"
                )}>
                  {t.name}
                </span>
                {modus && (
                  <span
                    className={cx(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      modus === "Cali"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : modus === "Mix"
                          ? "bg-violet-500/15 text-violet-300"
                          : "bg-indigo-500/15 text-indigo-300"
                    )}
                  >
                    {modus}
                  </span>
                )}
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

// ---- Session: Timer + Übungen + Satz-Logging + Körperkarte ----
function SessionAnsicht({ eintraege, profil, einheitName, onEnde }) {
  const [log, setLog] = useStored("trainingLog", [])
  const [checks, setChecks] = useStored("checks", {})
  const heuteKey = heute()

  const [phase, setPhase] = useState("setup") // setup | laeuft
  const [minuten, setMinuten] = useState(String(profil.zeitProEinheit ?? 60))
  const [ende, setEnde] = useState(null)
  const [pausenRest, setPausenRest] = useState(null)
  const [, setTick] = useState(0)

  const [aktiv, setAktiv] = useState(eintraege[0]?.id ?? null)
  const [gewicht, setGewicht] = useState("")
  const [wdh, setWdh] = useState("")

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

  const uebung = uebungVon(aktiv)
  const ziel = eintraege.find((e) => e.id === aktiv)
  const muskeln = uebung ? new Set([...uebung.muskeln, ...(uebung.sekundaer ?? [])]) : new Set()
  const tages = checks[heuteKey] ?? {}
  const vorschlag = aktiv ? overloadVorschlag(log, aktiv, heuteKey) : null
  const heutigeSaetze = log.filter((s) => s.datum === heuteKey && s.uebungId === aktiv)

  function starten() {
    setEnde(Date.now() + (Number(minuten) || 60) * 60 * 1000)
    setPhase("laeuft")
    if (aktiv) waehleUebung(aktiv) // Eingaben mit Vorschlag/Plan vorbelegen
  }
  function pauseToggle() {
    if (pausenRest === null) {
      setPausenRest(restSek)
    } else {
      setEnde(Date.now() + pausenRest * 1000)
      setPausenRest(null)
    }
  }

  function hakeAb(id, wert = true) {
    // Funktionales Update: bleibt auch bei schnellen Folge-Klicks korrekt.
    setChecks((alt) => {
      const tag = alt[heuteKey] ?? {}
      return {
        ...alt,
        [heuteKey]: { ...tag, uebungen: { ...(tag.uebungen ?? {}), [id]: wert } },
      }
    })
  }

  // Übung wechseln: Eingaben mit Overload-Vorschlag bzw. Planvorgabe füllen.
  function waehleUebung(id) {
    setAktiv(id)
    const e = eintraege.find((x) => x.id === id)
    const v = overloadVorschlag(log, id, heuteKey)
    setGewicht(String(v?.gewicht ?? e?.gewicht ?? "") || "")
    setWdh(String(v?.wdh ?? e?.wdh ?? "") || "")
  }

  function satzSpeichern(e) {
    e.preventDefault()
    const w = Number(wdh)
    if (!aktiv || w < 1) return
    const uebungId = aktiv
    const zielSaetze = ziel?.saetze ?? 1
    setLog((alt) => {
      const neu = [
        ...alt,
        { id: Date.now() + Math.random(), datum: heuteKey, uebungId, gewicht: Number(gewicht) || 0, wdh: w },
      ]
      // Abhaken, sobald die geplanten Sätze erreicht sind.
      const anzahl = neu.filter((s) => s.datum === heuteKey && s.uebungId === uebungId).length
      if (anzahl >= zielSaetze) hakeAb(uebungId)
      return neu
    })
  }

  if (phase === "setup") {
    return (
      <div>
        <button onClick={onEnde} className="text-xs font-medium text-muted transition-colors hover:text-ink">
          ← Abbrechen
        </button>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
          Session{einheitName ? ` · ${einheitName}` : ""}
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
              className="mt-1 w-full rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-3 text-center text-2xl font-bold tabular-nums text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </label>
          <Button onClick={starten} className="mt-4 w-full py-3">
            ▶ Los geht’s
          </Button>
        </Card>

        <ul className="mt-6 max-w-sm space-y-1.5">
          {eintraege.map((e) => {
            const u = uebungVon(e.id)
            return u ? (
              <li key={e.id} className="flex items-center gap-2 text-sm text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
                <span className="flex-1">{u.name}</span>
                <span className="text-xs tabular-nums text-faint">
                  {e.saetze}×{e.wdh}{e.gewicht > 0 ? ` · ${e.gewicht} kg` : ""}
                </span>
              </li>
            ) : null
          })}
        </ul>
      </div>
    )
  }

  return (
    <div>
      {/* Timer-Kopf */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            Session{einheitName ? ` · ${einheitName}` : ""}
            {pausenRest !== null && " · Pause"}
          </p>
          <p className={cx(
            "text-5xl font-bold tabular-nums tracking-tight",
            restSek === 0 ? "text-rose-400" : "text-ink"
          )}>
            {restSek === 0 ? "Zeit um!" : zeit}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="subtle" onClick={pauseToggle}>
            {pausenRest !== null ? "▶ Weiter" : "❚❚ Pause"}
          </Button>
          <Button onClick={onEnde}>Session beenden</Button>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[color:var(--ov-10)]">
        <div className="h-full rounded-full bg-accent-gradient transition-all" style={{ width: `${fortschritt * 100}%` }} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          {/* Übungsliste mit Satz-Fortschritt (geloggt / geplant) */}
          <ul className="space-y-1.5">
            {eintraege.map((e) => {
              const u = uebungVon(e.id)
              if (!u) return null
              const istAktiv = e.id === aktiv
              const check = !!tages.uebungen?.[e.id]
              const saetze = log.filter((s) => s.datum === heuteKey && s.uebungId === e.id).length
              return (
                <li key={e.id}>
                  <button
                    onClick={() => waehleUebung(e.id)}
                    className={cx(
                      "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                      istAktiv ? "border-accent/60 bg-accent/10" : "border-[color:var(--ov-06)] bg-surface hover:border-[color:var(--ov-25)]"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={check}
                      onChange={(ev) => hakeAb(e.id, ev.target.checked)}
                      onClick={(ev) => ev.stopPropagation()}
                      className="h-4 w-4 accent-[var(--color-accent)]"
                    />
                    <span className={cx("flex-1 text-sm font-medium", check ? "text-faint line-through" : "text-ink")}>
                      {u.name}
                    </span>
                    <span className="text-xs tabular-nums text-muted">
                      {e.wdh} Wdh.{e.gewicht > 0 ? ` @ ${e.gewicht} kg` : ""}
                    </span>
                    <span
                      className={cx(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums",
                        saetze >= e.saetze ? "bg-emerald-500/15 text-emerald-300" : "bg-[color:var(--ov-10)] text-muted"
                      )}
                    >
                      {saetze}/{e.saetze} Sätze
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Satz-Logging für die aktive Übung */}
          {uebung && (
            <Card className="mt-5 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{uebung.name}</p>
                {ziel && (
                  <p className="text-xs text-muted">
                    Plan: {ziel.saetze} × {ziel.wdh}
                    {ziel.gewicht > 0 ? ` @ ${ziel.gewicht} kg` : ""} ·{" "}
                    {heutigeSaetze.length}/{ziel.saetze} erledigt
                  </p>
                )}
              </div>
              {vorschlag && (
                <p className="mt-1 rounded-lg bg-amber-500/15 px-2.5 py-1.5 text-xs text-amber-300">
                  ↗ {vorschlag.text}
                </p>
              )}
              <form onSubmit={satzSpeichern} className="mt-3 flex flex-wrap items-end gap-2">
                <label className={labelCls}>
                  Gewicht (kg)
                  <input
                    type="number" min="0" step="0.5" value={gewicht}
                    onChange={(e) => setGewicht(e.target.value)}
                    placeholder={uebung.geraet === "Körpergewicht" ? "0 = Körper" : ""}
                    className="mt-1 w-28 rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"
                  />
                </label>
                <label className={labelCls}>
                  Wdh.
                  <input
                    type="number" min="1" value={wdh}
                    onChange={(e) => setWdh(e.target.value)}
                    className="mt-1 w-20 rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                  />
                </label>
                <Button type="submit">+ Satz</Button>
              </form>

              {heutigeSaetze.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {heutigeSaetze.map((s, i) => (
                    <li key={s.id} className="group flex items-center gap-3 text-sm text-muted">
                      <span className="w-14 text-xs text-faint">Satz {i + 1}</span>
                      <span className="flex-1 text-ink/90">
                        {s.gewicht > 0 ? `${s.gewicht} kg × ` : ""}{s.wdh} Wdh.
                        <span className="ml-2 text-xs text-faint">e1RM {e1rm(s.gewicht, s.wdh)}</span>
                      </span>
                      <button
                        onClick={() => setLog((alt) => alt.filter((x) => x.id !== s.id))}
                        className="text-faint opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>

        {/* Männchen: zeigt die Muskeln der aktiven Übung */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card className="p-4">
            <Koerperkarte aktiv={muskeln} />
            <p className="mt-1 text-center text-xs text-muted">
              {uebung ? `${uebung.name} trainiert:` : "Übung wählen"}
            </p>
            <div className="mt-1.5 flex flex-wrap justify-center gap-1">
              {uebung?.muskeln.map((m) => (
                <span key={m} className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent-soft">
                  {MUSKELGRUPPEN[m]?.name}
                </span>
              ))}
              {(uebung?.sekundaer ?? []).map((m) => (
                <span key={m} className="rounded-full bg-[color:var(--ov-10)] px-2 py-0.5 text-[10px] text-muted">
                  {MUSKELGRUPPEN[m]?.name}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ---- Statistik: Verbesserung pro Übung als Diagramm ----
function ProgressStatistik({ wochenplan }) {
  const [log] = useStored("trainingLog", [])

  // Übungen mit Log-Einträgen zuerst, dann restliche aus dem Plan.
  const geloggt = [...new Set(log.map((s) => s.uebungId))]
  const planIds = Object.values(wochenplan).flat().map((e) => normEintrag(e).id)
  const imPlan = [...new Set(planIds)].filter((id) => !geloggt.includes(id))
  const auswahlIds = [...geloggt, ...imPlan]
  const [gewaehlt, setGewaehlt] = useState(null)
  const aktivId = gewaehlt ?? auswahlIds[0]
  const uebung = uebungVon(aktivId)

  const verlauf = aktivId ? verlaufVon(log, aktivId) : []
  const koerpergewicht = uebung?.geraet === "Körpergewicht"
  const einheit = koerpergewicht ? "Wdh." : "kg (e1RM)"

  const erster = verlauf[0]
  const letzter = verlauf[verlauf.length - 1]
  const steigerung =
    erster && letzter && erster.best > 0
      ? Math.round(((letzter.best - erster.best) / erster.best) * 100)
      : null

  return (
    <section className="mt-8">
      <SectionTitle
        right={
          auswahlIds.length > 0 && (
            <select
              value={aktivId ?? ""}
              onChange={(e) => setGewaehlt(e.target.value)}
              className="rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-2.5 py-1.5 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
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
        {verlauf.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Noch keine Sätze geloggt – starte oben eine Session und trage
            Gewicht &amp; Wiederholungen ein.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-xs text-faint">Bestwert</p>
                <p className="font-semibold text-ink">
                  {Math.max(...verlauf.map((v) => v.best))} {einheit}
                </p>
              </div>
              <div>
                <p className="text-xs text-faint">Letzte Einheit</p>
                <p className="font-semibold text-ink">
                  {letzter.best} {einheit} · {letzter.saetze.length} Sätze
                </p>
              </div>
              {steigerung !== null && verlauf.length > 1 && (
                <div>
                  <p className="text-xs text-faint">Seit Beginn</p>
                  <p className={cx("font-semibold", steigerung >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {steigerung > 0 ? "+" : ""}{steigerung} %
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Diagramm verlauf={verlauf} einheit={einheit} />
            </div>
          </>
        )}
      </Card>
    </section>
  )
}

// Einfaches SVG-Liniendiagramm des Bestwerts (e1RM bzw. Wdh.) pro Einheit.
function Diagramm({ verlauf, einheit }) {
  if (verlauf.length < 2) {
    return (
      <p className="text-xs text-muted">
        Nach der zweiten Einheit erscheint hier deine Fortschrittskurve.
      </p>
    )
  }

  const W = 560, H = 180, P = 30
  const werte = verlauf.map((v) => v.best)
  let min = Math.min(...werte)
  let max = Math.max(...werte)
  if (min === max) { min -= 1; max += 1 }
  const spanne = max - min
  min -= spanne * 0.1
  max += spanne * 0.1

  const x = (i) => P + (i * (W - 2 * P)) / (verlauf.length - 1)
  const y = (v) => H - P - ((v - min) * (H - 2 * P)) / (max - min)
  const punkte = verlauf.map((v, i) => `${x(i)},${y(v.best)}`).join(" ")
  const datumKurz = (key) => {
    const d = new Date(`${key}T00:00:00`)
    return `${d.getDate()}.${d.getMonth() + 1}.`
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Gitterlinien */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={P} x2={W - P}
          y1={P + f * (H - 2 * P)} y2={P + f * (H - 2 * P)}
          style={{ stroke: "var(--color-hair)" }} strokeOpacity="0.7"
        />
      ))}
      {/* Fläche unter der Kurve */}
      <polygon
        points={`${x(0)},${H - P} ${punkte} ${x(verlauf.length - 1)},${H - P}`}
        fill="url(#chartFill)"
      />
      <polyline points={punkte} fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinejoin="round" />
      {verlauf.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v.best)} r={i === verlauf.length - 1 ? 5 : 3.5} fill="#a5b4fc" />
      ))}
      {/* Beschriftung: letzter Wert + Achsen-Enden */}
      <text x={x(verlauf.length - 1)} y={y(verlauf[verlauf.length - 1].best) - 10} textAnchor="end" style={{ fontSize: 12, fontWeight: 600, fill: "var(--color-ink)" }}>
        {verlauf[verlauf.length - 1].best} {einheit}
      </text>
      <text x={P} y={H - 8} style={{ fontSize: 10, fill: "var(--color-faint)" }}>
        {datumKurz(verlauf[0].datum)}
      </text>
      <text x={W - P} y={H - 8} textAnchor="end" style={{ fontSize: 10, fill: "var(--color-faint)" }}>
        {datumKurz(verlauf[verlauf.length - 1].datum)}
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
