import { useMemo, useState } from "react"
import useStored from "../lib/useStored"
import { heute } from "../lib/datum"
import { ZIEL_MODI, AKTIVITAET, berechnePlan } from "../lib/algorithmus"
import { SPLITS, standardTage, wendeSplitAn } from "../lib/splits"
import { KONZEPTE, FASTEN_METHODEN, methodeVon, FARBEN } from "../lib/ernaehrung"
import { PROFIL_STANDARD } from "./ZielSeite"
import { Button, cx, inputCls } from "./ui"

// Erst-Einrichtung: führt neue Nutzer in wenigen Schritten durch Ziel,
// Körperdaten, Trainingsplan und Ernährung. Am Ende werden Profil,
// Wochenplan, Ernährungskonzept und Fasten-Methode gespeichert – die App
// startet danach vollständig eingerichtet.

const TAG_LABELS = [
  { key: "mo", label: "Mo" }, { key: "di", label: "Di" }, { key: "mi", label: "Mi" },
  { key: "do", label: "Do" }, { key: "fr", label: "Fr" }, { key: "sa", label: "Sa" },
  { key: "so", label: "So" },
]

const SCHRITTE = [
  { key: "willkommen", label: "Start" },
  { key: "ziel", label: "Ziel" },
  { key: "koerper", label: "Körper" },
  { key: "training", label: "Training" },
  { key: "ernaehrung", label: "Ernährung" },
  { key: "fertig", label: "Fertig" },
]

// ---- kleine Bausteine ----------------------------------------------------
function Feld({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-muted">
      <span className="flex items-baseline justify-between gap-2">
        {label}
        {hint && <span className="text-[10px] font-normal text-faint">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

function StepKopf({ nummer, eyebrow, titel, text }) {
  return (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-soft">
        {eyebrow ?? `Schritt ${nummer} von 4`}
      </span>
      <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-ink">{titel}</h2>
      {text && <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>}
    </div>
  )
}

// Auswahl-Kachel für Split / Konzept ---------------------------------------
function WahlKarte({ aktiv, onClick, titel, badge, punkt, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "group relative overflow-hidden rounded-2xl border bg-surface p-4 text-left transition-all duration-200",
        aktiv
          ? "border-accent/60 shadow-[var(--shadow-glow)]"
          : "border-white/[0.06] hover:border-white/20 hover:bg-surface-2"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-semibold text-ink">
          {punkt && <span className={cx("h-2.5 w-2.5 shrink-0 rounded-full", punkt)} />}
          {titel}
        </span>
        {badge && (
          <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-muted">
            {badge}
          </span>
        )}
      </div>
      {children}
      <span
        className={cx(
          "absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-accent text-[11px] text-white transition-opacity",
          aktiv ? "opacity-100" : "opacity-0"
        )}
      >
        ✓
      </span>
    </button>
  )
}

export default function Onboarding({ onFertig }) {
  const [, setProfil] = useStored("profil", PROFIL_STANDARD)
  const [, setWochenplan] = useStored("trainingsplanUebungen", {})
  const [, setKonzeptId] = useStored("ernaehrungKonzept", "standard")
  const [, setFasten] = useStored("fasten", { methode: "16:8", fenster: methodeVon("16:8").fenster })
  const [, setFertigFlag] = useStored("onboardingFertig", false)

  const [schritt, setSchritt] = useState(0)

  // Lokaler Entwurf – erst beim Abschluss werden die Stores geschrieben,
  // damit Zurück/Weiter keine Cloud-Schreibvorgänge auslöst.
  const [entwurf, setEntwurf] = useState(() => ({
    modus: PROFIL_STANDARD.modus,
    geschlecht: PROFIL_STANDARD.geschlecht,
    alter: PROFIL_STANDARD.alter,
    groesse: PROFIL_STANDARD.groesse,
    gewicht: PROFIL_STANDARD.gewicht,
    zielGewicht: PROFIL_STANDARD.zielGewicht,
    aktivitaet: PROFIL_STANDARD.aktivitaet,
    deadline: "",
    splitWahl: PROFIL_STANDARD.splitWahl,
    tageWahl: PROFIL_STANDARD.tageWahl,
    tagesModus: {},
    konzept: "standard",
    fastenMethode: "16:8",
  }))

  const set = (feld, wert) => setEntwurf((e) => ({ ...e, [feld]: wert }))
  const setNum = (feld) => (ev) => set(feld, Number(ev.target.value))

  const split = SPLITS[entwurf.splitWahl]
  const modusVon = (k) => entwurf.tagesModus[k] ?? "gym"

  function toggleTag(key) {
    const neu = entwurf.tageWahl.includes(key)
      ? entwurf.tageWahl.filter((k) => k !== key)
      : [...entwurf.tageWahl, key]
    set("tageWahl", neu)
  }
  function splitWaehlen(key) {
    setEntwurf((e) => ({ ...e, splitWahl: key, tageWahl: standardTage(SPLITS[key].empfohleneTage) }))
  }
  function toggleModus(key) {
    set("tagesModus", { ...entwurf.tagesModus, [key]: modusVon(key) === "gym" ? "heim" : "gym" })
  }

  // Live-Vorschau des berechneten Plans für den Abschluss-Schritt.
  const plan = useMemo(
    () => berechnePlan({ ...PROFIL_STANDARD, ...entwurf, trainingsTage: entwurf.tageWahl.length }),
    [entwurf]
  )

  function speichern() {
    const tage = entwurf.tageWahl.length ? entwurf.tageWahl : standardTage(3)
    const modusMap = Object.fromEntries(tage.map((k) => [k, modusVon(k)]))
    setProfil({
      ...PROFIL_STANDARD,
      modus: entwurf.modus,
      geschlecht: entwurf.geschlecht,
      alter: entwurf.alter,
      groesse: entwurf.groesse,
      gewicht: entwurf.gewicht,
      zielGewicht: entwurf.zielGewicht,
      aktivitaet: entwurf.aktivitaet,
      deadline: entwurf.deadline,
      splitWahl: entwurf.splitWahl,
      tageWahl: tage,
      trainingsTage: tage.length,
      tagesModus: entwurf.tagesModus,
    })
    setWochenplan(wendeSplitAn(entwurf.splitWahl, tage, modusMap, []))
    setKonzeptId(entwurf.konzept)
    setFasten({ methode: entwurf.fastenMethode, fenster: methodeVon(entwurf.fastenMethode).fenster })
    setFertigFlag(true)
    onFertig?.()
  }

  function ueberspringen() {
    setFertigFlag(true)
    onFertig?.()
  }

  const istErster = schritt === 0
  const istLetzter = schritt === SCHRITTE.length - 1
  const weiter = () => setSchritt((s) => Math.min(SCHRITTE.length - 1, s + 1))
  const zurueck = () => setSchritt((s) => Math.max(0, s - 1))

  // Fortschritt in % (Start-Schritt zählt als 0).
  const fortschritt = Math.round((schritt / (SCHRITTE.length - 1)) * 100)

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      {/* Ambient-Licht */}
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-accent/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 rounded-full bg-accent-2/10 blur-[120px]" />

      {/* Kopf: Wortmarke, Fortschrittsbalken, Schritt-Punkte */}
      <header className="relative z-10 mx-auto w-full max-w-2xl px-5 pt-7 sm:pt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-gradient text-base font-black text-white shadow-[var(--shadow-glow)]">
              M
            </span>
            <span className="text-lg font-bold tracking-tight text-ink">Mogged</span>
          </div>
          {!istLetzter && (
            <button
              onClick={ueberspringen}
              className="text-xs font-medium text-faint transition-colors hover:text-ink"
            >
              Überspringen
            </button>
          )}
        </div>

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-accent-gradient transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(6, fortschritt)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between">
          {SCHRITTE.map((s, i) => (
            <span
              key={s.key}
              className={cx(
                "text-[10px] font-medium tracking-wide transition-colors",
                i === schritt ? "text-accent-soft" : i < schritt ? "text-muted" : "text-faint"
              )}
            >
              {s.label}
            </span>
          ))}
        </div>
      </header>

      {/* Inhalt */}
      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-8">
        <div key={schritt} className="animate-page flex-1">
          {schritt === 0 && <Willkommen />}
          {schritt === 1 && <ZielSchritt entwurf={entwurf} set={set} setNum={setNum} />}
          {schritt === 2 && <KoerperSchritt entwurf={entwurf} set={set} setNum={setNum} />}
          {schritt === 3 && (
            <TrainingSchritt
              entwurf={entwurf}
              split={split}
              modusVon={modusVon}
              splitWaehlen={splitWaehlen}
              toggleTag={toggleTag}
              toggleModus={toggleModus}
            />
          )}
          {schritt === 4 && <ErnaehrungSchritt entwurf={entwurf} set={set} />}
          {schritt === 5 && <FertigSchritt entwurf={entwurf} plan={plan} />}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={zurueck}
            className={cx(istErster && "pointer-events-none opacity-0")}
          >
            ← Zurück
          </Button>
          {istLetzter ? (
            <Button onClick={speichern} className="px-6 py-2.5">
              Los geht’s 🚀
            </Button>
          ) : (
            <Button onClick={weiter} className="px-6 py-2.5">
              Weiter →
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

// ---- Schritt 0: Willkommen ----------------------------------------------
function Willkommen() {
  return (
    <div className="flex min-h-[52vh] flex-col items-center justify-center text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-accent-gradient text-3xl font-black text-white shadow-[var(--shadow-glow)]">
        M
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Willkommen bei <span className="text-gradient">Mogged</span>
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        In vier kurzen Schritten richten wir deinen persönlichen Trainings- und
        Ernährungsplan ein. Alles lässt sich später jederzeit unter{" "}
        <span className="font-medium text-ink">Ziel &amp; Anpassung</span> ändern.
      </p>
      <div className="mt-8 grid w-full max-w-md gap-2.5 text-left">
        {[
          { icon: "🎯", t: "Dein Ziel", d: "Abnehmen, Muskeln aufbauen oder halten" },
          { icon: "🏋️", t: "Dein Trainingsplan", d: "Split, Trainingstage & Gym oder Zuhause" },
          { icon: "🥗", t: "Deine Ernährung", d: "Konzept & Fasten-Methode nach Geschmack" },
        ].map((z) => (
          <div
            key={z.t}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-surface px-4 py-3"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-lg">
              {z.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{z.t}</p>
              <p className="text-xs text-muted">{z.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Schritt 1: Ziel -----------------------------------------------------
function ZielSchritt({ entwurf, set }) {
  return (
    <div>
      <StepKopf
        nummer={1}
        titel="Was ist dein Ziel?"
        text="Danach richten sich deine Kalorien, Makros und dein Trainingsfokus."
      />
      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {Object.entries(ZIEL_MODI).map(([key, m]) => (
          <WahlKarte
            key={key}
            aktiv={entwurf.modus === key}
            onClick={() => set("modus", key)}
            titel={m.name}
            punkt={FARBEN[m.farbe]?.punkt}
          >
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{m.fokus}</p>
            <p className="mt-1 text-[11px] text-faint">
              {m.kurz} · {m.wiederholungen} Wdh.
            </p>
          </WahlKarte>
        ))}
      </div>
    </div>
  )
}

// ---- Schritt 2: Körperdaten ---------------------------------------------
function KoerperSchritt({ entwurf, set, setNum }) {
  return (
    <div>
      <StepKopf
        nummer={2}
        titel="Deine Körperdaten"
        text="Damit berechnen wir deinen Kalorienbedarf so genau wie möglich."
      />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Feld label="Geschlecht">
          <select value={entwurf.geschlecht} onChange={(e) => set("geschlecht", e.target.value)} className={inputCls}>
            <option value="m">Männlich</option>
            <option value="w">Weiblich</option>
          </select>
        </Feld>
        <Feld label="Alter">
          <input type="number" min="14" max="99" value={entwurf.alter} onChange={setNum("alter")} className={inputCls} />
        </Feld>
        <Feld label="Größe" hint="cm">
          <input type="number" min="120" max="230" value={entwurf.groesse} onChange={setNum("groesse")} className={inputCls} />
        </Feld>
        <Feld label="Gewicht" hint="kg">
          <input type="number" min="35" max="250" value={entwurf.gewicht} onChange={setNum("gewicht")} className={inputCls} />
        </Feld>
        <Feld label="Zielgewicht" hint="kg">
          <input type="number" min="35" max="250" value={entwurf.zielGewicht} onChange={setNum("zielGewicht")} className={inputCls} />
        </Feld>
        <Feld label="Deadline" hint="optional">
          <input type="date" min={heute()} value={entwurf.deadline} onChange={(e) => set("deadline", e.target.value)} className={inputCls} />
        </Feld>
        <div className="col-span-2">
          <Feld label="Wie aktiv bist du im Alltag?">
            <select value={entwurf.aktivitaet} onChange={(e) => set("aktivitaet", e.target.value)} className={inputCls}>
              {Object.entries(AKTIVITAET).map(([key, a]) => (
                <option key={key} value={key}>{a.name}</option>
              ))}
            </select>
          </Feld>
        </div>
      </div>
    </div>
  )
}

// ---- Schritt 3: Trainingsplan -------------------------------------------
function TrainingSchritt({ entwurf, split, modusVon, splitWaehlen, toggleTag, toggleModus }) {
  return (
    <div>
      <StepKopf
        nummer={3}
        titel="Wähle deinen Trainingsplan"
        text="Ein Split passend zu deiner Zeit – die Übungen füllen wir automatisch für dich."
      />

      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {Object.entries(SPLITS).map(([key, s]) => (
          <WahlKarte
            key={key}
            aktiv={entwurf.splitWahl === key}
            onClick={() => splitWaehlen(key)}
            titel={s.name}
            badge={`${s.empfohleneTage} Tage`}
          >
            <p className="mt-1 text-[11px] font-medium text-accent-soft/80">{s.kurz}</p>
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted">{s.wissenschaft}</p>
          </WahlKarte>
        ))}
      </div>

      {/* Trainingstage */}
      <div className="mt-6">
        <p className="text-xs font-medium text-muted">
          An welchen Tagen trainierst du?
          <span className="ml-2 text-faint">
            {entwurf.tageWahl.length} gewählt · empfohlen {split?.empfohleneTage}
          </span>
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {TAG_LABELS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => toggleTag(t.key)}
              className={cx(
                "min-w-11 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                entwurf.tageWahl.includes(t.key)
                  ? "border-accent/60 bg-accent/15 text-accent-soft"
                  : "border-white/10 text-faint hover:border-white/25"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gym / Calisthenics je Tag */}
      {entwurf.tageWahl.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium text-muted">
            Gym oder Zuhause? <span className="text-faint">(pro Tag umschaltbar)</span>
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {TAG_LABELS.filter((t) => entwurf.tageWahl.includes(t.key)).map((t) => {
              const heim = modusVon(t.key) === "heim"
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => toggleModus(t.key)}
                  className={cx(
                    "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                    heim
                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                      : "border-white/10 bg-surface-2 text-muted"
                  )}
                >
                  {t.label} · {heim ? "Zuhause" : "Gym"}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Schritt 4: Ernährung -----------------------------------------------
function ErnaehrungSchritt({ entwurf, set }) {
  return (
    <div>
      <StepKopf
        nummer={4}
        titel="Deine Ernährung"
        text="Wähle ein Konzept, das zu dir passt – und optional eine Fasten-Methode."
      />

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-faint">Konzept</p>
      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
        {KONZEPTE.map((k) => (
          <WahlKarte
            key={k.id}
            aktiv={entwurf.konzept === k.id}
            onClick={() => set("konzept", k.id)}
            titel={k.name}
            badge={k.kurz}
            punkt={FARBEN[k.farbe]?.punkt}
          >
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{k.idee}</p>
          </WahlKarte>
        ))}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-faint">Fasten-Methode</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {FASTEN_METHODEN.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => set("fastenMethode", m.id)}
            title={m.beschreibung}
            className={cx(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              entwurf.fastenMethode === m.id
                ? "border-transparent bg-accent-gradient text-white shadow-[var(--shadow-glow)]"
                : "border-white/10 bg-surface-2 text-muted hover:border-white/25 hover:text-ink"
            )}
          >
            {m.name}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-faint">
        {methodeVon(entwurf.fastenMethode).beschreibung}
      </p>
    </div>
  )
}

// ---- Schritt 5: Zusammenfassung -----------------------------------------
function FertigSchritt({ entwurf, plan }) {
  const modus = ZIEL_MODI[entwurf.modus]
  const split = SPLITS[entwurf.splitWahl]
  const konzept = KONZEPTE.find((k) => k.id === entwurf.konzept)
  const fasten = methodeVon(entwurf.fastenMethode)

  return (
    <div>
      <StepKopf
        eyebrow="Geschafft"
        titel="Alles bereit 🎉"
        text="Das ist dein Startpunkt. Los geht’s – du kannst alles jederzeit anpassen."
      />

      {plan && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-accent/30 bg-surface p-5 shadow-[var(--shadow-glow)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
            Dein Tagesbedarf
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-ink">
            {plan.kalorien} <span className="text-lg font-normal text-muted">kcal</span>
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              { l: "Protein", v: plan.makros.protein, f: "bg-rose-500/15 text-rose-300" },
              { l: "Fett", v: plan.makros.fett, f: "bg-amber-500/15 text-amber-300" },
              { l: "Carbs", v: plan.makros.kohlenhydrate, f: "bg-sky-500/15 text-sky-300" },
            ].map((m) => (
              <div key={m.l} className={cx("rounded-xl py-2.5", m.f)}>
                <p className="text-base font-semibold">{m.v} g</p>
                <p className="text-[10px] uppercase tracking-wide">{m.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
        <ZusammenKachel label="Ziel" wert={modus?.name} sub={modus?.kurz} />
        <ZusammenKachel
          label="Training"
          wert={split?.name}
          sub={`${entwurf.tageWahl.length || split?.empfohleneTage}× / Woche`}
        />
        <ZusammenKachel
          label="Ernährung"
          wert={konzept?.name}
          sub={fasten.id === "keins" ? "kein Fasten" : fasten.name}
        />
      </div>
    </div>
  )
}

function ZusammenKachel({ label, wert, sub }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{wert ?? "—"}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  )
}
