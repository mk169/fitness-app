import { useState } from "react"
import useStored from "../lib/useStored"
import { heute } from "../lib/datum"
import { ZIEL_MODI, AKTIVITAET, berechnePlan } from "../lib/algorithmus"
import { SPLITS, standardTage, wendeSplitAn, planTag, normEintrag } from "../lib/splits"
import { UEBUNGEN, KATEGORIEN, MUSKELGRUPPEN, uebungVon } from "../lib/uebungen"
import { KONZEPTE, FASTEN_METHODEN, methodeVon, FARBEN } from "../lib/ernaehrung"
import { FastenPhasen } from "./ErnaehrungsplanSeite"

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
    <label className="flex flex-col text-xs text-gray-500">
      {label}
      {children}
    </label>
  )
}

const inputCls =
  "mt-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"

const TAG_LABELS = [
  { key: "mo", label: "Mo" }, { key: "di", label: "Di" }, { key: "mi", label: "Mi" },
  { key: "do", label: "Do" }, { key: "fr", label: "Fr" }, { key: "sa", label: "Sa" },
  { key: "so", label: "So" },
]

export default function ZielSeite({ onBack }) {
  const { profil, setProfil, plan } = useZiel()
  const set = (feld) => (e) => {
    const v = e.target.value
    const zahl = ["alter", "groesse", "gewicht", "zielGewicht", "kfa", "zeitProEinheit"]
    setProfil({ ...profil, [feld]: zahl.includes(feld) ? Number(v) : v })
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <button
        onClick={onBack}
        className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-900"
      >
        ← Dashboard
      </button>

      <div className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight">Ziel &amp; Anpassung</h1>
        <p className="mt-1 text-sm text-gray-400">
          Ziel, Trainingsplan und Ernährung – alles hier einstellbar, jederzeit änderbar.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Eingaben */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Ziel-Modus
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(ZIEL_MODI).map(([key, m]) => {
              const aktiv = profil.modus === key
              return (
                <button
                  key={key}
                  onClick={() => setProfil({ ...profil, modus: key })}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    aktiv
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {m.name}
                </button>
              )
            })}
          </div>

          <h2 className="mt-5 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Körperdaten
          </h2>
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
        </div>

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
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Trainingsplan erstellen
      </h2>

      {/* 1. Split wählen */}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {Object.entries(SPLITS).map(([key, s]) => {
          const aktiv = key === splitWahl
          return (
            <button
              key={key}
              onClick={() => splitWaehlen(key)}
              className={`rounded-xl border-2 bg-white p-4 text-left transition-colors ${
                aktiv ? "border-gray-900" : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{s.name}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  {s.empfohleneTage} Tage · {s.kurz}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">{s.wissenschaft}</p>
            </button>
          )
        })}
      </div>

      {/* 2. Tage koppeln */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-2 text-xs text-gray-500">Trainingstage:</span>
        {TAG_LABELS.map((t) => (
          <button
            key={t.key}
            onClick={() => toggleTag(t.key)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              tageWahl.includes(t.key)
                ? "border-blue-500 bg-blue-50 font-medium text-blue-700"
                : "border-gray-200 text-gray-400 hover:border-gray-400"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-2 text-xs text-gray-400">
          {tageWahl.length} gewählt · empfohlen: {split?.empfohleneTage}
        </span>
      </div>

      {/* 3. Modus je Tag – Gym & Calisthenics kombinierbar */}
      {tageWahl.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-gray-500">Modus je Tag:</span>
          {TAG_LABELS.filter((t) => tageWahl.includes(t.key)).map((t) => {
            const heim = modusVon(t.key) === "heim"
            return (
              <button
                key={t.key}
                onClick={() => toggleModus(t.key)}
                title="Klicken zum Umschalten"
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  heim
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                {t.label} · {heim ? "Cali" : "Gym"}
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={generieren}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Plan generieren → Trainingsplan
        </button>
        {uebernommen && (
          <span className="text-sm font-medium text-emerald-600">
            ✓ Generiert – Feinschliff unten, Training &amp; Statistik im Trainingsplan.
          </span>
        )}
        <span className="text-xs text-gray-400">Überschreibt den aktuellen Wochenplan.</span>
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
    <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        Feinschliff: Übungen pro Tag
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {TAG_LABELS.map((t) => {
          const anzahl = (plan[t.key] ?? []).length
          return (
            <button
              key={t.key}
              onClick={() => setTag(t.key)}
              className={`rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${
                tag === t.key
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              {t.label}
              {anzahl > 0 && (
                <span className={`ml-1 text-[10px] ${tag === t.key ? "opacity-70" : "text-gray-400"}`}>
                  {anzahl}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {eintraege.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">Ruhetag – keine Übungen.</p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100">
          {eintraege.map((e) => {
            const u = uebungVon(e.id)
            if (!u) return null
            const cali = u.geraet === "Körpergewicht"
            const zielInput =
              "w-14 rounded-md border border-gray-200 px-1.5 py-1 text-center text-sm text-gray-900 outline-none focus:border-gray-900"
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-2.5 py-2">
                <button
                  onClick={() => toggleFav(e.id)}
                  title="Lieblingsübung"
                  className={favoriten.includes(e.id) ? "text-amber-400" : "text-gray-300 hover:text-amber-400"}
                >
                  ★
                </button>
                <span className="min-w-36 flex-1 text-sm font-medium text-gray-900">{u.name}</span>

                {/* Zielvorgaben: Sätze × Wdh. × Gewicht */}
                <span className="flex items-center gap-1 text-xs text-gray-400">
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
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    cali ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {cali ? "Cali" : u.geraet}
                </span>
                <span className="hidden gap-1 lg:flex">
                  {u.muskeln.map((m) => (
                    <span key={m} className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700">
                      {MUSKELGRUPPEN[m]?.name}
                    </span>
                  ))}
                </span>
                <button onClick={() => entfernen(e.id)} className="text-gray-300 hover:text-red-500">
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
        className="mt-3 rounded-md border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-600 outline-none focus:border-gray-900"
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
    </div>
  )
}

// ---- Ernährung: Konzept & Fasten-Methode auch hier anpassbar ----
function ErnaehrungAnpassen() {
  const [konzeptId, setKonzeptId] = useStored("ernaehrungKonzept", "standard")
  const [fasten, setFasten] = useStored("fasten", { methode: "16:8", fenster: methodeVon("16:8").fenster })

  return (
    <section className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Ernährung anpassen
      </h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Konzept</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {KONZEPTE.map((k) => (
              <button
                key={k.id}
                onClick={() => setKonzeptId(k.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  konzeptId === k.id
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${FARBEN[k.farbe].punkt}`} />
                {k.name}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Fasten-Methode</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {FASTEN_METHODEN.map((m) => (
              <button
                key={m.id}
                onClick={() => setFasten({ methode: m.id, fenster: m.id === "custom" ? (fasten.fenster ?? m.fenster) : m.fenster })}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  fasten.methode === m.id
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Fenster &amp; mehrtägige Fastenphasen: im Ernährungsplan.
          </p>
        </div>
      </div>
    </section>
  )
}

function Ergebnis({ plan }) {
  if (!plan) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-5 text-sm text-gray-400">
        Fülle deine Körperdaten aus, um deinen Plan zu berechnen.
      </div>
    )
  }
  const { makros, training, deadline, modusInfo } = plan

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Tagesbedarf
          </h2>
          <span className="text-xs text-gray-400">
            Erhaltung {plan.erhaltung} kcal
          </span>
        </div>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {plan.kalorien} <span className="text-lg font-normal text-gray-400">kcal / Tag</span>
        </p>
        <p className="mt-0.5 text-sm text-gray-500">
          {modusInfo.name} · {modusInfo.kurz}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Formel: {plan.formel}
          {plan.magermasse ? ` · ${plan.magermasse} kg fettfreie Masse` : " – KFA angeben für genauere Werte"}
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

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Trainingsempfehlung
        </h2>
        <p className="mt-2 text-lg font-semibold text-gray-900">{training.split.name}</p>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          <li>{training.tageProWoche}× / Woche · {training.zeitProEinheit} min</li>
          <li>Wiederholungen: {training.wiederholungen}</li>
          <li>Cardio: {training.cardio}</li>
          <li className="text-gray-400">Fokus: {training.fokus}</li>
        </ul>
      </div>

      {deadline && (
        <div
          className={`rounded-xl border-2 bg-white p-5 ${deadline.realistisch ? "border-emerald-300" : "border-rose-300"}`}
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Deadline
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            {deadline.wochen} Wochen · {deadline.differenz > 0 ? "+" : ""}
            {deadline.differenz} kg gesamt
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Tempo: {deadline.proWoche > 0 ? "+" : ""}
            {deadline.proWoche} kg / Woche
          </p>
          <p className={`mt-2 text-sm font-medium ${deadline.realistisch ? "text-emerald-600" : "text-rose-600"}`}>
            {deadline.realistisch
              ? "✓ Realistisches Tempo"
              : "⚠ Sehr ambitioniert – Tempo evtl. entschärfen"}
          </p>
        </div>
      )}
    </div>
  )
}
