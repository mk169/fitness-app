// Gemeinsame Präsentations-Bausteine für das dunkle, edle Design.
// Rein optisch – keine Logik. Wird von allen Seiten genutzt, damit Karten,
// Buttons, Eingaben und Abschnitte überall konsistent aussehen.

export function cx(...teile) {
  return teile.filter(Boolean).join(" ")
}

// Geteilte Klassen-Strings ------------------------------------------------
export const cardCls =
  "rounded-2xl border border-[color:var(--ov-06)] bg-surface shadow-[var(--shadow-card)]"

export const inputCls =
  "w-full rounded-lg border border-[color:var(--ov-10)] bg-surface-2 px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/30"

export const labelCls = "flex flex-col gap-1 text-xs font-medium text-muted"

// Karte -------------------------------------------------------------------
export function Card({ className, as: Comp = "div", ...rest }) {
  return <Comp className={cx(cardCls, className)} {...rest} />
}

// Abschnitts-Überschrift (ehem. uppercase-Label) --------------------------
export function SectionTitle({ children, className, right }) {
  return (
    <div className={cx("flex items-center justify-between gap-2", className)}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
        {children}
      </h2>
      {right}
    </div>
  )
}

// Klickbarer Abschnitts-Kopf mit Pfeil (Dashboard) ------------------------
export function SectionLink({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint transition-colors hover:text-ink"
    >
      {children}
      <span className="text-accent/70 transition-transform group-hover:translate-x-0.5">→</span>
    </button>
  )
}

// Seitenkopf --------------------------------------------------------------
export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[1.7rem]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

// Button ------------------------------------------------------------------
const buttonVarianten = {
  primary:
    "bg-accent-gradient text-white shadow-[var(--shadow-glow)] hover:brightness-110",
  subtle:
    "border border-[color:var(--ov-10)] bg-surface-2 text-ink hover:border-[color:var(--ov-25)]",
  ghost: "text-muted hover:text-ink",
}

export function Button({ variant = "primary", className, as: Comp = "button", ...rest }) {
  return (
    <Comp
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50",
        buttonVarianten[variant],
        className
      )}
      {...rest}
    />
  )
}

// Pille / Umschalter ------------------------------------------------------
export function Pill({ active, className, ...rest }) {
  return (
    <button
      className={cx(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-transparent bg-accent-gradient text-white shadow-[var(--shadow-glow)]"
          : "border-[color:var(--ov-10)] bg-surface-2 text-muted hover:border-[color:var(--ov-25)] hover:text-ink",
        className
      )}
      {...rest}
    />
  )
}

// Kennzahl ----------------------------------------------------------------
export function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-faint">{label}</p>
      <p className="mt-0.5 font-semibold text-ink">{value}</p>
    </div>
  )
}

// Icon-Set (Inline-SVG, keine Dependency) ---------------------------------
function Svg({ children, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const icons = {
  dashboard: (c) => (
    <Svg className={c}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Svg>
  ),
  training: (c) => (
    <Svg className={c}>
      <path d="M6.5 6.5l11 11" />
      <path d="M4 9l-1.5-1.5M4 9l2 2M4 9l1.5 1.5M4 9L5.5 7.5" />
      <path d="M20 15l1.5 1.5M20 15l-2-2M20 15l-1.5-1.5M20 15l1.5 1.5" />
      <rect x="3.2" y="6.8" width="4" height="4" rx="1" transform="rotate(45 5.2 8.8)" />
      <rect x="16.8" y="13.2" width="4" height="4" rx="1" transform="rotate(45 18.8 15.2)" />
    </Svg>
  ),
  ernaehrung: (c) => (
    <Svg className={c}>
      <path d="M12 8c-1.5-2.5-5-3-6.5-.5C4 10 5.5 15 8 18c1.2 1.4 2.5 2 4 2s2.8-.6 4-2c2.5-3 4-8 2.5-10.5C17 4.5 13.5 5.5 12 8z" />
      <path d="M12 8c.2-1.8 1.3-3.2 3-3.8" />
    </Svg>
  ),
  kalender: (c) => (
    <Svg className={c}>
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </Svg>
  ),
  ziel: (c) => (
    <Svg className={c}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </Svg>
  ),
  logout: (c) => (
    <Svg className={c}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 12H3m0 0l3.5-3.5M3 12l3.5 3.5" />
    </Svg>
  ),
  einstellungen: (c) => (
    <Svg className={c}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  ),
}
