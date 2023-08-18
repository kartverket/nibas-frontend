import { styled } from "styled-components";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Button, Heading, Icon, Text } from "@kvib/react";
import { LogoOnly } from "components/Logo";

const LandingHeader = () => {
  const { isAuthenticatedFunc, handleLogoutFunc, tokenHolderFunc } =
    useAuthenticationFlow();

  return (
    <Container>
      <Section>
        <LogoOnly />
        <div>
          <Heading as="h1" size="md">
            Nasjonal inndelingsbase
          </Heading>
          <Text>En tjeneste fra Kartverket</Text>
        </div>
      </Section>
      {isAuthenticatedFunc() && (
        <Section>
          <LoginIcon icon="person" isFilled />
          <div>
            <Text>Logget inn som</Text>
            <Text as="b">{`${tokenHolderFunc()?.personId}`}</Text>
          </div>
          <Button
            variant="outline"
            aria-label="Logg ut"
            leftIcon="logout"
            onClick={handleLogoutFunc}
          >
            Logg ut
          </Button>
        </Section>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  padding: 24px 64px;
  justify-content: space-between;
`;

const Section = styled.section`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LoginIcon = styled(Icon)`
  color: var(--kvib-colors-blue-500);
`;

export default LandingHeader;
