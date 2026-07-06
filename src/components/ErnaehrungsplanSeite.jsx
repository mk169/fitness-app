import { useEffect, useState } from "react"
import useStored from "../lib/useStored"
import {
  KONZEPTE, FASTEN_METHODEN, konzeptVon, methodeVon, FARBEN, fastenStatus,
  FASTEN_STANDARD, phasenStatus,
} from "../lib/ernaehrung"
import { heute } from "../lib/datum"
import { useZiel } from "./ZielSeite"

// Ernährungsplan: Makro-Ziele (aus dem Algorithmus), Ernährungskonzept und
// Fasten mit einer oder mehreren frei einstellbaren Essenszeiten – plus
// mehrtägige Fastenphasen (24–72 h und länger).

export default function ErnaehrungsplanSeite({ onBack }) {
  const { plan } = useZiel()

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <button onClick={onBack} className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-900">
        ← Dashboard
      </button>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight">Ernährungsplan</h1>
        <p className="mt-1 text-sm text-gray-400">
          Makro-Ziele aus deinem Ziel, dazu Konzept und Fasten frei kombinierbar.
        </p>
      </div>

      <MakroZiele plan={plan} />
      <KonzeptWahl />
      <FastenBereich />
      <FastenPhasen />
      <MahlzeitenLog kalorienZiel={plan?.kalorien} />
    </div>
  )
}

function MakroZiele({ plan }) {
  if (!plan) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-5 text-sm text-gray-400">
        Lege zuerst dein <span className="font-medium text-gray-600">Ziel</span> fest,
        dann erscheinen hier Kalorien- und Makro-Vorgaben.
      </div>
    )
  }
  const { makros } = plan
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Tagesziel</h2>
        <span className="text-xs text-gray-400">{plan.modusInfo.name}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold text-gray-900">
        {plan.kalorien} <span className="text-lg font-normal text-gray-400">kcal</span>
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { l: "Protein", v: makros.protein, f: "bg-rose-50 text-rose-700" },
          { l: "Fett", v: makros.fett, f: "bg-amber-50 text-amber-700" },
          { l: "Carbs", v: makros.kohlenhydrate, f: "bg-sky-50 text-sky-700" },
        ].map((m) => (
          <div key={m.l} className={`rounded-lg py-3 ${m.f}`}>
            <p className="text-lg font-semibold">{m.v} g</p>
            <p className="text-[11px] uppercase tracking-wide">{m.l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function KonzeptWahl() {
  const [gewaehlt, setGewaehlt] = useStored("ernaehrungKonzept", "standard")
  const konzept = konzeptVon(gewaehlt)
  const farbe = FARBEN[konzept.farbe]

  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Ernährungskonzept</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {KONZEPTE.map((k) => {
          const aktiv = k.id === gewaehlt
          return (
            <button
              key={k.id}
              onClick={() => setGewaehlt(k.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                aktiv ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              <span className={`mr-2 inline-block h-2 w-2 rounded-full ${FARBEN[k.farbe].punkt}`} />
              {k.name}
            </button>
          )
        })}
      </div>
      <div className="mt-3 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{konzept.name}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${farbe.chip}`}>{konzept.kurz}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{konzept.idee}</p>
        <ul className="mt-3 space-y-1.5">
          {konzept.prinzipien.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${farbe.punkt}`} />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function FastenBereich() {
  const [fasten, setFasten] = useStored("fasten", FASTEN_STANDARD)
  const [jetzt, setJetzt] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setJetzt(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const methode = methodeVon(fasten.methode)
  const fenster = fasten.fenster ?? []

  function methodeWaehlen(id) {
    const m = methodeVon(id)
    // Methode setzt ihre Standard-Fenster; „custom“ behält bestehende.
    setFasten({
      methode: id,
      fenster: id === "custom" ? (fenster.length ? fenster : m.fenster) : m.fenster,
    })
  }
  function setFenster(i, feld, wert) {
    const neu = fenster.map((f, j) => (j === i ? { ...f, [feld]: Number(wert) } : f))
    setFasten({ methode: "custom", fenster: neu })
  }
  function addFenster() {
    setFasten({ methode: "custom", fenster: [...fenster, { start: 12, ende: 14 }] })
  }
  function removeFenster(i) {
    setFasten({ methode: "custom", fenster: fenster.filter((_, j) => j !== i) })
  }

  const stunde = jetzt.getHours() + jetzt.getMinutes() / 60
  const status = fastenStatus(fenster, stunde)
  const label = (h) => `${Math.floor(h)} h ${String(Math.round((h - Math.floor(h)) * 60)).padStart(2, "0")} min`

  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Fasten</h2>

      {/* Methoden auswählbar */}
      <div className="mt-3 flex flex-wrap gap-2">
        {FASTEN_METHODEN.map((m) => {
          const aktiv = m.id === fasten.methode
          return (
            <button
              key={m.id}
              onClick={() => methodeWaehlen(m.id)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                aktiv ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {m.name}
            </button>
          )
        })}
      </div>

      <div className="mt-3 grid gap-4 md:grid-cols-3">
        {/* Fenster-Konfiguration (mehrere möglich) */}
        <div className="md:col-span-2 rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-600">{methode.beschreibung}</p>

          {fenster.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Essensfenster {fenster.length > 1 ? `(${fenster.length})` : ""}
              </p>
              {fenster.map((f, i) => (
                <div key={i} className="flex flex-wrap items-end gap-2">
                  <label className="flex flex-col text-xs text-gray-500">
                    Von
                    <input
                      type="number" min="0" max="23" value={f.start}
                      onChange={(e) => setFenster(i, "start", e.target.value)}
                      className="mt-1 w-20 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
                    />
                  </label>
                  <label className="flex flex-col text-xs text-gray-500">
                    Bis
                    <input
                      type="number" min="1" max="24" value={f.ende}
                      onChange={(e) => setFenster(i, "ende", e.target.value)}
                      className="mt-1 w-20 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
                    />
                  </label>
                  <span className="pb-2 text-xs text-gray-400">Uhr</span>
                  {fenster.length > 1 && (
                    <button onClick={() => removeFenster(i)} className="pb-2 text-gray-300 hover:text-red-500">
                      Fenster entfernen
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addFenster} className="mt-1 text-xs font-medium text-gray-500 hover:text-gray-900">
                + weiteres Essensfenster
              </button>
            </div>
          ) : (
            <p className="mt-4 text-xs text-gray-400">
              Diese Methode hat kein festes Tagesfenster.
            </p>
          )}
        </div>

        {/* Live-Fasten-Uhr */}
        <div className={`rounded-xl border-2 bg-white p-5 ${status?.imFenster ? "border-emerald-300" : "border-gray-300"}`}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {status ? (status.imFenster ? "Essensfenster offen" : "Fastenphase") : "Fasten"}
          </h3>
          {status ? (
            <>
              <p className="mt-3 text-3xl font-semibold text-gray-900">{label(status.bis)}</p>
              <p className="mt-1 text-sm text-gray-500">
                {status.imFenster ? "bis Fenster schließt" : "bis nächstes Fenster"}
              </p>
              {status.fenster && (
                <p className="mt-3 text-xs text-gray-400">
                  Nächstes: {String(status.fenster.start).padStart(2, "0")}:00 –{" "}
                  {String(status.fenster.ende).padStart(2, "0")}:00 Uhr
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-gray-500">Kein Fasten aktiv.</p>
          )}
        </div>
      </div>
    </section>
  )
}

// ---- Mehrtägige Fastenphasen (24 h bis mehrere Tage) ----
// Vorlagen für gängige Programme – ein Klick füllt Name + Dauer.
const PHASEN_VORLAGEN = [
  { titel: "24-h-Reset", tage: 1 },
  { titel: "48-h-Fasten", tage: 2 },
  { titel: "72-h-Autophagie", tage: 3 },
  { titel: "5-Tage-Detox", tage: 5 },
  { titel: "7-Tage-Kur", tage: 7 },
]

export function FastenPhasen() {
  const [phasen, setPhasen] = useStored("fastenPhasen", [])
  const [start, setStart] = useState(heute())
  const [tage, setTage] = useState("3")
  const [titel, setTitel] = useState("")

  function add(e) {
    e.preventDefault()
    const dauer = Number(tage)
    if (!start || dauer < 1) return
    setPhasen(
      [...phasen, { id: Date.now(), start, tage: dauer, titel: titel.trim() }].sort(
        (a, b) => a.start.localeCompare(b.start)
      )
    )
    setStart(heute())
    setTage("3")
    setTitel("")
  }

  const statusChip = {
    aktiv: "bg-emerald-50 text-emerald-700",
    kommend: "bg-sky-50 text-sky-700",
    beendet: "bg-gray-100 text-gray-400",
  }

  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Fastenphasen (mehrtägig)
      </h2>
      <p className="mt-1 text-xs text-gray-400">
        Geplante längere Fastenperioden und Detox-Programme. Aktive Phasen
        erscheinen im Dashboard und im Kalender. Elektrolyte ergänzen, danach
        langsam wieder aufbauen.
      </p>

      {/* Programm-Vorlagen: ein Klick füllt Name + Dauer */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {PHASEN_VORLAGEN.map((v) => (
          <button
            key={v.titel}
            type="button"
            onClick={() => {
              setTitel(v.titel)
              setTage(String(v.tage))
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              titel === v.titel
                ? "border-violet-500 bg-violet-50 text-violet-700"
                : "border-gray-200 text-gray-500 hover:border-gray-400"
            }`}
          >
            {v.titel}
          </button>
        ))}
      </div>

      <form onSubmit={add} className="mt-3 flex flex-wrap items-end gap-2">
        <label className="flex flex-col text-xs text-gray-500">
          Name (optional)
          <input
            value={titel} onChange={(e) => setTitel(e.target.value)}
            placeholder="z. B. Frühjahrs-Detox"
            className="mt-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
          />
        </label>
        <label className="flex flex-col text-xs text-gray-500">
          Start
          <input
            type="date" value={start} onChange={(e) => setStart(e.target.value)}
            className="mt-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
          />
        </label>
        <label className="flex flex-col text-xs text-gray-500">
          Dauer (Tage)
          <input
            type="number" min="1" max="14" value={tage} onChange={(e) => setTage(e.target.value)}
            className="mt-1 w-24 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Phase planen
        </button>
      </form>

      {phasen.length > 0 && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white px-4 py-2">
          <ul className="divide-y divide-gray-100">
            {phasen.map((p) => {
              const s = phasenStatus(p, heute())
              return (
                <li key={p.id} className="group flex items-center gap-3 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusChip[s.status]}`}>
                    {s.status === "aktiv"
                      ? `Aktiv · Tag ${s.tag}/${p.tage}`
                      : s.status === "kommend"
                        ? `In ${s.inTagen} ${s.inTagen === 1 ? "Tag" : "Tagen"}`
                        : "Beendet"}
                  </span>
                  <span className="flex-1 text-sm text-gray-800">
                    {p.titel ? `${p.titel} · ` : ""}
                    {p.tage} {p.tage === 1 ? "Tag" : "Tage"} Fasten ab{" "}
                    {new Date(`${p.start}T00:00:00`).toLocaleDateString("de-DE")}
                  </span>
                  <button
                    onClick={() => setPhasen(phasen.filter((x) => x.id !== p.id))}
                    className="text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}

function heuteKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function MahlzeitenLog({ kalorienZiel }) {
  const [mahlzeiten, setMahlzeiten] = useStored("mahlzeiten", [])
  const [titel, setTitel] = useState("")
  const [kcal, setKcal] = useState("")
  const [zeit, setZeit] = useState("")

  function add(e) {
    e.preventDefault()
    if (!titel.trim()) return
    setMahlzeiten([
      { id: Date.now(), titel: titel.trim(), kcal: Number(kcal) || 0, zeit, datum: heuteKey() },
      ...mahlzeiten,
    ])
    setTitel("")
    setKcal("")
    setZeit("")
  }

  const heutige = mahlzeiten.filter((m) => m.datum === heuteKey())
  const summe = heutige.reduce((s, m) => s + (m.kcal || 0), 0)

  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Mahlzeiten heute</h2>
        {kalorienZiel > 0 && (
          <span className="text-xs text-gray-400">
            {summe} / {kalorienZiel} kcal
          </span>
        )}
      </div>

      {kalorienZiel > 0 && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${summe > kalorienZiel ? "bg-rose-400" : "bg-emerald-400"}`}
            style={{ width: `${Math.min(100, (summe / kalorienZiel) * 100)}%` }}
          />
        </div>
      )}

      <form onSubmit={add} className="mt-3 flex flex-wrap items-end gap-2">
        <input
          value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="Mahlzeit…"
          className="min-w-40 flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
        />
        <input
          type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} placeholder="kcal"
          className="w-24 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
        />
        <input
          type="time" value={zeit} onChange={(e) => setZeit(e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
        />
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
          Hinzufügen
        </button>
      </form>

      <div className="mt-3 rounded-xl border border-gray-200 bg-white px-4 py-2">
        {heutige.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">Noch nichts erfasst.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {heutige.map((m) => (
              <li key={m.id} className="group flex items-center gap-3 py-2">
                <span className="w-12 text-xs text-gray-400">{m.zeit || "–"}</span>
                <span className="flex-1 text-sm text-gray-800">{m.titel}</span>
                {m.kcal > 0 && <span className="text-xs text-gray-400">{m.kcal} kcal</span>}
                <button
                  onClick={() => setMahlzeiten(mahlzeiten.filter((x) => x.id !== m.id))}
                  className="text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
