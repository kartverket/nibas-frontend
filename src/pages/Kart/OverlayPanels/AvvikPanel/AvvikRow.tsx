import { IconButton } from "@kvib/react";
import { styled } from "styled-components";

interface Props {
  name: string;
  valueLabel?: string | null;
  tooltipLabel: string;
  isRequired?: boolean;
}

const AvvikRow = ({ name }: Props) => {
  return (
    <Container>
      <Row>
        {name}
        <IconButton icon="info" size="sm" aria-label="Panorer til avvik" />
        <IconButton icon="find_in_page" size="sm" aria-label="Sett som utført" />
      </Row>
    </Container>
  );
};

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: var(--kvib-spacing-12);
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export default AvvikRow;
