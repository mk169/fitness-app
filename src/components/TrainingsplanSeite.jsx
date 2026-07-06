import { useEffect, useState } from "react"
import useStored from "../lib/useStored"
import { heute } from "../lib/datum"
import { MUSKELGRUPPEN, uebungVon, muskelnVon } from "../lib/uebungen"
import { SPLITS, WOCHEN_KEYS, standardTage, tagesName, planTag, normEintrag } from "../lib/splits"
import { e1rm, verlaufVon, overloadVorschlag } from "../lib/training"
import { useZiel } from "./ZielSeite"
import Koerperkarte from "./Koerperkarte"

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

export default function TrainingsplanSeite({ onBack, onZiel }) {
  const [wochenplan] = useStored("trainingsplanUebungen", LEER)
  const { profil } = useZiel()
  const [sessionAktiv, setSessionAktiv] = useState(false)

  const tagKey = heutigerTagKey()
  const heuteEintraege = planTag(wochenplan, tagKey)
  const tageWahl = profil.tageWahl ?? standardTage(profil.trainingsTage ?? 3)
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
    <div className="mx-auto max-w-5xl px-6 py-10">
      <button onClick={onBack} className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-900">
        ← Dashboard
      </button>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trainingsplan</h1>
          <p className="mt-1 text-sm text-gray-400">
            {SPLITS[splitWahl]?.name} · {tageWahl.length}× / Woche – bearbeiten
            in „Ziel &amp; Anpassung“.
          </p>
        </div>
        {onZiel && (
          <button
            onClick={onZiel}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
          >
            Plan bearbeiten →
          </button>
        )}
      </div>

      <HeuteKarte
        eintraege={heuteEintraege}
        einheitName={tagesName(splitWahl, tageWahl, tagKey)}
        onStart={() => setSessionAktiv(true)}
      />

      <Wochenplan wochenplan={wochenplan} splitWahl={splitWahl} tageWahl={tageWahl} tagKey={tagKey} />

      <ProgressStatistik wochenplan={wochenplan} />
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
    <section className="mt-6 rounded-xl border-2 border-gray-900 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Heute{einheitName && eintraege.length > 0 ? ` · ${einheitName}` : ""}
          </p>
          <p className="mt-0.5 text-lg font-semibold text-gray-900">
            {eintraege.length === 0 ? "Ruhetag" : `${abgehakt}/${eintraege.length} Übungen erledigt`}
          </p>
        </div>
        {eintraege.length > 0 && (
          <button
            onClick={onStart}
            className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
          >
            ▶ Session starten
          </button>
        )}
      </div>

      {eintraege.length > 0 && (
        <ul className="mt-3 grid gap-x-6 sm:grid-cols-2">
          {eintraege.map((e) => {
            const u = uebungVon(e.id)
            if (!u) return null
            const check = !!tages.uebungen?.[e.id]
            return (
              <li key={e.id} className="flex items-center gap-2.5 border-b border-gray-50 py-1.5">
                <input
                  type="checkbox"
                  checked={check}
                  onChange={() => toggle(e.id)}
                  className="h-4 w-4 accent-gray-900"
                />
                <span className={`flex-1 text-sm ${check ? "text-gray-300 line-through" : "text-gray-800"}`}>
                  {u.name}
                </span>
                <span className="text-xs tabular-nums text-gray-400">
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
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Wochenplan</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {WOCHENTAGE.map((t) => {
          const eintraege = planTag(wochenplan, t.key)
          const istHeute = t.key === tagKey
          const geraete = new Set(eintraege.map((e) => uebungVon(e.id)?.geraet === "Körpergewicht" ? "Cali" : "Gym"))
          const modus = eintraege.length === 0 ? null : geraete.size > 1 ? "Mix" : [...geraete][0]
          return (
            <div
              key={t.key}
              className={`rounded-xl border bg-white p-3.5 ${istHeute ? "border-gray-900" : "border-gray-200"}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-wide ${istHeute ? "text-gray-900" : "text-gray-400"}`}>
                  {t.name}
                </span>
                {modus && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      modus === "Cali"
                        ? "bg-emerald-50 text-emerald-700"
                        : modus === "Mix"
                          ? "bg-violet-50 text-violet-700"
                          : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {modus}
                  </span>
                )}
              </div>
              {eintraege.length === 0 ? (
                <p className="mt-1.5 text-xs text-gray-300">Ruhetag</p>
              ) : (
                <>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {tagesName(splitWahl, tageWahl, t.key) ?? "Training"} · {eintraege.length} Übungen
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-400">
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
      <div className="mx-auto max-w-5xl px-6 py-10">
        <button onClick={onEnde} className="text-xs font-medium text-gray-400 hover:text-gray-900">
          ← Abbrechen
        </button>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Session{einheitName ? ` · ${einheitName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Timer einstellen, dann geht’s los. {eintraege.length} Übungen stehen an.
        </p>

        <div className="mt-6 max-w-sm rounded-xl border border-gray-200 bg-white p-5">
          <label className="flex flex-col text-xs text-gray-500">
            Dauer (Minuten)
            <input
              type="number" min="10" step="5" value={minuten}
              onChange={(e) => setMinuten(e.target.value)}
              className="mt-1 rounded-md border border-gray-200 px-3 py-3 text-center text-2xl font-semibold text-gray-900 outline-none focus:border-gray-900"
            />
          </label>
          <button
            onClick={starten}
            className="mt-4 w-full rounded-md bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-700"
          >
            ▶ Los geht’s
          </button>
        </div>

        <ul className="mt-6 max-w-sm space-y-1.5">
          {eintraege.map((e) => {
            const u = uebungVon(e.id)
            return u ? (
              <li key={e.id} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                <span className="flex-1">{u.name}</span>
                <span className="text-xs tabular-nums text-gray-400">
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
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Timer-Kopf */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Session{einheitName ? ` · ${einheitName}` : ""}
            {pausenRest !== null && " · Pause"}
          </p>
          <p className={`text-4xl font-semibold tabular-nums tracking-tight ${restSek === 0 ? "text-rose-600" : "text-gray-900"}`}>
            {restSek === 0 ? "Zeit um!" : zeit}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={pauseToggle}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400"
          >
            {pausenRest !== null ? "▶ Weiter" : "❚❚ Pause"}
          </button>
          <button
            onClick={onEnde}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Session beenden
          </button>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${fortschritt * 100}%` }} />
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
                    className={`flex w-full items-center gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition-colors ${
                      istAktiv ? "border-gray-900 bg-white" : "border-gray-200 bg-white hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={check}
                      onChange={(ev) => hakeAb(e.id, ev.target.checked)}
                      onClick={(ev) => ev.stopPropagation()}
                      className="h-4 w-4 accent-gray-900"
                    />
                    <span className={`flex-1 text-sm font-medium ${check ? "text-gray-300 line-through" : "text-gray-900"}`}>
                      {u.name}
                    </span>
                    <span className="text-xs tabular-nums text-gray-400">
                      {e.wdh} Wdh.{e.gewicht > 0 ? ` @ ${e.gewicht} kg` : ""}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums ${
                        saetze >= e.saetze ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}
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
            <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">{uebung.name}</p>
                {ziel && (
                  <p className="text-xs text-gray-400">
                    Plan: {ziel.saetze} × {ziel.wdh}
                    {ziel.gewicht > 0 ? ` @ ${ziel.gewicht} kg` : ""} ·{" "}
                    {heutigeSaetze.length}/{ziel.saetze} erledigt
                  </p>
                )}
              </div>
              {vorschlag && (
                <p className="mt-1 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">
                  ↗ {vorschlag.text}
                </p>
              )}
              <form onSubmit={satzSpeichern} className="mt-3 flex flex-wrap items-end gap-2">
                <label className="flex flex-col text-xs text-gray-500">
                  Gewicht (kg)
                  <input
                    type="number" min="0" step="0.5" value={gewicht}
                    onChange={(e) => setGewicht(e.target.value)}
                    placeholder={uebung.geraet === "Körpergewicht" ? "0 = Körper" : ""}
                    className="mt-1 w-28 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
                  />
                </label>
                <label className="flex flex-col text-xs text-gray-500">
                  Wdh.
                  <input
                    type="number" min="1" value={wdh}
                    onChange={(e) => setWdh(e.target.value)}
                    className="mt-1 w-20 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  + Satz
                </button>
              </form>

              {heutigeSaetze.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {heutigeSaetze.map((s, i) => (
                    <li key={s.id} className="group flex items-center gap-3 text-sm text-gray-700">
                      <span className="w-14 text-xs text-gray-400">Satz {i + 1}</span>
                      <span className="flex-1">
                        {s.gewicht > 0 ? `${s.gewicht} kg × ` : ""}{s.wdh} Wdh.
                        <span className="ml-2 text-xs text-gray-400">e1RM {e1rm(s.gewicht, s.wdh)}</span>
                      </span>
                      <button
                        onClick={() => setLog((alt) => alt.filter((x) => x.id !== s.id))}
                        className="text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Männchen: zeigt die Muskeln der aktiven Übung */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <Koerperkarte aktiv={muskeln} />
            <p className="mt-1 text-center text-xs text-gray-400">
              {uebung ? `${uebung.name} trainiert:` : "Übung wählen"}
            </p>
            <div className="mt-1.5 flex flex-wrap justify-center gap-1">
              {uebung?.muskeln.map((m) => (
                <span key={m} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                  {MUSKELGRUPPEN[m]?.name}
                </span>
              ))}
              {(uebung?.sekundaer ?? []).map((m) => (
                <span key={m} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                  {MUSKELGRUPPEN[m]?.name}
                </span>
              ))}
            </div>
          </div>
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Fortschritt
        </h2>
        {auswahlIds.length > 0 && (
          <select
            value={aktivId ?? ""}
            onChange={(e) => setGewaehlt(e.target.value)}
            className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-900"
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
        )}
      </div>

      <div className="mt-3 rounded-xl border border-gray-200 bg-white p-5">
        {verlauf.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Noch keine Sätze geloggt – starte oben eine Session und trage
            Gewicht &amp; Wiederholungen ein.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Bestwert</p>
                <p className="font-semibold text-gray-900">
                  {Math.max(...verlauf.map((v) => v.best))} {einheit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Letzte Einheit</p>
                <p className="font-semibold text-gray-900">
                  {letzter.best} {einheit} · {letzter.saetze.length} Sätze
                </p>
              </div>
              {steigerung !== null && verlauf.length > 1 && (
                <div>
                  <p className="text-xs text-gray-400">Seit Beginn</p>
                  <p className={`font-semibold ${steigerung >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
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
      </div>
    </section>
  )
}

// Einfaches SVG-Liniendiagramm des Bestwerts (e1RM bzw. Wdh.) pro Einheit.
function Diagramm({ verlauf, einheit }) {
  if (verlauf.length < 2) {
    return (
      <p className="text-xs text-gray-400">
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
      {/* Gitterlinien */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={P} x2={W - P}
          y1={P + f * (H - 2 * P)} y2={P + f * (H - 2 * P)}
          stroke="#f1f5f9"
        />
      ))}
      {/* Fläche unter der Kurve */}
      <polygon
        points={`${x(0)},${H - P} ${punkte} ${x(verlauf.length - 1)},${H - P}`}
        fill="#3b82f6" opacity="0.07"
      />
      <polyline points={punkte} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" />
      {verlauf.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v.best)} r={i === verlauf.length - 1 ? 5 : 3.5} fill="#3b82f6" />
      ))}
      {/* Beschriftung: letzter Wert + Achsen-Enden */}
      <text x={x(verlauf.length - 1)} y={y(verlauf[verlauf.length - 1].best) - 10} textAnchor="end" className="fill-gray-700" style={{ fontSize: 12, fontWeight: 600 }}>
        {verlauf[verlauf.length - 1].best} {einheit}
      </text>
      <text x={P} y={H - 8} className="fill-gray-400" style={{ fontSize: 10 }}>
        {datumKurz(verlauf[0].datum)}
      </text>
      <text x={W - P} y={H - 8} textAnchor="end" className="fill-gray-400" style={{ fontSize: 10 }}>
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
