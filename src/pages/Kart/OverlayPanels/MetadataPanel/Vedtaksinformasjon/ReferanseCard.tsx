import { Card, Icon, Link, Text } from "@kvib/react";
import { Referanse } from "./OversiktReferanser";
import styled from "styled-components";

export const ReferanseCard = ({
  referanse,
  displayMode,
  urlMode,
}: {
  referanse: Referanse;
  displayMode: boolean;
  urlMode: boolean;
}) => {
  // TODO: Hvorfor er referanse.beskrivelse undefined når man legger til noe?
  return (
    <StyledCard>
      <Row>
        <Text colorScheme="gray" noOfLines={1} textOverflow="clip">
          {referanse?.beskrivelse}
        </Text>
        {urlMode && <Link href={referanse?.beskrivelse} />}
      </Row>
    </StyledCard>
  );
};

const StyledCard = styled(Card)`
  padding: 10px;
  margin-bottom: 5px;
  width: 100%;
`;
const Row = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: space-between;
  padding: 5px 10px 5px 10px;
`;
