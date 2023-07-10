import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Heading, Text } from "@kvib/react";
import Icon from "components/Icon";
import { LogoOnly } from "components/Logo";
import AuthenticationButton from "pages/Landing/AuthenticationButton";
import styled from "styled-components";

const LandingHeader = () => {
  const { tokenHolderFunc } = useAuthenticationFlow();

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
      <Section>
        <LoginIcon icon="person" filled />
        <div>
          <Text>Logget inn som</Text>
          <Text as="b">{`${tokenHolderFunc()?.personId}`}</Text>
        </div>
        <AuthenticationButton />
      </Section>
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
