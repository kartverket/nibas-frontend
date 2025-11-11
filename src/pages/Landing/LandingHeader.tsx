import { Button, Flex, Icon, Logo, Text } from "@kvib/react";
import { useAuthentication } from "components/Authentication/useAuthentication";
import { styled } from "styled-components";

const LandingHeader = () => {
  const { username, signOut } = useAuthentication();

  return (
    <Container>
      <Section>
        <Logo variant="horizontal" size={148} />
      </Section>
      {username != null && username !== "localhost" && (
        <Flex gap={4} alignItems="center">
          <Flex gap="6px" alignItems="center">
            <LoginIcon icon="person" isFilled />
            <Text fontSize={16}>{username}</Text>
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
