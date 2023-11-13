import { styled } from "styled-components";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Button, Icon, Logo, Text } from "@kvib/react";

const LandingHeader = () => {
  const { isAuthenticatedFunc, handleLogoutFunc, tokenHolderFunc } =
    useAuthenticationFlow();

  const personId = tokenHolderFunc()?.personId;

  return (
    <Container>
      <Section>
        <Logo variant="horizontal" size={128} />
      </Section>
      {isAuthenticatedFunc() && (
        <Section>
          <LoginIcon icon="person" isFilled />
          {personId && (
            <div>
              <Text>Logget inn som</Text>
              <Text as="b">{personId.substring(0, 6) + "*****"}</Text>
            </div>
          )}
          <Button
            variant="secondary"
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
