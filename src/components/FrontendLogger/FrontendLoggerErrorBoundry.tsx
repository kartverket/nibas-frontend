import React from "react";
import { Outlet } from "react-router";
import frontendLogger from "./FrontendLogger";
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Logo } from "@kvib/react";
import { styled } from "styled-components";
import ThirdPartyProviders from "pages/App/ThirdPartyProviders";

type ErrorState = {
  hasError: boolean;
};

type Props = {
  authToken: string | null | undefined;
};

export class ErrorBoundaryWithFrontendLogger extends React.Component<Props, ErrorState> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    frontendLogger.error(error.message, error, this.props.authToken);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ThirdPartyProviders>
          <ErrorContainer>
            <LogoContainer>
              <Logo variant="vertical" size={128} />
            </LogoContainer>

            <AlertWithMaxSize status="error">
              <AlertIcon />
              <Box>
                <AlertTitle>En ukjent feil har oppstått</AlertTitle>
                <AlertDescription>
                  Noe gikk galt med siden, men vi vet ikke hvorfor. Kontakt oss om feilen vedvarer. Kontaktinformasjon
                  finnes i{" "}
                  <UnderlinedLink href="https://kartverket.atlassian.net/wiki/spaces/NIBAS/pages/685342721/Brukerveiledning">
                    brukerveiledningen.
                  </UnderlinedLink>
                </AlertDescription>
              </Box>
            </AlertWithMaxSize>
          </ErrorContainer>
        </ThirdPartyProviders>
      );
    }
    return <Outlet />;
  }
}

const UnderlinedLink = styled.a`
  border-bottom: 1px solid;
`;

const AlertWithMaxSize = styled(Alert)`
  max-width: 800px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 100vh;
  background: var(--kvib-colors-gray-50);
`;

const LogoContainer = styled.div`
  margin-top: 128px;
  margin-bottom: 48px;
`;
