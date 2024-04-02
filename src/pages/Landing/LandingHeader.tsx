import { styled } from "styled-components";
import { Button, Icon, Logo, Text } from "@kvib/react";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { isAuthEnabled } from "components/Authentication/AuthenticationConfig";

const LandingHeader = () => {
  const { isAuthenticated, signOut, userId } = useAuthentication();
  const maskedUserId = isAuthEnabled() ? userId?.substring(0, 6) + "*****" : userId;

  return (
    <Container>
      <Section>
        <Logo variant="horizontal" size={128} />
      </Section>
      {isAuthenticated && (
        <Section>
          <LoginIcon icon="person" isFilled />
          <Text as="b">{maskedUserId}</Text>
          <Button variant="tertiary" aria-label="Logg ut" leftIcon="logout" onClick={signOut}>
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
  background: var(--kvib-colors-white);
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
