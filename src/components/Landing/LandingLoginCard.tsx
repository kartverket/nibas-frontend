import styled from "styled-components";
import Icon from "../Icon/Icon";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import { Outline } from "style/mixins";

export const LandingLoginCard = () => {
  const { handleAuthenticateFunc } = useAuthenticationFlow();
  const { t } = useTranslation();

  return (
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
  );
};

const Card = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  position: relative;
  width: 100%;
  padding: 42px;
  border: 0;
  background: var(--blue_dark);
  color: var(--white);
  box-shadow: 0 3px 19px 0 rgba(0, 0, 0, 0.06);
  transition: background 0.1s;
  cursor: pointer;

  &:hover {
    background-color: var(--blue);
  }

  &:focus {
    ${Outline}
  }
`;

const Arrow = styled(Icon).attrs({ icon: "arrow_forward_ios" })`
  transition: transform 0.1s;

  ${Card}:hover & {
    transform: translateX(5px);
  }
`;

const CardHeading = styled.h2`
  margin: 0 0 0.5rem 0;
`;

const CardParagraph = styled.p`
  margin: 0;
  font-size: 14px;
`;
