import { VerticalLogo } from "components/Logo/Logo";
import styled from "styled-components";
import {
  AuthorizationStatus,
  useAuthorization,
} from "../Authentication/AuthHooks";
import { ErrorBox } from "./LandingErrorBox";
import { LandingLoginCard } from "./LandingLoginCard";

const Landing = () => (
  <Container>
    <Logo />
    <LandingBody />
  </Container>
);

const LandingBody = () => {
  const { status } = useAuthorization();
  if (status === AuthorizationStatus.ERROR) {
    return (
      <ErrorBox
        title="En feil skjedde ved pålogging."
        text="Det skjedde en uventet feil under påloggingen. Du kan forsøke å laste siden på nytt, eller logge ut og forsøke å logge inn på nytt. Om feilen vedvarer er det fint om du tar kontakt med Kartverket."
      />
    );
  }

  if (status === AuthorizationStatus.NOT_AUTHORIZED) {
    return (
      <ErrorBox
        title="Du har ikke tilgang til å se inndelingsbasen."
        text="Vennlist kontakt Kartverket hvis du mener dette er en feil."
      />
    );
  }

  return <LandingLoginCard />;
};

const Container = styled.main`
  display: grid;
  justify-content: center;
  justify-items: center;
  align-content: start;
  grid-template-columns: 669px;
  gap: 18px 0;
  height: 100%;
  background: var(--gray_light);
  padding: 160px 20px;
`;

const Logo = styled(VerticalLogo)`
  margin-bottom: 30px;
`;

export default Landing;
