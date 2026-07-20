import { useState } from "react"
import useStored from "../lib/useStored"
import { heute } from "../lib/datum"
import { ZIEL_MODI, AKTIVITAET, berechnePlan } from "../lib/algorithmus"
import { SPLITS, standardTage, wendeSplitAn, planTag, normEintrag } from "../lib/splits"
import { UEBUNGEN, KATEGORIEN, MUSKELGRUPPEN, uebungVon } from "../lib/uebungen"
import { KONZEPTE, FASTEN_METHODEN, methodeVon, FARBEN } from "../lib/ernaehrung"
import { FastenPhasen } from "./ErnaehrungsplanSeite"
import { Card, PageHeader, SectionTitle, Button, Pill, cx, inputCls } from "./ui"

// Standard-Profil. Wird von Training und Ernährung gemeinsam genutzt und
// kann jederzeit neu eingestellt werden.
export const PROFIL_STANDARD = {
  modus: "muskeln",
  geschlecht: "m",
  alter: 25,
  groesse: 180,
  gewicht: 80,
  zielGewicht: 82,
  kfa: 0, // Körperfettanteil in %, 0 = unbekannt
  aktivitaet: "moderat",
  trainingsTage: 4,
  zeitProEinheit: 60,
  deadline: "",
  equipment: "gym",
  splitWahl: "oberUnter",
  tageWahl: ["mo", "di", "do", "fr"],
}

// Gemeinsamer Zugriff auf Profil + berechneten Plan.
export function useZiel() {
  const [profil, setProfil] = useStored("profil", PROFIL_STANDARD)
  const plan = berechnePlan(profil)
  return { profil, setProfil, plan }
}

function Feld({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted">
      {label}
      {children}
    </label>
  )
}

const TAG_LABELS = [
  { key: "mo", label: "Mo" }, { key: "di", label: "Di" }, { key: "mi", label: "Mi" },
  { key: "do", label: "Do" }, { key: "fr", label: "Fr" }, { key: "sa", label: "Sa" },
  { key: "so", label: "So" },
]

export default function ZielSeite() {
  const { profil, setProfil, plan } = useZiel()
  const set = (feld) => (e) => {
    const v = e.target.value
    const zahl = ["alter", "groesse", "gewicht", "zielGewicht", "kfa", "zeitProEinheit"]
    setProfil({ ...profil, [feld]: zahl.includes(feld) ? Number(v) : v })
  }

  return (
    <div>
      <PageHeader
        title="Ziel & Anpassung"
        subtitle="Ziel, Trainingsplan und Ernährung – alles hier einstellbar, jederzeit änderbar."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Eingaben */}
        <Card className="p-5">
          <SectionTitle>Ziel-Modus</SectionTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(ZIEL_MODI).map(([key, m]) => (
              <Pill
                key={key}
                active={profil.modus === key}
                onClick={() => setProfil({ ...profil, modus: key })}
              >
                {m.name}
              </Pill>
            ))}
          </div>

          <SectionTitle className="mt-5">Körperdaten</SectionTitle>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Feld label="Geschlecht">
              <select value={profil.geschlecht} onChange={set("geschlecht")} className={inputCls}>
                <option value="m">Männlich</option>
                <option value="w">Weiblich</option>
              </select>
            </Feld>
            <Feld label="Alter">
              <input type="number" value={profil.alter} onChange={set("alter")} className={inputCls} />
            </Feld>
            <Feld label="Größe (cm)">
              <input type="number" value={profil.groesse} onChange={set("groesse")} className={inputCls} />
            </Feld>
            <Feld label="Gewicht (kg)">
              <input type="number" value={profil.gewicht} onChange={set("gewicht")} className={inputCls} />
            </Feld>
            <Feld label="Zielgewicht (kg)">
              <input type="number" value={profil.zielGewicht} onChange={set("zielGewicht")} className={inputCls} />
            </Feld>
            <Feld label="KFA % (optional)">
              <input
                type="number" min="3" max="60" step="0.5"
                value={profil.kfa || ""} onChange={set("kfa")}
                placeholder="unbekannt"
                title="Körperfettanteil – macht die Kalorienberechnung genauer (Katch-McArdle)"
                className={inputCls}
              />
            </Feld>
            <Feld label="Aktivität">
              <select value={profil.aktivitaet} onChange={set("aktivitaet")} className={inputCls}>
                {Object.entries(AKTIVITAET).map(([key, a]) => (
                  <option key={key} value={key}>{a.name}</option>
                ))}
              </select>
            </Feld>
            <Feld label="Zeit / Einheit (Min.)">
              <input type="number" min="20" step="10" value={profil.zeitProEinheit} onChange={set("zeitProEinheit")} className={inputCls} />
            </Feld>
            <Feld label="Deadline">
              <input type="date" min={heute()} value={profil.deadline} onChange={set("deadline")} className={inputCls} />
            </Feld>
          </div>
        </Card>

        {/* Ergebnis des Algorithmus */}
        <Ergebnis plan={plan} />
      </div>

      <TrainingAnpassen profil={profil} setProfil={setProfil} />
      <ErnaehrungAnpassen />
      <FastenPhasen />
    </div>
  )
}

// ---- Trainingsplan erstellen: Split, Tage, Modus je Tag, Feinschliff ----
function TrainingAnpassen({ profil, setProfil }) {
  const [, setWochenplan] = useStored("trainingsplanUebungen", {})
  const [favoriten] = useStored("favoriten", [])
  const [uebernommen, setUebernommen] = useState(false)

  const splitWahl = profil.splitWahl ?? "oberUnter"
  const tageWahl = profil.tageWahl ?? standardTage(profil.trainingsTage ?? 3)
  const tagesModus = profil.tagesModus ?? {}
  const split = SPLITS[splitWahl]

  const modusVon = (k) => tagesModus[k] ?? "gym"

  function setzen(aenderung) {
    setProfil({ ...profil, ...aenderung })
    setUebernommen(false)
  }

  function toggleTag(key) {
    const neu = tageWahl.includes(key)
      ? tageWahl.filter((k) => k !== key)
      : [...tageWahl, key]
    setzen({ tageWahl: neu, trainingsTage: neu.length })
  }

  function toggleModus(key) {
    setzen({
      tagesModus: { ...tagesModus, [key]: modusVon(key) === "gym" ? "heim" : "gym" },
    })
  }

  function splitWaehlen(key) {
    // Beim Split-Wechsel die empfohlene Tageszahl direkt übernehmen.
    const tage = standardTage(SPLITS[key].empfohleneTage)
    setzen({ splitWahl: key, tageWahl: tage, trainingsTage: tage.length })
  }

  function generieren() {
    const modusMap = Object.fromEntries(tageWahl.map((k) => [k, modusVon(k)]))
    setWochenplan(wendeSplitAn(splitWahl, tageWahl, modusMap, favoriten))
    setUebernommen(true)
  }

  return (
    <section className="mt-8">
      <SectionTitle>Trainingsplan erstellen</SectionTitle>

      {/* 1. Split wählen */}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {Object.entries(SPLITS).map(([key, s]) => {
          const aktiv = key === splitWahl
          return (
            <button
              key={key}
              onClick={() => splitWaehlen(key)}
              className={cx(
                "rounded-2xl border bg-surface p-4 text-left transition-colors",
                aktiv ? "border-accent/60 shadow-[var(--shadow-glow)]" : "border-white/[0.06] hover:border-white/25"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">{s.name}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-muted">
                  {s.empfohleneTage} Tage · {s.kurz}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">{s.wissenschaft}</p>
            </button>
          )
        })}
      </div>

      {/* 2. Tage koppeln */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-2 text-xs text-muted">Trainingstage:</span>
        {TAG_LABELS.map((t) => (
          <button
            key={t.key}
            onClick={() => toggleTag(t.key)}
            className={cx(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              tageWahl.includes(t.key)
                ? "border-accent/60 bg-accent/15 font-medium text-accent-soft"
                : "border-white/10 text-faint hover:border-white/25"
            )}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-2 text-xs text-faint">
          {tageWahl.length} gewählt · empfohlen: {split?.empfohleneTage}
        </span>
      </div>

      {/* 3. Modus je Tag – Gym & Calisthenics kombinierbar */}
      {tageWahl.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-muted">Modus je Tag:</span>
          {TAG_LABELS.filter((t) => tageWahl.includes(t.key)).map((t) => {
            const heim = modusVon(t.key) === "heim"
            return (
              <button
                key={t.key}
                onClick={() => toggleModus(t.key)}
                title="Klicken zum Umschalten"
                className={cx(
                  "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                  heim
                    ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                    : "border-white/10 bg-surface-2 text-muted"
                )}
              >
                {t.label} · {heim ? "Cali" : "Gym"}
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={generieren}>Plan generieren → Trainingsplan</Button>
        {uebernommen && (
          <span className="text-sm font-medium text-emerald-400">
            ✓ Generiert – Feinschliff unten, Training &amp; Statistik im Trainingsplan.
          </span>
        )}
        <span className="text-xs text-faint">Überschreibt den aktuellen Wochenplan.</span>
      </div>

      <FeinschliffEditor tageWahl={tageWahl} />
    </section>
  )
}

// Übungen pro Tag im Detail anpassen: entfernen, hinzufügen, Favoriten,
// Zielvorgaben (Sätze × Wdh. × Gewicht) je Übung.
function FeinschliffEditor({ tageWahl }) {
  const [plan, setPlan] = useStored("trainingsplanUebungen", {})
  const [favoriten, setFavoriten] = useStored("favoriten", [])
  const [tag, setTag] = useState(tageWahl[0] ?? "mo")

  const eintraege = planTag(plan, tag)
  const frei = UEBUNGEN.filter((u) => !eintraege.some((e) => e.id === u.id))

  function entfernen(id) {
    setPlan({ ...plan, [tag]: eintraege.filter((e) => e.id !== id) })
  }
  function hinzufuegen(id) {
    if (id) setPlan({ ...plan, [tag]: [...eintraege, normEintrag(id)] })
  }
  function setZiel(id, feld, wert) {
    setPlan({
      ...plan,
      [tag]: eintraege.map((e) =>
        e.id === id ? { ...e, [feld]: Number(wert) || 0 } : e
      ),
    })
  }
  function toggleFav(id) {
    setFavoriten(
      favoriten.includes(id) ? favoriten.filter((x) => x !== id) : [...favoriten, id]
    )
  }

  return (
    <Card className="mt-5 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
        Feinschliff: Übungen pro Tag
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {TAG_LABELS.map((t) => {
          const anzahl = (plan[t.key] ?? []).length
          return (
            <button
              key={t.key}
              onClick={() => setTag(t.key)}
              className={cx(
                "rounded-lg border px-2.5 py-1.5 text-sm transition-colors",
                tag === t.key
                  ? "border-transparent bg-accent-gradient text-white"
                  : "border-white/10 text-muted hover:border-white/25"
              )}
            >
              {t.label}
              {anzahl > 0 && (
                <span className={cx("ml-1 text-[10px]", tag === t.key ? "opacity-70" : "text-faint")}>
                  {anzahl}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {eintraege.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Ruhetag – keine Übungen.</p>
      ) : (
        <ul className="mt-3 divide-y divide-white/[0.06]">
          {eintraege.map((e) => {
            const u = uebungVon(e.id)
            if (!u) return null
            const cali = u.geraet === "Körpergewicht"
            const zielInput =
              "w-14 rounded-md border border-white/10 bg-surface-2 px-1.5 py-1 text-center text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-2.5 py-2">
                <button
                  onClick={() => toggleFav(e.id)}
                  title="Lieblingsübung"
                  className={favoriten.includes(e.id) ? "text-amber-400" : "text-faint hover:text-amber-400"}
                >
                  ★
                </button>
                <span className="min-w-36 flex-1 text-sm font-medium text-ink">{u.name}</span>

                {/* Zielvorgaben: Sätze × Wdh. × Gewicht */}
                <span className="flex items-center gap-1 text-xs text-muted">
                  <input
                    type="number" min="1" value={e.saetze || ""}
                    onChange={(ev) => setZiel(e.id, "saetze", ev.target.value)}
                    title="Sätze" className={zielInput}
                  />
                  ×
                  <input
                    type="number" min="1" value={e.wdh || ""}
                    onChange={(ev) => setZiel(e.id, "wdh", ev.target.value)}
                    title="Wiederholungen" className={zielInput}
                  />
                  ×
                  <input
                    type="number" min="0" step="0.5" value={e.gewicht || ""}
                    onChange={(ev) => setZiel(e.id, "gewicht", ev.target.value)}
                    placeholder="–" title="Gewicht (kg), leer = Körpergewicht"
                    className={zielInput}
                  />
                  kg
                </span>

                <span
                  className={cx(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium",
                    cali ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-muted"
                  )}
                >
                  {cali ? "Cali" : u.geraet}
                </span>
                <span className="hidden gap-1 lg:flex">
                  {u.muskeln.map((m) => (
                    <span key={m} className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent-soft">
                      {MUSKELGRUPPEN[m]?.name}
                    </span>
                  ))}
                </span>
                <button onClick={() => entfernen(e.id)} className="text-faint hover:text-rose-400">
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <select
        value=""
        onChange={(e) => hinzufuegen(e.target.value)}
        className="mt-3 rounded-lg border border-white/10 bg-surface-2 px-2.5 py-2 text-sm text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      >
        <option value="">+ Übung hinzufügen…</option>
        {KATEGORIEN.map((kat) => (
          <optgroup key={kat} label={kat}>
            {frei
              .filter((u) => u.kategorie === kat)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} · {u.geraet}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </Card>
  )
}

// ---- Ernährung: Konzept & Fasten-Methode auch hier anpassbar ----
function ErnaehrungAnpassen() {
  const [konzeptId, setKonzeptId] = useStored("ernaehrungKonzept", "standard")
  const [fasten, setFasten] = useStored("fasten", { methode: "16:8", fenster: methodeVon("16:8").fenster })

  return (
    <section className="mt-8">
      <SectionTitle>Ernährung anpassen</SectionTitle>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Konzept</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {KONZEPTE.map((k) => (
              <Pill key={k.id} active={konzeptId === k.id} onClick={() => setKonzeptId(k.id)}>
                <span className={cx("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", FARBEN[k.farbe].punkt)} />
                {k.name}
              </Pill>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Fasten-Methode</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {FASTEN_METHODEN.map((m) => (
              <Pill
                key={m.id}
                active={fasten.methode === m.id}
                onClick={() => setFasten({ methode: m.id, fenster: m.id === "custom" ? (fasten.fenster ?? m.fenster) : m.fenster })}
              >
                {m.name}
              </Pill>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            Fenster &amp; mehrtägige Fastenphasen: im Ernährungsplan.
          </p>
        </Card>
      </div>
    </section>
  )
}

function Ergebnis({ plan }) {
  if (!plan) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-muted">
        Fülle deine Körperdaten aus, um deinen Plan zu berechnen.
      </div>
    )
  }
  const { makros, training, deadline, modusInfo } = plan

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-baseline justify-between">
          <SectionTitle>Tagesbedarf</SectionTitle>
          <span className="text-xs text-faint">Erhaltung {plan.erhaltung} kcal</span>
        </div>
        <p className="mt-2 text-4xl font-bold tabular-nums text-ink">
          {plan.kalorien} <span className="text-lg font-normal text-muted">kcal / Tag</span>
        </p>
        <p className="mt-0.5 text-sm text-muted">
          {modusInfo.name} · {modusInfo.kurz}
        </p>
        <p className="mt-1 text-xs text-faint">
          Formel: {plan.formel}
          {plan.magermasse ? ` · ${plan.magermasse} kg fettfreie Masse` : " – KFA angeben für genauere Werte"}
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

      <Card className="p-5">
        <SectionTitle>Trainingsempfehlung</SectionTitle>
        <p className="mt-2 text-lg font-semibold text-ink">{training.split.name}</p>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          <li>{training.tageProWoche}× / Woche · {training.zeitProEinheit} min</li>
          <li>Wiederholungen: {training.wiederholungen}</li>
          <li>Cardio: {training.cardio}</li>
          <li className="text-faint">Fokus: {training.fokus}</li>
        </ul>
      </Card>

      {deadline && (
        <div
          className={cx(
            "rounded-2xl border-2 bg-surface p-5",
            deadline.realistisch ? "border-emerald-400/40" : "border-rose-400/40"
          )}
        >
          <SectionTitle>Deadline</SectionTitle>
          <p className="mt-2 text-sm text-ink/90">
            {deadline.wochen} Wochen · {deadline.differenz > 0 ? "+" : ""}
            {deadline.differenz} kg gesamt
          </p>
          <p className="mt-1 text-sm text-ink/90">
            Tempo: {deadline.proWoche > 0 ? "+" : ""}
            {deadline.proWoche} kg / Woche
          </p>
          <p className={cx("mt-2 text-sm font-medium", deadline.realistisch ? "text-emerald-400" : "text-rose-400")}>
            {deadline.realistisch
              ? "✓ Realistisches Tempo"
              : "⚠ Sehr ambitioniert – Tempo evtl. entschärfen"}
          </p>
        </div>
      )}
    </div>
  )
}
