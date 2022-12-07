import { VerticalLogo } from "components/Logo/Logo";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  if (status === AuthorizationStatus.ERROR) {
    return (
      <ErrorBox
        title={t("auth.feil.generellFeilTittel")}
        text={t("auth.feil.generellFeilTekst")}
      />
    );
  }

  if (status === AuthorizationStatus.NOT_AUTHORIZED) {
    return (
      <ErrorBox
        title={t("auth.feil.ikkeAutorisertTittel")}
        text={t("auth.feil.ikkeAutorisertTekst")}
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
