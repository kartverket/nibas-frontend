import { styled } from "styled-components";
import { Flex, Icon, Logo, Text } from "@kvib/react";
import { useAuthentication } from "components/Authentication/useAuthentication";

const LandingHeader = () => {
  const { name } = useAuthentication();

  return (
    <Container>
      <Section>
        <Logo variant="horizontal" size={148} />
      </Section>
      {name != null && (
        <Flex gap={4} alignItems="center">
          <Flex gap="6px" alignItems="center">
            <LoginIcon icon="person" isFilled />
            <Text fontSize={16}>{name}</Text>
          </Flex>
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
