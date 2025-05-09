import { styled } from "styled-components";
import { Button, Flex, Icon, Logo, Text } from "@kvib/react";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { isAuthEnabled } from "components/Authentication/useAuthenticationConfig";

const LandingHeader = () => {
  const { isAuthenticated, signOut, userId } = useAuthentication();
  const maskedUserId = isAuthEnabled() ? userId?.substring(0, 6) : userId;

  return (
    <Container>
      <Section>
        <Logo variant="horizontal" size={148} />
      </Section>
      {isAuthenticated && (
        <Flex gap={4} alignItems="center">
          <Flex gap="6px" alignItems="center">
            <LoginIcon icon="person" isFilled />
            <Text fontSize={16}>{maskedUserId}</Text>
          </Flex>
          <Button variant="tertiary" aria-label="Logg ut" leftIcon="logout" onClick={signOut}>
            Logg ut
          </Button>
        </Flex>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  padding: 24px 120px;
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
