import { useEffect, useState } from "react"
import useStored from "../lib/useStored"
import {
  KONZEPTE, FASTEN_METHODEN, konzeptVon, methodeVon, FARBEN, fastenStatus,
  FASTEN_STANDARD, phasenStatus,
} from "../lib/ernaehrung"
import { heute } from "../lib/datum"
import { ZIEL_MODI } from "../lib/algorithmus"
import { LEBENSMITTEL, lebensmittelVon, makrosFuer } from "../lib/lebensmittel"
import { useZiel, PROFIL_STANDARD } from "./ZielSeite"
import { Card, PageHeader, SectionTitle, Button, Pill, Ring, cx, labelCls } from "./ui"

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
      <TagesBilanz plan={plan} />
      <KonzeptWahl />
      <FastenBereich />
      <FastenPhasen />
      <MahlzeitenLog kalorienZiel={plan?.kalorien} />
      <GewichtsTrend />
    </div>
  )
}

// ---- Heute: verbrauchte kcal/Makros als Ringe + Wasser ------------------
function summeHeute(mahlzeiten) {
  return mahlzeiten
    .filter((m) => m.datum === heute())
    .reduce(
      (a, m) => ({
        kcal: a.kcal + (m.kcal || 0),
        protein: a.protein + (m.protein || 0),
        fett: a.fett + (m.fett || 0),
        kohlenhydrate: a.kohlenhydrate + (m.kohlenhydrate || 0),
      }),
      { kcal: 0, protein: 0, fett: 0, kohlenhydrate: 0 }
    )
}

function TagesBilanz({ plan }) {
  const [mahlzeiten] = useStored("mahlzeiten", [])
  const s = summeHeute(mahlzeiten)
  const ziel = plan?.makros

  return (
    <section className="mt-8">
      <SectionTitle>Heute</SectionTitle>
      <Card className="mt-3 p-5">
        <div className="flex flex-wrap items-start justify-around gap-4">
          <MakroRing label="kcal" value={s.kcal} max={plan?.kalorien} color="var(--color-accent)" einheit="" gross />
          <MakroRing label="Protein" value={s.protein} max={ziel?.protein} color="var(--color-rose-300)" einheit="g" />
          <MakroRing label="Fett" value={s.fett} max={ziel?.fett} color="var(--color-amber-300)" einheit="g" />
          <MakroRing label="Carbs" value={s.kohlenhydrate} max={ziel?.kohlenhydrate} color="var(--color-sky-300)" einheit="g" />
        </div>
        <WasserTracker />
      </Card>
    </section>
  )
}

function MakroRing({ label, value, max, color, einheit, gross }) {
  const size = gross ? 78 : 66
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Ring value={value} max={max || value || 1} color={color} size={size} stroke={gross ? 7 : 6} label={`${value}`} />
      <p className="text-xs font-medium text-ink">{label}</p>
      <p className="text-[10px] text-faint">{max ? `von ${max} ${einheit}` : einheit || "—"}</p>
    </div>
  )
}

function WasserTracker() {
  const [wasser, setWasser] = useStored("wasser", {})
  const key = heute()
  const glaeser = wasser[key] ?? 0
  const ZIEL = 8 // Gläser à 250 ml = 2 L
  const setzen = (n) => setWasser({ ...wasser, [key]: Math.max(0, n) })

  return (
    <div className="mt-5 border-t border-[color:var(--ov-06)] pt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">💧 Wasser</p>
        <p className="text-xs text-muted">
          {glaeser} / {ZIEL} Gläser · {(glaeser * 0.25).toFixed(2)} L
        </p>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {Array.from({ length: ZIEL }).map((_, i) => (
          <button
            key={i}
            onClick={() => setzen(i + 1 === glaeser ? i : i + 1)}
            aria-label={`${i + 1} Gläser`}
            className={cx(
              "h-8 flex-1 rounded-md border transition-colors",
              i < glaeser ? "border-transparent bg-sky-500/30" : "border-[color:var(--ov-10)] bg-surface-2 hover:border-[color:var(--ov-25)]"
            )}
          />
        ))}
        <button
          onClick={() => setzen(glaeser + 1)}
          className="ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[color:var(--ov-10)] bg-surface-2 text-muted transition-colors hover:text-ink"
        >
          +
        </button>
      </div>
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
  const { profil } = useZiel()
  const konzept = konzeptVon(gewaehlt)
  const farbe = FARBEN[konzept.farbe]
  const modus = ZIEL_MODI[profil.modus]
  const passt = konzept.passtZu?.includes(profil.modus)

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
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-ink">{konzept.name}</h3>
          <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-medium", farbe.chip)}>{konzept.kurz}</span>
          {modus && konzept.passtZu && (
            <span
              className={cx(
                "ml-auto rounded-full px-2.5 py-1 text-[11px] font-medium",
                passt ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
              )}
            >
              {passt ? `✓ passt zu „${modus.name}"` : `für „${modus.name}" nur bedingt`}
            </span>
          )}
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted">{konzept.idee}</p>

        {konzept.wissenschaft && (
          <div className="mt-3 rounded-xl border border-[color:var(--ov-06)] bg-[color:var(--ov-05)] p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">🔬 Was die Wissenschaft sagt</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/90">{konzept.wissenschaft}</p>
          </div>
        )}

        {(konzept.staerken || konzept.beachten) && (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {konzept.staerken && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-400">Stärken</p>
                <ul className="mt-1.5 space-y-1">
                  {konzept.staerken.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink/90">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span className="min-w-0">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {konzept.beachten && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-400">Beachten</p>
                <ul className="mt-1.5 space-y-1">
                  {konzept.beachten.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-ink/90">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      <span className="min-w-0">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">So setzt du's um</p>
        <ul className="mt-1.5 space-y-1.5">
          {konzept.prinzipien.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink/90">
              <span className={cx("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", farbe.punkt)} />
              <span className="min-w-0">{p}</span>
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
  const [lid, setLid] = useState("")
  const [menge, setMenge] = useState("100")
  const [titel, setTitel] = useState("")
  const [kcal, setKcal] = useState("")
  const [zeit, setZeit] = useState("")

  const item = lid ? lebensmittelVon(lid) : null
  const vorschau = item ? makrosFuer(item, Number(menge) || 0) : null

  function reset() {
    setLid(""); setMenge("100"); setTitel(""); setKcal(""); setZeit("")
  }

  function add(e) {
    e.preventDefault()
    let eintrag
    if (item) {
      const mk = makrosFuer(item, Number(menge) || 0)
      eintrag = { id: Date.now(), titel: `${item.name} · ${Number(menge) || 0} g`, ...mk, menge: Number(menge) || 0, zeit, datum: heuteKey() }
    } else {
      if (!titel.trim()) return
      eintrag = { id: Date.now(), titel: titel.trim(), kcal: Number(kcal) || 0, protein: 0, fett: 0, kohlenhydrate: 0, menge: null, zeit, datum: heuteKey() }
    }
    setMahlzeiten([eintrag, ...mahlzeiten])
    reset()
  }

  // Zuletzt genutzte Einträge (nach Titel eindeutig) als Schnellauswahl.
  const zuletzt = []
  for (const m of mahlzeiten) {
    if (zuletzt.length >= 6) break
    if (!zuletzt.some((x) => x.titel === m.titel)) zuletzt.push(m)
  }
  const nochmal = (m) =>
    setMahlzeiten([
      { id: Date.now(), titel: m.titel, kcal: m.kcal || 0, protein: m.protein || 0, fett: m.fett || 0, kohlenhydrate: m.kohlenhydrate || 0, menge: m.menge ?? null, zeit: "", datum: heuteKey() },
      ...mahlzeiten,
    ])

  const heutige = mahlzeiten.filter((m) => m.datum === heuteKey())
  const summe = heutige.reduce((s, m) => s + (m.kcal || 0), 0)

  const feld =
    "rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"

  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between">
        <SectionTitle>Mahlzeiten heute</SectionTitle>
        {kalorienZiel > 0 && (
          <span className="text-xs text-faint">{summe} / {kalorienZiel} kcal</span>
        )}
      </div>

      {kalorienZiel > 0 && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--ov-10)]">
          <div className={cx("h-full rounded-full", summe > kalorienZiel ? "bg-rose-400" : "bg-accent-gradient")}
            style={{ width: `${Math.min(100, (summe / kalorienZiel) * 100)}%` }} />
        </div>
      )}

      <form onSubmit={add} className="mt-3 space-y-2">
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-medium text-muted">
            Lebensmittel
            <select value={lid} onChange={(e) => setLid(e.target.value)} className={cx(feld, "w-full")}>
              <option value="">Freie Eingabe…</option>
              {LEBENSMITTEL.map((l) => (
                <option key={l.id} value={l.id}>{l.name} ({l.kcal} kcal/100 g)</option>
              ))}
            </select>
          </label>
          {item ? (
            <label className="flex w-24 flex-col gap-1 text-xs font-medium text-muted">
              Menge (g)
              <input type="number" min="0" step="10" value={menge} onChange={(e) => setMenge(e.target.value)} className={feld} />
            </label>
          ) : (
            <>
              <input value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="Mahlzeit…" className={cx(feld, "min-w-40 flex-1")} />
              <input type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} placeholder="kcal" className={cx(feld, "w-24")} />
            </>
          )}
          <input type="time" value={zeit} onChange={(e) => setZeit(e.target.value)} className={feld} />
          <Button type="submit">Hinzufügen</Button>
        </div>
        {vorschau && (
          <p className="text-xs text-muted">
            = <span className="font-medium text-ink">{vorschau.kcal} kcal</span> · P {vorschau.protein} g · F {vorschau.fett} g · C {vorschau.kohlenhydrate} g
          </p>
        )}
      </form>

      {zuletzt.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="self-center text-[11px] text-faint">Zuletzt:</span>
          {zuletzt.map((m) => (
            <button key={m.id} type="button" onClick={() => nochmal(m)}
              className="rounded-full border border-[color:var(--ov-10)] bg-surface-2 px-2.5 py-1 text-xs text-muted transition-colors hover:text-ink">
              + {m.titel.length > 22 ? m.titel.slice(0, 22) + "…" : m.titel}
            </button>
          ))}
        </div>
      )}

      <Card className="mt-3 px-4 py-2">
        {heutige.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">Noch nichts erfasst.</p>
        ) : (
          <ul className="divide-y divide-[color:var(--ov-06)]">
            {heutige.map((m) => {
              const hatMakros = (m.protein || m.fett || m.kohlenhydrate) > 0
              return (
                <li key={m.id} className="group flex items-center gap-3 py-2">
                  <span className="w-12 shrink-0 text-xs text-faint">{m.zeit || "–"}</span>
                  <span className="flex-1 truncate text-sm text-ink/90">{m.titel}</span>
                  {hatMakros && (
                    <span className="hidden shrink-0 text-[11px] text-faint sm:inline">
                      P{m.protein} · F{m.fett} · C{m.kohlenhydrate}
                    </span>
                  )}
                  {m.kcal > 0 && <span className="shrink-0 text-xs font-medium text-muted">{m.kcal} kcal</span>}
                  <button onClick={() => setMahlzeiten(mahlzeiten.filter((x) => x.id !== m.id))}
                    className="text-faint opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100">
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </section>
  )
}

// ---- Gewichtsverlauf -----------------------------------------------------
function GewichtsTrend() {
  const [log, setLog] = useStored("gewichtsLog", [])
  const [profil, setProfil] = useStored("profil", PROFIL_STANDARD)
  const [wert, setWert] = useState("")

  const sortiert = [...log].sort((a, b) => a.datum.localeCompare(b.datum))
  const letzter = sortiert[sortiert.length - 1]

  function add(e) {
    e.preventDefault()
    const kg = Number(wert)
    if (!kg) return
    const heuteK = heute()
    setLog([...log.filter((x) => x.datum !== heuteK), { datum: heuteK, kg }])
    setProfil({ ...profil, gewicht: kg })
    setWert("")
  }

  return (
    <section className="mt-8">
      <SectionTitle
        right={
          <form onSubmit={add} className="flex gap-2">
            <input
              type="number" step="0.1" value={wert} onChange={(e) => setWert(e.target.value)}
              placeholder={`${profil.gewicht} kg`}
              className="w-24 rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-1.5 text-sm text-ink outline-none placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
            <Button type="submit" variant="subtle">Eintragen</Button>
          </form>
        }
      >
        Gewichtsverlauf
      </SectionTitle>
      <Card className="mt-3 p-5">
        {sortiert.length < 2 ? (
          <p className="py-4 text-center text-sm text-muted">
            {letzter
              ? `Zuletzt ${letzter.kg} kg – ab dem zweiten Eintrag erscheint hier deine Kurve.`
              : "Trage dein Gewicht ein, um den Verlauf zu verfolgen."}
          </p>
        ) : (
          <GewichtChart punkte={sortiert} zielGewicht={profil.zielGewicht} />
        )}
      </Card>
    </section>
  )
}

function GewichtChart({ punkte, zielGewicht }) {
  const W = 560, H = 180, P = 30
  const werte = punkte.map((p) => p.kg)
  let min = Math.min(...werte, zielGewicht || Infinity)
  let max = Math.max(...werte, zielGewicht || -Infinity)
  if (min === max) { min -= 1; max += 1 }
  const sp = max - min
  min -= sp * 0.1
  max += sp * 0.1
  const x = (i) => P + (i * (W - 2 * P)) / (punkte.length - 1)
  const y = (v) => H - P - ((v - min) * (H - 2 * P)) / (max - min)
  const d = punkte.map((p, i) => `${x(i)},${y(p.kg)}`).join(" ")
  const kurz = (key) => {
    const dd = new Date(`${key}T00:00:00`)
    return `${dd.getDate()}.${dd.getMonth() + 1}.`
  }
  const zeigeZiel = zielGewicht > 0 && zielGewicht >= min && zielGewicht <= max

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {zeigeZiel && (
        <g>
          <line x1={P} x2={W - P} y1={y(zielGewicht)} y2={y(zielGewicht)}
            style={{ stroke: "var(--color-emerald-400)" }} strokeDasharray="4 4" strokeOpacity="0.7" />
          <text x={W - P} y={y(zielGewicht) - 4} textAnchor="end"
            style={{ fontSize: 10, fill: "var(--color-emerald-400)" }}>Ziel {zielGewicht}</text>
        </g>
      )}
      <polyline points={d} fill="none" style={{ stroke: "var(--color-accent-soft)" }} strokeWidth="2.5" strokeLinejoin="round" />
      {punkte.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.kg)} r={i === punkte.length - 1 ? 5 : 3.5} style={{ fill: "var(--color-accent-soft)" }} />
      ))}
      <text x={x(punkte.length - 1)} y={y(punkte[punkte.length - 1].kg) - 10} textAnchor="end"
        style={{ fontSize: 12, fontWeight: 600, fill: "var(--color-ink)" }}>
        {punkte[punkte.length - 1].kg} kg
      </text>
      <text x={P} y={H - 8} style={{ fontSize: 10, fill: "var(--color-faint)" }}>{kurz(punkte[0].datum)}</text>
      <text x={W - P} y={H - 8} textAnchor="end" style={{ fontSize: 10, fill: "var(--color-faint)" }}>{kurz(punkte[punkte.length - 1].datum)}</text>
    </svg>
  )
}
