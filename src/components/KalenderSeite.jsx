import { useState } from "react"
import useStored from "../lib/useStored"
import { heute } from "../lib/datum"
import { WOCHEN_KEYS } from "../lib/splits"
import { phasenStatus } from "../lib/ernaehrung"
import Kalender from "./Kalender"
import { Card, PageHeader, Button, inputCls, labelCls } from "./ui"

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
    <Card className="p-5">
      {formOffen && (
        <form onSubmit={addTermin} className="mb-4 rounded-xl border border-white/[0.06] bg-surface-2 p-4">
          <input
            value={formTitel}
            onChange={(e) => setFormTitel(e.target.value)}
            placeholder="Was steht an? (z. B. Push-Training, Refeed …)"
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-lg font-medium text-ink outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className={labelCls}>
              Art
              <select
                value={formTyp}
                onChange={(e) => setFormTyp(e.target.value)}
                className={inputCls}
              >
                <option value="training">Training</option>
                <option value="mahlzeit">Ernährung</option>
                <option value="termin">Sonstiges</option>
              </select>
            </label>
            <label className={labelCls}>
              Datum
              <input
                type="date"
                value={formDatum}
                onChange={(e) => setFormDatum(e.target.value)}
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Uhrzeit
              <input
                type="time"
                value={formZeit}
                onChange={(e) => setFormZeit(e.target.value)}
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Dauer (Min.)
              <input
                type="number"
                min="15"
                step="15"
                value={formDauer}
                onChange={(e) => setFormDauer(e.target.value)}
                className={inputCls}
              />
            </label>
            <Button type="submit">Speichern</Button>
            <Button type="button" variant="ghost" onClick={() => setFormOffen(false)}>
              Abbrechen
            </Button>
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
    </Card>
  )
}

export default function KalenderSeite() {
  return (
    <div>
      <PageHeader
        title="Kalender"
        subtitle="Training, Ernährung und Termine in einer Übersicht."
      />
      <div className="mt-6">
        <KalenderPanel />
      </div>
    </div>
  )
}
