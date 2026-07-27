import { Component } from "react"

// Fängt Render-Fehler ab, damit ein einzelner Fehler nicht die ganze App
// weiß werden lässt. Zeigt einen freundlichen Zustand mit Neu-laden-Button.
// (Muss eine Klasse sein – Hooks können keine Fehler-Grenzen bilden.)
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { fehler: null }
  }

  static getDerivedStateFromError(fehler) {
    return { fehler }
  }

  componentDidCatch(fehler, info) {
    console.error("App-Fehler:", fehler, info)
  }

  render() {
    if (!this.state.fehler) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-6 text-center">
        <div className="max-w-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/15 text-2xl">
            ⚠️
          </div>
          <h1 className="mt-4 text-xl font-bold text-ink">Etwas ist schiefgelaufen</h1>
          <p className="mt-2 text-sm text-muted">
            Die App ist auf einen unerwarteten Fehler gestoßen. Deine Daten sind
            lokal gespeichert und bleiben erhalten.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-accent-gradient px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow)] hover:brightness-110"
          >
            Neu laden
          </button>
        </div>
      </div>
    )
  }
}
