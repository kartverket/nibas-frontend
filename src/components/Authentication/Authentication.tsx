import { Logo } from "@kvib/react";
import ActionCard from "components/ActionCard";
import { Page } from "components/Page";
import PrivacyFooter from "pages/Landing/PrivacyFooter";
import { styled } from "styled-components";
import { ErrorBox } from "./AuthenticationErrorBox";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { useOutlet } from "react-router-dom";
import Providers from "pages/App/Providers";

export const AuthenticationWrapper = () => {
  const outlet = useOutlet();
  return (
    <Providers>
      <AuthenticationPage>
        <Logo />
        {outlet}
        <PrivacyFooter />
      </AuthenticationPage>
    </Providers>
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

export const AuthNotAuthorized = () => (
  <ErrorBox
    title="Du har ikke tilgang til inndelingsbasen. "
    text="Vennligst kontakt Kartverket dersom du mener dette er en feil."
  />
);

export const AuthError = () => (
  <ErrorBox
    title="Påloggingen feilet"
    text="En uventet feil skjedde under påloggingen. Oppdater siden og prøv å logge inn på nytt. Dersom feilen vedvarer, ta kontakt med Kartverket."
  />
);

const AuthenticationPage = styled(Page)`
  gap: 48px;
`;
