import { Card, IconButton, Text } from "@kvib/react";
import { FormViewState, Referanse } from "./Vedtaksinformasjon";
import { styled } from "styled-components";

type Props = {
  deleteRef: () => void;
  referanse: Referanse;
  urlMode: boolean;
  formViewState: FormViewState;
};

export const ReferanseCard = ({ referanse, urlMode, deleteRef, formViewState }: Props) => {
  return (
    <StyledCard>
      <Row>
        <Text colorScheme="gray" noOfLines={2} maxWidth="320px">
          {referanse?.beskrivelse}
        </Text>
        {urlMode && formViewState === "viewing" && (
          <a href={referanse?.beskrivelse} rel="noreferrer" target="_blank">
            <IconButton
              aria-label={`Åpne nettadressen ${referanse.beskrivelse} i et nytt vindu.`}
              icon="open_in_new"
              variant="tertiary"
            />
          </a>
        )}
        {formViewState !== "viewing" && (
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
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  padding: 5px;
  margin-bottom: 5px;
  width: 100%;
  min-height: 60px;
`;
const Row = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  flex-direction: row;
  justify-content: space-between;
  padding: 5px 10px 5px 10px;
`;
