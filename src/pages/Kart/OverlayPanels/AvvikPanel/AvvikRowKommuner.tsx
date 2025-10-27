import { Box, Text } from "@kvib/react";
import { styled } from "styled-components";

import ToolbarButton from "pages/Kart/Toolbar/ToolbarButton";
import { AvvikRowKommunerProps } from "./avvik-utils";

const AvvikRowKommuner = ({
  kommuneParMedAvvikItem: { kommune1, kommune2, antallPunkterMedAvvik },
  handleGotoKommunePar,
}: AvvikRowKommunerProps) => {
  return (
    <Container>
      <Row>
        <Box>
          <Text fontSize={"sm"}>
            {kommune1.kommunenummer + " " + kommune1.kommunenavn} og{" "}
            {kommune2.kommunenummer + " " + kommune2.kommunenavn}
          </Text>
        </Box>
        <ButtonGroup>
          <Box>
            <Text width={"100%"} fontSize={"xs"} padding={"10px"}>
              Grenser med avvik: {antallPunkterMedAvvik}
            </Text>
          </Box>
          <ToolbarButton
            icon={"arrow_forward"}
            onClick={() => handleGotoKommunePar([kommune1.kommuneLokalID ?? "", kommune2.kommuneLokalID ?? ""])}
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
