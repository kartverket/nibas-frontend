import Icon from "components/Icon";
import { VerticalLogo } from "components/Logo/Logo";
import styled from "styled-components";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import Button from "components/form/Button";

const Landing = () => {
  const { handleAuthenticateFunc } = useAuthenticationFlow();
  const { t } = useTranslation();

  return (
    <Container>
      <Logo />
      <Card onClick={() => handleAuthenticateFunc("/")}>
        <div>
          <CardHeading>
            {t("auth.Logg inn i Nasjonal inndelingsbase")}
          </CardHeading>
          <CardParagraph>
            {t(
              "auth.Denne tjenesten er kun tilgjengelig for autoriserte brukere"
            )}
          </CardParagraph>
        </div>
        <Arrow />
      </Card>
    </Container>
  );
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

const Card = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100%;
  padding: 42px;
  border: 0;
  background: var(--blue_dark);
  box-shadow: 0px 3px 19px 0px rgba(0, 0, 0, 0.06);
  transition: border 0.1s;
  cursor: pointer;

  &:hover {
    background-color: var(--blue);
  }

  &:focus {
    box-shadow: 0 0 0 3px var(--white), 0 0 0 6px var(--blue_dark);
  }
`;

const Arrow = styled(Icon).attrs({ icon: "arrow_forward_ios" })`
  color: var(--white);
  transition: transform 0.1s;

  ${Card}:hover & {
    transform: translateX(5px);
  }
`;

const CardHeading = styled.h2`
  margin: 0 0 0.25em;
  color: var(--white);
`;

const CardParagraph = styled.p`
  margin: 0.25em 0 0;
  color: var(--white);
  padding-left: 0.5em;
`;

export default Landing;
