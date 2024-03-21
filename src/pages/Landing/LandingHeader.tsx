import { styled } from "styled-components";
import { Button, Icon, Logo, Text } from "@kvib/react";
import { useAuthentication } from "components/Authentication/AuthenticationHook";

const LandingHeader = () => {
  const { isAuthenticated, signOut, userId } = useAuthentication();

  return (
    <Container>
      <Section>
        <Logo variant="horizontal" size={128} />
      </Section>
      {isAuthenticated && (
        <Section>
          <LoginIcon icon="person" isFilled />
          {userId != null && <Text as="b">{userId.substring(0, 6) + "*****"}</Text>}
          <Button variant="secondary" aria-label="Logg ut" leftIcon="logout" onClick={signOut}>
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
