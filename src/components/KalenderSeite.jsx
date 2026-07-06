import { useState } from "react"
import useStored from "../lib/useStored"
import { heute } from "../lib/datum"
import { WOCHEN_KEYS } from "../lib/splits"
import { phasenStatus } from "../lib/ernaehrung"
import Kalender from "./Kalender"

// Kalender-Panel für Training & Ernährung. Einträge kommen aus dem
// wöchentlichen Trainingsplan, geplanten Fastenphasen, Mahlzeiten und
// frei erfassten Terminen – der Kalender ist also direkt mit Plan und
// Tagesblock verbunden.

export function KalenderPanel() {
  const [wochenplan] = useStored("trainingsplanUebungen", {})
  const [fastenPhasen] = useStored("fastenPhasen", [])
  const [mahlzeiten] = useStored("mahlzeiten", [])
  const [termine, setTermine] = useStored("kalenderTermine", [])

  const [formOffen, setFormOffen] = useState(false)
  const [formTitel, setFormTitel] = useState("")
  const [formDatum, setFormDatum] = useState(heute())
  const [formZeit, setFormZeit] = useState("")
  const [formDauer, setFormDauer] = useState("60")
  const [formTyp, setFormTyp] = useState("training")

  function eintraegeAm(key) {
    // Wiederkehrendes Training aus dem Wochenplan des jeweiligen Wochentags.
    const wKey = WOCHEN_KEYS[(new Date(`${key}T00:00:00`).getDay() + 6) % 7]
    const geplant = wochenplan[wKey] ?? []

    return [
      ...(geplant.length > 0
        ? [{ typ: "training", label: `Training · ${geplant.length} Übungen` }]
        : []),
      ...fastenPhasen
        .map((p) => ({ p, s: phasenStatus(p, key) }))
        .filter(({ s }) => s.status === "aktiv")
        .map(({ p, s }) => ({
          typ: "fasten",
          label: `${p.titel || "Fasten"} · Tag ${s.tag}/${p.tage}`,
        })),
      ...mahlzeiten
        .filter((m) => m.datum === key)
        .map((m) => ({ typ: "mahlzeit", label: m.titel, zeit: m.zeit })),
      ...termine
        .filter((t) => t.datum === key)
        .map((t) => ({
          typ: t.typ === "training" ? "training" : t.typ === "mahlzeit" ? "mahlzeit" : "termin",
          label: t.titel,
          zeit: t.zeit,
          dauer: t.dauer,
          onRemove: () => setTermine(termine.filter((x) => x.id !== t.id)),
        })),
    ].sort((a, b) => (a.zeit || "99:99").localeCompare(b.zeit || "99:99"))
  }

  function addTermin(e) {
    e.preventDefault()
    if (!formTitel.trim()) return
    setTermine([
      ...termine,
      {
        id: Date.now(),
        titel: formTitel.trim(),
        datum: formDatum,
        zeit: formZeit,
        dauer: formZeit && formDauer ? Number(formDauer) : null,
        typ: formTyp,
      },
    ])
    setFormTitel("")
    setFormZeit("")
    setFormDauer("60")
    setFormTyp("training")
    setFormOffen(false)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      {formOffen && (
        <form onSubmit={addTermin} className="mb-4 rounded-lg bg-gray-50 p-4">
          <input
            value={formTitel}
            onChange={(e) => setFormTitel(e.target.value)}
            placeholder="Was steht an? (z. B. Push-Training, Refeed …)"
            autoFocus
            className="w-full rounded-md border border-gray-200 px-4 py-3 text-lg font-medium text-gray-900 outline-none focus:border-gray-900"
          />
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="flex flex-col text-xs text-gray-500">
              Art
              <select
                value={formTyp}
                onChange={(e) => setFormTyp(e.target.value)}
                className="mt-1 rounded-md border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
              >
                <option value="training">Training</option>
                <option value="mahlzeit">Ernährung</option>
                <option value="termin">Sonstiges</option>
              </select>
            </label>
            <label className="flex flex-col text-xs text-gray-500">
              Datum
              <input
                type="date"
                value={formDatum}
                onChange={(e) => setFormDatum(e.target.value)}
                className="mt-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
              />
            </label>
            <label className="flex flex-col text-xs text-gray-500">
              Uhrzeit
              <input
                type="time"
                value={formZeit}
                onChange={(e) => setFormZeit(e.target.value)}
                className="mt-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
              />
            </label>
            <label className="flex flex-col text-xs text-gray-500">
              Dauer (Min.)
              <input
                type="number"
                min="15"
                step="15"
                value={formDauer}
                onChange={(e) => setFormDauer(e.target.value)}
                className="mt-1 w-24 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Speichern
            </button>
            <button
              type="button"
              onClick={() => setFormOffen(false)}
              className="px-2 py-2 text-sm text-gray-400 hover:text-gray-900"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      <Kalender
        eintraegeAm={eintraegeAm}
        legende={["training", "mahlzeit", "fasten", "termin"]}
        onNeu={(datum) => {
          setFormDatum(datum)
          setFormOffen(true)
        }}
      />
    </div>
  )
}

export default function KalenderSeite({ onBack }) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <button
        onClick={onBack}
        className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-900"
      >
        ← Dashboard
      </button>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight">Kalender</h1>
        <p className="mt-1 text-sm text-gray-400">
          Training, Ernährung und Termine in einer Übersicht.
        </p>
      </div>

      <div className="mt-6">
        <KalenderPanel />
      </div>
    </div>
  )
}
