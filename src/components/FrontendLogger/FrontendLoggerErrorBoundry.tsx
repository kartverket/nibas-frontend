import React from "react";
import { Outlet } from "react-router";
import frontendLogger from "./FrontendLogger";
import { Card, Heading, Logo, Text } from "@kvib/react";
import { styled } from "styled-components";
import ThirdPartyProviders from "pages/App/ThirdPartyProviders";

type ErrorState = {
  hasError: boolean;
};

export class ErrorBoundaryWithFrontendLogger extends React.Component<
  unknown,
  ErrorState
> {
  constructor(props: unknown) {
    super(props);
    this.state = { hasError: true };
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
        <ThirdPartyProviders>
          <ErrorContainer>
            <LogoContainer>
              <Logo variant="vertical" size={128} />
            </LogoContainer>
            <FeilCard>
              <Heading as="h2" size="lg" mb="32px">
                En ukjent feil har oppstått
              </Heading>
              <Text fontSize="lg">
                Noe gikk galt med siden, men vi vet ikke helt hvorfor.
              </Text>
              <Text fontSize="lg">
                Vennligst oppdater siden eller send oss en melding om feilen
                vedvarer.
              </Text>
            </FeilCard>
          </ErrorContainer>
        </ThirdPartyProviders>
      );
    }
    return <Outlet />;
  }
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  min-height: 100vh;
  background: var(--kvib-colors-gray-50);
`;

const LogoContainer = styled.div`
  margin-top: 180px;
  margin-bottom: 80px;
`;

const FeilCard = styled(Card)`
  text-align: center;
  padding: 50px;
  max-width: 800px;
`;
