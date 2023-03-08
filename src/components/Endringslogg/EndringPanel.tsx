import styled from "styled-components";
import { UnstyledList } from "components/UnstyledList";
import { Panel, PanelHeading } from "./EndringsloggStyles";
import Icon from "../Icon";

type EndringPanelProps = {
  tittel: string;
  endringer: {
    fra: string;
    til: string;
  }[];
};

export const EndringPanel = ({ tittel, endringer }: EndringPanelProps) => {
  if (endringer.length === 0) {
    return null;
  }

  return (
    <Panel>
      <PanelHeading>{tittel}</PanelHeading>
      <UnstyledList>
        {endringer.map(({ fra, til }, index) => (
          <EndringListItem key={index}>
            <>
              <TekstEllerTom tekst={fra} />
              <RightArrow />
              <TekstEllerTom tekst={til} />
            </>
          </EndringListItem>
        ))}
      </UnstyledList>
    </Panel>
  );
};

type GrenseEndringerPanelProps = {
  tittel: string;
  endringer: string[];
};

export const GrenseEndringerPanel = ({
  tittel,
  endringer,
}: GrenseEndringerPanelProps) => {
  if (endringer.length === 0) {
    return null;
  }

  return (
    <Panel>
      <PanelHeading>{tittel}</PanelHeading>
      <UnstyledList>
        {endringer.map((tekst, index) => (
          <EndringListItem key={index}>
            <TekstEllerTom tekst={tekst} />
          </EndringListItem>
        ))}
      </UnstyledList>
    </Panel>
  );
};

type TekstEllerTomProps = {
  tekst: string;
};

const TekstEllerTom = ({ tekst }: TekstEllerTomProps) => {
  if (tekst.trim() === "") {
    return <KursivTekst>(tom)</KursivTekst>;
  }
  return <span>{tekst.trim()}</span>;
};

const KursivTekst = styled.span`
  font-style: italic;
`;

const EndringListItem = styled.li`
  margin: 12px 0;
  font-size: 20px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const RightArrow = styled(Icon).attrs(() => ({ icon: "arrow_right_alt" }))`
  color: var(--blue);
  margin: 0 8px;
`;
