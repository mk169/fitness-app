import { useMemo, useState } from "react"
import useStored from "../lib/useStored"
import { heute } from "../lib/datum"
import { WOCHEN_KEYS } from "../lib/splits"
import { FASTEN_STANDARD, phasenStatus } from "../lib/ernaehrung"
import {
  habitsAmTag, istErledigt, toggle, streak, tagesFortschritt,
  neuerHabit, farbeVon, HABIT_VORSCHLAEGE,
} from "../lib/habits"
import {
  PROGRAMM_TYPEN, typInfo, programmStatus, aktiveProgramme,
} from "../lib/programme"
import Kalender, { schluessel, datumLang } from "./Kalender"
import { Card, PageHeader, SectionTitle, Button, Ring, inputCls, labelCls, cx } from "./ui"

// Kalender-Seite als Habit-Tracker: Tagesansicht zum Abhaken mit Streaks,
// Phasen/Programme über Zeiträume und eine Monats-/Wochenübersicht, die den
// Erledigt-Stand und laufende Programme anzeigt.

// Gemeinsame Programm-Liste (eigene Programme + Fastenphasen als Bänder).
function useProgramme() {
  const [programme, setProgramme] = useStored("programme", [])
  const [fastenPhasen] = useStored("fastenPhasen", [])
  const alle = useMemo(
    () =>
      [
        ...programme.map((p) => ({ ...p, quelle: "programm" })),
        ...fastenPhasen.map((f) => ({
          id: `f${f.id}`, name: f.titel || "Fasten", typ: "fasten",
          start: f.start, tage: f.tage, quelle: "fasten",
        })),
      ].sort((a, b) => a.start.localeCompare(b.start)),
    [programme, fastenPhasen]
  )
  return { programme, setProgramme, alle }
}

// ---- Habit-Tracker (Tagesansicht zum Abhaken) ---------------------------
export function HabitTracker() {
  const [checks, setChecks] = useStored("checks", {})
  const [eigene, setEigene] = useStored("habits", [])
  const [wochenplan] = useStored("trainingsplanUebungen", {})
  const [fasten] = useStored("fasten", FASTEN_STANDARD)
  const [tag, setTag] = useState(heute())
  const [neu, setNeu] = useState("")

  const ctx = { wochenplan, fastenMethode: fasten.methode }
  const habits = habitsAmTag(tag, ctx, eigene)
  const { erledigt, gesamt } = tagesFortschritt(checks, tag, habits)
  const istHeute = tag === heute()

  const blaettern = (n) => {
    const d = new Date(`${tag}T00:00:00`)
    d.setDate(d.getDate() + n)
    setTag(schluessel(d))
  }
  const toggleHabit = (h) => setChecks(toggle(checks, tag, h))
  const addHabit = (name, icon, farbe) => {
    if (name.trim()) setEigene([...eigene, neuerHabit(name, icon, farbe)])
    setNeu("")
  }
  const removeHabit = (id) => setEigene(eigene.filter((h) => h.id !== id))

  const offeneVorschlaege = HABIT_VORSCHLAEGE.filter(
    (v) => !eigene.some((e) => e.name === v.name)
  )

  return (
    <section>
      <SectionTitle>Tagesansicht · abhaken</SectionTitle>
      <Card className="mt-3 p-5">
        {/* Kopf: Datum-Navigation + Ring */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <NavBtn onClick={() => blaettern(-1)}>‹</NavBtn>
            <div className="min-w-40 text-center">
              <p className="text-sm font-semibold text-ink">{istHeute ? "Heute" : datumLang(tag).split(",")[0]}</p>
              <p className="text-xs text-muted">{datumLang(tag)}</p>
            </div>
            <NavBtn onClick={() => blaettern(1)}>›</NavBtn>
            {!istHeute && (
              <button onClick={() => setTag(heute())} className="ml-1 text-xs text-accent-soft hover:underline">
                heute
              </button>
            )}
          </div>
          <Ring value={erledigt} max={gesamt} label={`${erledigt}/${gesamt}`} />
        </div>

        {/* Habit-Liste */}
        <ul className="mt-4 divide-y divide-[color:var(--ov-06)]">
          {habits.map((h) => {
            const done = istErledigt(checks, tag, h)
            const s = streak(checks, h, tag)
            return (
              <li key={h.id} className="flex items-center gap-3 py-2.5">
                <button
                  onClick={() => toggleHabit(h)}
                  aria-label={`${h.name} ${done ? "erledigt" : "offen"}`}
                  className={cx(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-sm transition",
                    done
                      ? "border-transparent bg-accent-gradient text-white shadow-[var(--shadow-glow)]"
                      : "border-[color:var(--ov-25)] text-transparent hover:border-accent/60"
                  )}
                >
                  ✓
                </button>
                <span className="text-lg">{h.icon}</span>
                <span className={cx("flex-1 text-sm", done ? "text-muted line-through" : "text-ink")}>
                  {h.name}
                  {h.auto && (
                    <span className="ml-2 rounded bg-[color:var(--ov-10)] px-1.5 py-0.5 text-[10px] text-faint">auto</span>
                  )}
                </span>
                {s > 0 && <span className="text-xs font-semibold text-amber-300">🔥 {s}</span>}
                {!h.auto && (
                  <button onClick={() => removeHabit(h.id)} title="Habit entfernen"
                    className="text-faint transition-colors hover:text-rose-400">
                    ×
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        {/* Habit hinzufügen */}
        <div className="mt-3 border-t border-[color:var(--ov-06)] pt-3">
          <div className="flex gap-2">
            <input
              value={neu}
              onChange={(e) => setNeu(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit(neu, "✅", "sky")}
              placeholder="Eigenen Habit hinzufügen…"
              className={inputCls}
            />
            <Button variant="subtle" onClick={() => addHabit(neu, "✅", "sky")}>Hinzufügen</Button>
          </div>
          {offeneVorschlaege.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {offeneVorschlaege.map((v) => (
                <button
                  key={v.name}
                  onClick={() => addHabit(v.name, v.icon, v.farbe)}
                  className="rounded-full border border-[color:var(--ov-10)] bg-surface-2 px-2.5 py-1 text-xs text-muted transition-colors hover:text-ink"
                >
                  + {v.icon} {v.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </section>
  )
}

function NavBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-lg border border-[color:var(--ov-10)] bg-surface-2 text-muted transition-colors hover:text-ink"
    >
      {children}
    </button>
  )
}

// ---- Programme & Phasen (Timeline) --------------------------------------
function ProgrammeSektion() {
  const { programme, setProgramme, alle } = useProgramme()
  const heuteKey = heute()
  const [offen, setOffen] = useState(false)
  const leer = { name: "", typ: "programm", start: heuteKey, tage: 28, notiz: "" }
  const [form, setForm] = useState(leer)

  function speichern(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setProgramme([
      ...programme,
      {
        id: Date.now(), name: form.name.trim(), typ: form.typ,
        start: form.start, tage: Math.max(1, Number(form.tage) || 1),
        notiz: form.notiz.trim(),
      },
    ])
    setForm(leer)
    setOffen(false)
  }
  const entfernen = (id) => setProgramme(programme.filter((p) => p.id !== id))

  return (
    <section className="mt-8">
      <SectionTitle right={<Button variant="subtle" onClick={() => setOffen((o) => !o)}>+ Phase / Programm</Button>}>
        Programme &amp; Phasen
      </SectionTitle>

      {offen && (
        <Card as="form" onSubmit={speichern} className="mt-3 p-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name (z. B. PPL-Block, Cut, Lean Bulk …)"
            autoFocus
            className="w-full rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-4 py-2.5 text-base font-medium text-ink outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className={labelCls}>
              Art
              <select value={form.typ} onChange={(e) => setForm({ ...form, typ: e.target.value })} className={inputCls}>
                {Object.entries(PROGRAMM_TYPEN).map(([k, t]) => (
                  <option key={k} value={k}>{t.name}</option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              Start
              <input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className={inputCls} />
            </label>
            <label className={labelCls}>
              Dauer (Tage)
              <input type="number" min="1" value={form.tage} onChange={(e) => setForm({ ...form, tage: e.target.value })} className={inputCls} />
            </label>
            <label className={labelCls}>
              Notiz
              <input value={form.notiz} onChange={(e) => setForm({ ...form, notiz: e.target.value })} placeholder="optional" className={inputCls} />
            </label>
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="submit">Speichern</Button>
            <Button type="button" variant="ghost" onClick={() => setOffen(false)}>Abbrechen</Button>
          </div>
        </Card>
      )}

      {alle.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-[color:var(--ov-15)] p-6 text-center text-sm text-muted">
          Noch keine Phasen. Lege ein Trainingsprogramm, eine Diät-Phase oder einen Zeitraum an –
          er erscheint hier als Zeitband und im Kalender.
        </div>
      ) : (
        <Timeline items={alle} heuteKey={heuteKey} onRemove={entfernen} />
      )}
    </section>
  )
}

// Zeitleiste (Gantt): gemeinsames Fenster, Programme als farbige Bänder,
// „heute" als vertikale Linie.
const TAG_MS = 86400000
function Timeline({ items, heuteKey, onRemove }) {
  const heuteMs = new Date(`${heuteKey}T00:00:00`).getTime()
  const startsMs = items.map((i) => new Date(`${i.start}T00:00:00`).getTime())
  const endsMs = items.map((i, k) => startsMs[k] + Math.max(1, i.tage) * TAG_MS)
  const von = Math.min(heuteMs - 3 * TAG_MS, ...startsMs)
  const bis = Math.max(heuteMs + 7 * TAG_MS, ...endsMs)
  const span = Math.max(TAG_MS, bis - von)
  const pct = (ms) => ((ms - von) / span) * 100
  const heutePct = pct(heuteMs)

  return (
    <div className="mt-3 space-y-3">
      {items.map((it, k) => {
        const status = programmStatus(it, heuteKey)
        const t = typInfo(it.typ)
        const f = farbeVon(t.farbe)
        const left = pct(startsMs[k])
        const width = Math.max(3, pct(endsMs[k]) - left)
        const startTxt = new Date(`${it.start}T00:00:00`).toLocaleDateString("de-DE")
        return (
          <div key={it.id} className="group">
            <div className="relative h-8 overflow-hidden rounded-lg" style={{ background: "var(--ov-05)" }}>
              <div className="absolute inset-y-0 z-10 w-0.5 bg-accent/70" style={{ left: `${heutePct}%` }} />
              <div
                className={cx("absolute inset-y-1 flex items-center overflow-hidden rounded-md border px-2", f.chip, f.rand)}
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                <span className="truncate text-xs font-medium">{it.name}</span>
              </div>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 px-0.5 text-[11px]">
              <span className={cx("rounded px-1.5 py-0.5", f.chip)}>{t.name}</span>
              <span className="text-muted">{startTxt} · {it.tage} Tage</span>
              <span className="text-faint">
                {status.status === "kommend"
                  ? `beginnt in ${status.inTagen} Tag${status.inTagen === 1 ? "" : "en"}`
                  : status.status === "aktiv"
                    ? `läuft · Tag ${status.tag}/${it.tage}`
                    : "beendet"}
              </span>
              {it.notiz && <span className="text-faint">· {it.notiz}</span>}
              {it.quelle === "programm" ? (
                <button onClick={() => onRemove(it.id)} className="ml-auto text-faint transition-colors hover:text-rose-400">
                  Löschen
                </button>
              ) : (
                <span className="ml-auto text-faint">in Ernährung verwaltet</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---- Kalender-Übersicht (Monat/Woche/Tag) mit Terminen ------------------
export function KalenderPanel() {
  const [wochenplan] = useStored("trainingsplanUebungen", {})
  const [fastenPhasen] = useStored("fastenPhasen", [])
  const [mahlzeiten] = useStored("mahlzeiten", [])
  const [termine, setTermine] = useStored("kalenderTermine", [])
  const [checks] = useStored("checks", {})
  const [eigene] = useStored("habits", [])
  const [fasten] = useStored("fasten", FASTEN_STANDARD)
  const { alle: alleProgramme } = useProgramme()

  const [formOffen, setFormOffen] = useState(false)
  const [formTitel, setFormTitel] = useState("")
  const [formDatum, setFormDatum] = useState(heute())
  const [formZeit, setFormZeit] = useState("")
  const [formDauer, setFormDauer] = useState("60")
  const [formTyp, setFormTyp] = useState("training")

  const ctx = { wochenplan, fastenMethode: fasten.methode }

  function eintraegeAm(key) {
    const wKey = WOCHEN_KEYS[(new Date(`${key}T00:00:00`).getDay() + 6) % 7]
    const geplant = wochenplan[wKey] ?? []
    return [
      ...(geplant.length > 0 ? [{ typ: "training", label: `Training · ${geplant.length} Übungen` }] : []),
      ...fastenPhasen
        .map((p) => ({ p, s: phasenStatus(p, key) }))
        .filter(({ s }) => s.status === "aktiv")
        .map(({ p, s }) => ({ typ: "fasten", label: `${p.titel || "Fasten"} · Tag ${s.tag}/${p.tage}` })),
      ...mahlzeiten.filter((m) => m.datum === key).map((m) => ({ typ: "mahlzeit", label: m.titel, zeit: m.zeit })),
      ...termine
        .filter((t) => t.datum === key)
        .map((t) => ({
          typ: t.typ === "training" ? "training" : t.typ === "mahlzeit" ? "mahlzeit" : "termin",
          label: t.titel, zeit: t.zeit, dauer: t.dauer,
          onRemove: () => setTermine(termine.filter((x) => x.id !== t.id)),
        })),
    ].sort((a, b) => (a.zeit || "99:99").localeCompare(b.zeit || "99:99"))
  }

  const tagStatus = (key) => tagesFortschritt(checks, key, habitsAmTag(key, ctx, eigene))
  const baender = (key) =>
    aktiveProgramme(alleProgramme, key).map((p) => ({ name: p.name, farbe: typInfo(p.typ).farbe }))

  function addTermin(e) {
    e.preventDefault()
    if (!formTitel.trim()) return
    setTermine([
      ...termine,
      {
        id: Date.now(), titel: formTitel.trim(), datum: formDatum, zeit: formZeit,
        dauer: formZeit && formDauer ? Number(formDauer) : null, typ: formTyp,
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
        <form onSubmit={addTermin} className="mb-4 rounded-xl border border-[color:var(--ov-06)] bg-surface-2 p-4">
          <input
            value={formTitel}
            onChange={(e) => setFormTitel(e.target.value)}
            placeholder="Was steht an? (z. B. Push-Training, Refeed …)"
            autoFocus
            className="w-full rounded-lg border border-[color:var(--ov-10)] bg-surface px-4 py-3 text-lg font-medium text-ink outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className={labelCls}>
              Art
              <select value={formTyp} onChange={(e) => setFormTyp(e.target.value)} className={inputCls}>
                <option value="training">Training</option>
                <option value="mahlzeit">Ernährung</option>
                <option value="termin">Sonstiges</option>
              </select>
            </label>
            <label className={labelCls}>
              Datum
              <input type="date" value={formDatum} onChange={(e) => setFormDatum(e.target.value)} className={inputCls} />
            </label>
            <label className={labelCls}>
              Uhrzeit
              <input type="time" value={formZeit} onChange={(e) => setFormZeit(e.target.value)} className={inputCls} />
            </label>
            <label className={labelCls}>
              Dauer (Min.)
              <input type="number" min="15" step="15" value={formDauer} onChange={(e) => setFormDauer(e.target.value)} className={inputCls} />
            </label>
            <Button type="submit">Speichern</Button>
            <Button type="button" variant="ghost" onClick={() => setFormOffen(false)}>Abbrechen</Button>
          </div>
        </form>
      )}

      <Kalender
        eintraegeAm={eintraegeAm}
        legende={["training", "mahlzeit", "fasten", "termin"]}
        tagStatus={tagStatus}
        baender={baender}
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
        title="Habits & Kalender"
        subtitle="Täglich abhaken, Serien halten, Phasen & Programme über die Zeit festhalten."
      />
      <div className="mt-6 space-y-2">
        <HabitTracker />
        <ProgrammeSektion />
        <section className="mt-8">
          <SectionTitle>Übersicht</SectionTitle>
          <div className="mt-3">
            <KalenderPanel />
          </div>
        </section>
      </div>
    </div>
  )
}
