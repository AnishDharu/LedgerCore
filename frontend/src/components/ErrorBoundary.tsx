import { Component, type ReactNode } from 'react'

interface State { failed: boolean }

/** Last line of defence: a render crash shows a recoverable message instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }
  static getDerivedStateFromError(): State { return { failed: true } }
  componentDidCatch(error: unknown) { console.error('Unhandled UI error', error) }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="crash" role="alert">
        <h1>Something went wrong</h1>
        <p className="muted">This page couldn’t be displayed. Your money and data are safe. Reload to try again.</p>
        <button className="btn btn-primary" onClick={() => location.reload()}>Reload the page</button>
      </div>
    )
  }
}
