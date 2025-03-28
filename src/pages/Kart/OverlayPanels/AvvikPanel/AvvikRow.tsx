import { Box, Text } from "@kvib/react";
import { styled } from "styled-components";
import { KommunerMedAvvikIContent } from "./Avvik";

import ToolbarButton from "pages/Kart/Toolbar/ToolbarButton";
interface Props {
  kommuner: KommunerMedAvvikIContent[];
  antallKoordinaterMedAvvik: number;
  avvikId: number;
  koordinatAvvikNibas: number[];
  goToCoordinates: (coordinates: number[]) => void;
}

const AvvikRow = ({ avvikId, kommuner, antallKoordinaterMedAvvik, koordinatAvvikNibas, goToCoordinates }: Props) => {
  return (
    <Container>
      <Row>
        <Box>
          {kommuner.map((kommune, index) => (
            <Text key={index} fontSize={"sm"}>
              {kommune.kommunenummer} - {kommune.kommunenavn ? kommune.kommunenavn : "-"}
            </Text>
          ))}
        </Box>

        <ButtonGroup>
          <InfoGroup>
            <Box>
              <Text fontSize={"xs"}>Punkter: {antallKoordinaterMedAvvik}</Text>
            </Box>
            <Box>
              <Text fontSize={"xs"}>{"ID: " + avvikId}</Text>
            </Box>
          </InfoGroup>
          <ToolbarButton
            icon={"find_in_page"}
            onClick={() => goToCoordinates(koordinatAvvikNibas)}
            aria-label={"Panorer til avvik"}
            tooltip={{
              text: "Panorer til avvik",
            }}
          />
          <ToolbarButton
            icon={"check_box"}
            iconFill
            colorScheme="blue"
            onClick={() => goToCoordinates(koordinatAvvikNibas)}
            aria-label={"Avvik rettet"}
            tooltip={{
              text: "Avvik rettet",
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
  padding: 8px 0;
  gap: var(--kvib-spacing-12);
  width: 100%;
`;
const InfoGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
  padding: 8px;
`;
const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

export default AvvikRow;
