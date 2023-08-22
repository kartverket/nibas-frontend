import { styled } from "styled-components";
import { Endring } from "./hooks/utkastEndringerTypes";
import { Heading, Icon } from "@kvib/react";

export const EndringSection = styled.section`
  &:not(:last-of-type) {
    margin-bottom: 40px;
  }
`;

export const Underoverskrift = styled.h3`
  font-weight: 300;
  font-size: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: var(--kvib-colors-gray-50);
  border-radius: 8px;
`;

export const Seksjonsoverskrift = styled(Heading).attrs({
  as: "h3",
  size: "sm",
})`
  font-weight: bold;
  margin: 10px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--kvib-colors-gray-50);
`;

export const EndringsradListItem = styled.li`
  display: flex;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--kvib-colors-gray-50);
`;

export const EndringsradLabel = styled.div`
  flex: 2;
`;

export const EndringsradEndring = styled.div`
  flex: 3;
`;

type EndringsradProps = {
  tittel: string;
  endring: Endring;
};

export const Endringsrad = ({ tittel, endring }: EndringsradProps) => (
  <EndringsradListItem>
    <EndringsradLabel>{tittel}</EndringsradLabel>
    <EndringsradEndring>
      <EndringFraTil endring={endring} />
    </EndringsradEndring>
  </EndringsradListItem>
);

export const EndringstypeTag = styled.span`
  background-color: var(--kvib-colors-blue-50);
  padding: 8px 16px;
  margin: 0 16px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 12px;
  color: var(--kvib-colors-blue-500);
`;

type EndringFraTilProps = {
  endring: Endring;
};

const EndringFraTil = ({ endring }: EndringFraTilProps) => (
  <>
    <TekstEllerTom tekst={endring.fra} />
    <RightArrow icon="arrow_right_alt" />
    <TekstEllerTom tekst={endring.til} bold={true} />
  </>
);

type TekstEllerTomProps = {
  tekst: string | null;
  bold?: boolean;
};

const TekstEllerTom = ({ tekst, bold = false }: TekstEllerTomProps) => {
  if (tekst == null || tekst.trim() === "") {
    return <KursivTekst bold={bold}>(tom)</KursivTekst>;
  }
  return <EndringTekst bold={bold}>{tekst.trim()}</EndringTekst>;
};

export const EndringTekst = styled.span<{ bold: boolean }>`
  font-weight: ${({ bold }) => (bold ? "900" : "300")};
  white-space: nowrap;
  margin-right: 8px;
`;

const KursivTekst = styled(EndringTekst)`
  font-style: italic;
`;

const RightArrow = styled(Icon)`
  color: var(--kvib-colors-blue-500);
  font-size: 20px;
  margin: 0 8px 0 0;
  vertical-align: middle;
`;
