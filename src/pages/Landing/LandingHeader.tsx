import { styled } from "styled-components";
import { Button, Flex, Icon, Logo, Text } from "@kvib/react";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { isAuthEnabled } from "components/Authentication/AuthenticationConfig";

const LandingHeader = () => {
  const { isAuthenticated, signOut, userId } = useAuthentication();
  const maskedUserId = isAuthEnabled() ? userId?.substring(0, 6) : userId;

  return (
    <Container>
      <Section>
        <Logo variant="horizontal" size={118} />
      </Section>
      {isAuthenticated && (
        <Section>
          <LoginIcon icon="person" isFilled />
          <Flex direction="column">
            <Text>Logget inn som </Text>
            <Text as="b">{maskedUserId}</Text>
          </Flex>

          <Button variant="tertiary" size="sm" aria-label="Logg ut" leftIcon="logout" onClick={signOut}>
            Logg ut
          </Button>
        </Section>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  padding: 18px 64px;
  justify-content: space-between;
  background: var(--kvib-colors-white);
  box-shadow: var(--kvib-shadows-sm);
  z-index: var(--kvib-zIndices-base);
  font-size: var(--kvib-fontSizes-sm);
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
