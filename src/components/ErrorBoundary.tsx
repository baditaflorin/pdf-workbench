import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(error, info);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <main className="app-shell">
          <section className="fatal-panel" role="alert">
            <h1>PDF Workbench hit a browser error.</h1>
            <p>{this.state.error.message}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Reload
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
