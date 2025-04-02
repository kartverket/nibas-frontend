import { Box, Text } from "@kvib/react";
import { styled } from "styled-components";

import ToolbarButton from "pages/Kart/Toolbar/ToolbarButton";
import { KommunerMedAvvik } from "./avvik-utils";
interface Props {
  kommuneMedAvvikItem: KommunerMedAvvik;
  handleGoToKommuneClick: (fylkeId: string, kommuneId: string, kommuneNavn: string, kommuneNummer: string) => void;
}

const AvvikRowKommuner = ({
  kommuneMedAvvikItem: { kommuneNavn, kommuneNummer, kommuneLokalID, fylkesLokalID, antallAvvik },
  handleGoToKommuneClick,
}: Props) => {
  return (
    <Container>
      <Row>
        <Box>
          <Text fontSize={"sm"}>{kommuneNummer + " " + kommuneNavn}</Text>
        </Box>
        <ButtonGroup>
          <Box>
            <Text width={"100%"} fontSize={"xs"} padding={"10px"}>
              Grenser med avvik: {antallAvvik}
            </Text>
          </Box>
          <ToolbarButton
            icon={"arrow_forward"}
            onClick={() => handleGoToKommuneClick(fylkesLokalID, kommuneLokalID, kommuneNavn, kommuneNummer)}
            aria-label={"Åpne inndeling med avvik"}
            tooltip={{
              text: "Åpne inndeling med avvik",
            }}
          />
        </ButtonGroup>
      </Row>
    </Container>
  );
};
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--kvib-space-2);
  width: 100%;
`;
const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export default AvvikRowKommuner;
