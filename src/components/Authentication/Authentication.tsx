import { Logo } from "@kvib/react";
import ActionCard from "components/ActionCard";
import { Page } from "components/Page";
import PrivacyFooter from "pages/Landing/PrivacyFooter";
import { styled } from "styled-components";
import { ErrorBox } from "./AuthenticationErrorBox";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { useOutlet } from "react-router-dom";

export const AuthenticationWrapper = () => {
  const outlet = useOutlet();
  return (
    <AuthenticationPage>
      <Logo />
      {outlet}
      <PrivacyFooter />
    </AuthenticationPage>
  );
};

export const AuthLogIn = () => {
  const auth = useAuthentication();

  return (
    <ActionCard
      title="Logg inn i Nasjonal inndelingsbase"
      description="Denne tjenesten er kun tilgjengelig for autoriserte brukere"
      onClick={auth.signIn}
    />
  );
};

export const AuthNotAutherized = () => (
  <ErrorBox
    title="Du har ikke tilgang til å se inndelingsbasen."
    text="Vennlist kontakt Kartverket hvis du mener dette er en feil."
  />
);

export const AuthError = () => (
  <ErrorBox
    title="En feil skjedde ved pålogging."
    text="Det skjedde en uventet feil under påloggingen. Du kan forsøke å laste siden på nytt, eller logge ut og forsøke å logge inn på nytt. Om feilen vedvarer er det fint om du tar kontakt med Kartverket."
  />
);

const AuthenticationPage = styled(Page)`
  gap: 48px;
`;
