import { styled } from "styled-components";
import { Button, MaterialSymbol } from "@kvib/react";
import { Kretstype } from "contexts/InndelingerContekst/InndelingerContext";

type Props = {
  kretstype: Kretstype | null;
  isActive: boolean;
  onClick: () => void;
  rightIcon: MaterialSymbol;
  children: React.ReactNode;
};

// TODO: Dette er et abstraksjonslag for å deale med det at vi henter data på forskjellige måter
// endepunkter bør refaktoreres slik at dette kan være én felles komponent i stedet
const Inndeling = (props: Props) => {
  if (props.kretstype === "fylker") return <Fylke {...props} />;
  if (props.kretstype === "kommuner") return <Kommune {...props} />;
  if (props.kretstype === "stemmekretser") return <Stemmekrets {...props} />;
  if (props.kretstype === "grunnkretser") return <Grunnkrets {...props} />;
  return <Container {...props}>{props.children}</Container>;
};

const Fylke = (props: Props) => {
  return <Container {...props}>{props.children}</Container>;
};
const Kommune = (props: Props) => {
  return <Container {...props}>{props.children}</Container>;
};

const Stemmekrets = (props: Props) => {
  return <Container {...props}>{props.children}</Container>;
};
const Grunnkrets = (props: Props) => {
  return <Container {...props}>{props.children}</Container>;
};

export default Inndeling;

const Container = styled(Button).attrs({
  variant: "ghost",
})`
  height: unset;
  padding: 24px 16px;
  color: var(--kvib-colors-black);
  font-weight: var(--kvib-fontWeights-normal);

  & > div {
    width: 100%;
    justify-content: space-between;
  }

  &[data-active] {
    background: var(--kvib-colors-blue-50);
  }
`;
