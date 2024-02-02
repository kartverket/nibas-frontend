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
    <CardWrapper>
      <Card>
        <Row>
          <Text>{referanse?.beskrivelse}</Text>
          {urlMode && (
            <Link href={referanse?.beskrivelse}>
              <Icon icon="open_in_new" />
            </Link>
          )}
        </Row>
      </Card>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  margin-bottom: 5px;
  width: 100%;
`;
const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 5px 10px 5px 10px;
`;
