import { VerticalLogo } from "components/Logo";
import styled from "styled-components";
import { AuthorizationStatus, useAuthorization } from "./AuthHooks";
import { ErrorBox } from "./AuthenticationErrorBox";
import { AuthenticationLoginCard } from "./AuthenticationLoginCard";
import { Page } from "components/Page";

const Authentication = () => (
  <Page>
    <Logo />
    <AuthenticationBody />
  </Page>
);

const AuthenticationBody = () => {
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

  return <AuthenticationLoginCard />;
};

const Logo = styled(VerticalLogo)`
  margin-bottom: 30px;
`;

export default Authentication;
