import ThirdPartyProviders from "pages/App/ThirdPartyProviders";
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Logo } from "@kvib/react";
import { styled } from "styled-components";
import { FaroErrorBoundary } from "@grafana/faro-react";
import { Outlet } from "react-router-dom";

export const FullPageErrorWithFaroErrorBoundry = () => {
  return (
    <FaroErrorBoundary fallback={<FullPageError />}>
      <Outlet />
    </FaroErrorBoundary>
  );
};

export const FullPageError = () => (
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
            Noe gikk galt med siden, men vi vet ikke hvorfor. Hvis feilen vedvarer, vennligst kontakt Kartverket.
            Kontaktinformasjon finnes i{" "}
            <UnderlinedLink href="https://kartverket.atlassian.net/wiki/spaces/NIBAS/pages/685342721/Brukerveiledning">
              brukerveiledningen.
            </UnderlinedLink>
          </AlertDescription>
        </Box>
      </AlertWithMaxSize>
    </ErrorContainer>
  </ThirdPartyProviders>
);

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
