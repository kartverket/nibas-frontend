import styled from "styled-components";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Outline } from "style/mixins";
import Icon from "components/Icon";

export const AuthenticationLoginCard = () => {
  const { handleAuthenticateFunc } = useAuthenticationFlow();

  return (
    <Card onClick={() => handleAuthenticateFunc("/")}>
      <div>
        <CardHeading>Logg inn i Nasjonal inndelingsbase</CardHeading>
        <CardParagraph>
          Denne tjenesten er kun tilgjengelig for autoriserte brukere
        </CardParagraph>
      </div>
      <Arrow icon="arrow_forward_ios" />
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
  background: var(--kvib-colors-blue-500);
  color: var(--kvib-colors-chakra-inverse-text);
  box-shadow: 0 3px 19px 0 rgba(0, 0, 0, 0.06);
  transition: background 0.1s;
  cursor: pointer;

  &:hover {
    background-color: var(--kvib-colors-blue-500);
  }

  &:focus {
    ${Outline}
  }
`;

const Arrow = styled(Icon)`
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
