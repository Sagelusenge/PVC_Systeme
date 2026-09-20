import { Component } from "react";
import { RefreshCcw } from "lucide-react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <section className="error-state">
      <div className="error-state-icon">!</div>
      <h1>Cette page n'a pas pu s'afficher</h1>
      <p>{this.state.error.message || "Une erreur inattendue est survenue."}</p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}><RefreshCcw /> Recharger la page</button>
    </section>;
  }
}
