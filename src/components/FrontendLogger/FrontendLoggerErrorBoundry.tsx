import React from "react";
import { Outlet } from "react-router";
import frontendLogger from "./FrontendLogger";

type ErrorState = {
  hasError: boolean;
};

export class ErrorBoundaryWithFrontendLogger extends React.Component<
  unknown,
  ErrorState
> {
  constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    frontendLogger.error(error.message, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section>
          <h1>En ukjent feil har oppstått</h1>
          <p>
            Noe gikk galt med siden, men vi vet ikke helt hvorfor. Vennligst
            oppdater siden eller send oss en melding om feilen vedvarer.
          </p>
        </section>
      );
    }
    return <Outlet />;
  }
}
