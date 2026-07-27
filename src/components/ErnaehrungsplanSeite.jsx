import { useEffect, useState } from "react"
import useStored from "../lib/useStored"
import {
  KONZEPTE, FASTEN_METHODEN, konzeptVon, methodeVon, FARBEN, fastenStatus,
  FASTEN_STANDARD, phasenStatus,
} from "../lib/ernaehrung"
import { heute } from "../lib/datum"
import { useZiel } from "./ZielSeite"
import { Card, PageHeader, SectionTitle, Button, Pill, cx, labelCls } from "./ui"

// Ernährungsplan: Makro-Ziele (aus dem Algorithmus), Ernährungskonzept und
// Fasten mit einer oder mehreren frei einstellbaren Essenszeiten – plus
// mehrtägige Fastenphasen (24–72 h und länger).

export default function ErnaehrungsplanSeite() {
  const { plan } = useZiel()

  return (
    <div>
      <PageHeader
        title="Ernährungsplan"
        subtitle="Makro-Ziele aus deinem Ziel, dazu Konzept und Fasten frei kombinierbar."
      />

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
      <div className="mt-6 rounded-2xl border border-dashed border-[color:var(--ov-15)] p-5 text-sm text-muted">
        Lege zuerst dein <span className="font-medium text-ink">Ziel</span> fest,
        dann erscheinen hier Kalorien- und Makro-Vorgaben.
      </div>
    )
  }
  const { makros } = plan
  return (
    <Card className="mt-6 p-5">
      <div className="flex items-baseline justify-between">
        <SectionTitle>Tagesziel</SectionTitle>
        <span className="text-xs text-faint">{plan.modusInfo.name}</span>
      </div>
      <p className="mt-2 text-4xl font-bold tabular-nums text-ink">
        {plan.kalorien} <span className="text-lg font-normal text-muted">kcal</span>
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { l: "Protein", v: makros.protein, f: "bg-rose-500/15 text-rose-300" },
          { l: "Fett", v: makros.fett, f: "bg-amber-500/15 text-amber-300" },
          { l: "Carbs", v: makros.kohlenhydrate, f: "bg-sky-500/15 text-sky-300" },
        ].map((m) => (
          <div key={m.l} className={cx("rounded-xl py-3", m.f)}>
            <p className="text-lg font-semibold">{m.v} g</p>
            <p className="text-[11px] uppercase tracking-wide">{m.l}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

function KonzeptWahl() {
  const [gewaehlt, setGewaehlt] = useStored("ernaehrungKonzept", "standard")
  const konzept = konzeptVon(gewaehlt)
  const farbe = FARBEN[konzept.farbe]

  return (
    <section className="mt-8">
      <SectionTitle>Ernährungskonzept</SectionTitle>
      <div className="mt-3 flex flex-wrap gap-2">
        {KONZEPTE.map((k) => (
          <Pill key={k.id} active={k.id === gewaehlt} onClick={() => setGewaehlt(k.id)} className="px-4 py-2">
            <span className={cx("mr-2 inline-block h-2 w-2 rounded-full", FARBEN[k.farbe].punkt)} />
            {k.name}
          </Pill>
        ))}
      </div>
      <Card className="mt-3 p-5">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-ink">{konzept.name}</h3>
          <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-medium", farbe.chip)}>{konzept.kurz}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{konzept.idee}</p>
        <ul className="mt-3 space-y-1.5">
          {konzept.prinzipien.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink/90">
              <span className={cx("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", farbe.punkt)} />
              {p}
            </li>
          ))}
        </ul>
      </Card>
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
      <SectionTitle>Fasten</SectionTitle>

      {/* Methoden auswählbar */}
      <div className="mt-3 flex flex-wrap gap-2">
        {FASTEN_METHODEN.map((m) => (
          <Pill key={m.id} active={m.id === fasten.methode} onClick={() => methodeWaehlen(m.id)}>
            {m.name}
          </Pill>
        ))}
      </div>

      <div className="mt-3 grid gap-4 md:grid-cols-3">
        {/* Fenster-Konfiguration (mehrere möglich) */}
        <Card className="p-5 md:col-span-2">
          <p className="text-sm text-muted">{methode.beschreibung}</p>

          {fenster.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
                Essensfenster {fenster.length > 1 ? `(${fenster.length})` : ""}
              </p>
              {fenster.map((f, i) => (
                <div key={i} className="flex flex-wrap items-end gap-2">
                  <label className={labelCls}>
                    Von
                    <input
                      type="number" min="0" max="23" value={f.start}
                      onChange={(e) => setFenster(i, "start", e.target.value)}
                      className="mt-1 w-20 rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                    />
                  </label>
                  <label className={labelCls}>
                    Bis
                    <input
                      type="number" min="1" max="24" value={f.ende}
                      onChange={(e) => setFenster(i, "ende", e.target.value)}
                      className="mt-1 w-20 rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                    />
                  </label>
                  <span className="pb-2 text-xs text-muted">Uhr</span>
                  {fenster.length > 1 && (
                    <button onClick={() => removeFenster(i)} className="pb-2 text-faint hover:text-rose-400">
                      Fenster entfernen
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addFenster} className="mt-1 text-xs font-medium text-muted transition-colors hover:text-ink">
                + weiteres Essensfenster
              </button>
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted">
              Diese Methode hat kein festes Tagesfenster.
            </p>
          )}
        </Card>

        {/* Live-Fasten-Uhr */}
        <div className={cx(
          "rounded-2xl border-2 bg-surface p-5",
          status?.imFenster ? "border-emerald-400/50 shadow-[0_0_30px_-10px_rgba(16,185,129,0.5)]" : "border-[color:var(--ov-10)]"
        )}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            {status ? (status.imFenster ? "Essensfenster offen" : "Fastenphase") : "Fasten"}
          </h3>
          {status ? (
            <>
              <p className="mt-3 text-3xl font-bold tabular-nums text-ink">{label(status.bis)}</p>
              <p className="mt-1 text-sm text-muted">
                {status.imFenster ? "bis Fenster schließt" : "bis nächstes Fenster"}
              </p>
              {status.fenster && (
                <p className="mt-3 text-xs text-faint">
                  Nächstes: {String(status.fenster.start).padStart(2, "0")}:00 –{" "}
                  {String(status.fenster.ende).padStart(2, "0")}:00 Uhr
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">Kein Fasten aktiv.</p>
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
    aktiv: "bg-emerald-500/15 text-emerald-300",
    kommend: "bg-sky-500/15 text-sky-300",
    beendet: "bg-[color:var(--ov-10)] text-faint",
  }

  return (
    <section className="mt-8">
      <SectionTitle>Fastenphasen (mehrtägig)</SectionTitle>
      <p className="mt-1 text-xs text-muted">
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
            className={cx(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              titel === v.titel
                ? "border-violet-400/50 bg-violet-500/15 text-violet-300"
                : "border-[color:var(--ov-10)] text-muted hover:border-[color:var(--ov-25)]"
            )}
          >
            {v.titel}
          </button>
        ))}
      </div>

      <form onSubmit={add} className="mt-3 flex flex-wrap items-end gap-2">
        <label className={labelCls}>
          Name (optional)
          <input
            value={titel} onChange={(e) => setTitel(e.target.value)}
            placeholder="z. B. Frühjahrs-Detox"
            className="mt-1 rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </label>
        <label className={labelCls}>
          Start
          <input
            type="date" value={start} onChange={(e) => setStart(e.target.value)}
            className="mt-1 rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </label>
        <label className={labelCls}>
          Dauer (Tage)
          <input
            type="number" min="1" max="14" value={tage} onChange={(e) => setTage(e.target.value)}
            className="mt-1 w-24 rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </label>
        <Button type="submit">Phase planen</Button>
      </form>

      {phasen.length > 0 && (
        <Card className="mt-3 px-4 py-2">
          <ul className="divide-y divide-[color:var(--ov-06)]">
            {phasen.map((p) => {
              const s = phasenStatus(p, heute())
              return (
                <li key={p.id} className="group flex items-center gap-3 py-2.5">
                  <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-medium", statusChip[s.status])}>
                    {s.status === "aktiv"
                      ? `Aktiv · Tag ${s.tag}/${p.tage}`
                      : s.status === "kommend"
                        ? `In ${s.inTagen} ${s.inTagen === 1 ? "Tag" : "Tagen"}`
                        : "Beendet"}
                  </span>
                  <span className="flex-1 text-sm text-ink/90">
                    {p.titel ? `${p.titel} · ` : ""}
                    {p.tage} {p.tage === 1 ? "Tag" : "Tage"} Fasten ab{" "}
                    {new Date(`${p.start}T00:00:00`).toLocaleDateString("de-DE")}
                  </span>
                  <button
                    onClick={() => setPhasen(phasen.filter((x) => x.id !== p.id))}
                    className="text-faint opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
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
        <SectionTitle>Mahlzeiten heute</SectionTitle>
        {kalorienZiel > 0 && (
          <span className="text-xs text-faint">
            {summe} / {kalorienZiel} kcal
          </span>
        )}
      </div>

      {kalorienZiel > 0 && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--ov-10)]">
          <div
            className={cx("h-full rounded-full", summe > kalorienZiel ? "bg-rose-400" : "bg-accent-gradient")}
            style={{ width: `${Math.min(100, (summe / kalorienZiel) * 100)}%` }}
          />
        </div>
      )}

      <form onSubmit={add} className="mt-3 flex flex-wrap items-end gap-2">
        <input
          value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="Mahlzeit…"
          className="min-w-40 flex-1 rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <input
          type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} placeholder="kcal"
          className="w-24 rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <input
          type="time" value={zeit} onChange={(e) => setZeit(e.target.value)}
          className="rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <Button type="submit">Hinzufügen</Button>
      </form>

      <Card className="mt-3 px-4 py-2">
        {heutige.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">Noch nichts erfasst.</p>
        ) : (
          <ul className="divide-y divide-[color:var(--ov-06)]">
            {heutige.map((m) => (
              <li key={m.id} className="group flex items-center gap-3 py-2">
                <span className="w-12 text-xs text-faint">{m.zeit || "–"}</span>
                <span className="flex-1 text-sm text-ink/90">{m.titel}</span>
                {m.kcal > 0 && <span className="text-xs text-muted">{m.kcal} kcal</span>}
                <button
                  onClick={() => setMahlzeiten(mahlzeiten.filter((x) => x.id !== m.id))}
                  className="text-faint opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}
