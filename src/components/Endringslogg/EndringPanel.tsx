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
              <span>{fra}</span>
              <RightArrow />
              <span>{til}</span>
            </>
          </EndringListItem>
        ))}
      </UnstyledList>
    </Panel>
  );
};

const EndringListItem = styled.li`
  margin: 12px 0;
  font-size: 18px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const RightArrow = styled(Icon).attrs(() => ({ icon: "arrow_right_alt" }))`
  color: var(--blue);
  margin: 0 8px;
`;
