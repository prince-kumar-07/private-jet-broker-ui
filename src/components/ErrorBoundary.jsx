import { Component } from 'react';
import { JetIcon } from './ui';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center px-5 text-center">
        <div className="card max-w-md p-8 sm:p-12">
          <JetIcon className="mx-auto h-8 w-auto text-gold" />
          <h1 className="mt-6 font-display text-3xl font-semibold">Something went wrong</h1>
          <p className="mt-3 text-white/60">This page hit an unexpected error. Reloading usually fixes it.</p>
          <button onClick={() => window.location.assign('/')} className="btn-gold mt-8">Back home</button>
        </div>
      </div>
    );
  }
}
