import { Button, Card, Icon, IconButton, Link, Text } from "@kvib/react";
import { Referanse } from "./OversiktReferanser";
import { styled } from "styled-components";

export const ReferanseCard = ({
  referanse,
  displayMode,
  urlMode,
  deleteRef,
}: {
  deleteRef: () => void;
  referanse: Referanse;
  displayMode: boolean;
  urlMode: boolean;
}) => {
  console.log("display mode", displayMode);
  return (
    <StyledCard>
      <Row>
        <Text colorScheme="gray" noOfLines={1} textOverflow="clip">
          {referanse?.beskrivelse}
        </Text>
        {urlMode && displayMode && <Link href={referanse?.beskrivelse} />}
        {!displayMode && (
          <IconButton
            aria-label="Slett referanse"
            colorScheme="red"
            icon="delete"
            size="md"
            variant="tertiary"
            onClick={() => deleteRef()}
          />
        )}
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
