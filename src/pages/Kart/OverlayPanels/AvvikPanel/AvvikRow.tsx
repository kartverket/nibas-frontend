import { Box, Stack, Text, useToast } from "@kvib/react";
import { styled } from "styled-components";
import { AvvikForKommune } from "./avvik-utils";
import ToolbarButton from "pages/Kart/Toolbar/ToolbarButton";
import { useState } from "react";

interface Props {
  avvikItem: AvvikForKommune;
  handleGoToCoordinatesAndFetchMatrikkel: (coordinates: number[]) => Promise<boolean>;
  selectedAvvikId: number | null;
  setSelectedAvvikId: (avvikId: number | null) => void;
  onRemoveRow: (avvikId: number) => void;
  updateStatusForAvvik: (avvikId: number, status: string) => Promise<boolean>;
}

interface RowProps {
  $active: boolean;
}

const AvvikRow = ({
  avvikItem,
  handleGoToCoordinatesAndFetchMatrikkel,
  selectedAvvikId,
  setSelectedAvvikId,
  onRemoveRow,
  updateStatusForAvvik,
}: Props) => {
  const toast = useToast();
  const [isRemoving, setIsRemoving] = useState(false);
  const koordinaterAvvikNibas = avvikItem.koordinaterMedAvvik.map((k) => k.nibasKoordinat.coordinates);
  const goToCoordinatesAndGetMatrikkelFeatures = async (coordinates: number[]) => {
    const success = await handleGoToCoordinatesAndFetchMatrikkel(coordinates);

    if (!success) {
      toast({
        status: "error",
        title: "Fikk ikke panorert til avvik eller hentet teiggrenser",
      });
    }
  };
  // TODO: implementer statusendring mot backend
  const handleStatusEndring = async (status: string) => {
    const success = await updateStatusForAvvik(avvikItem.id, status);
    if (success) {
      toast({
        status: "success",
        title: "Avvik rettet",
      });
      setIsRemoving(true);
      setTimeout(() => {
        onRemoveRow(avvikItem.id);
      }, 500);
    }
  };
  const isActive = selectedAvvikId === avvikItem.id;
  return (
    <Container>
      <Row $active={isActive} $removing={isRemoving}>
        <Stack spacing="1">
          {avvikItem.kommuner.map((kommune, index) => (
            <Text key={index} fontSize={"sm"}>
              {kommune.kommunenummer} - {kommune.kommunenavn ?? "-"}
            </Text>
          ))}
        </Stack>
        <ButtonGroup>
          <InfoGroup>
            <Box>
              <Text fontSize={"xs"}>Punkter: {avvikItem.antallKoordinaterMedAvvik}</Text>
            </Box>
            <Box>
              <Text fontSize={"xs"}>{"ID: " + avvikItem.id}</Text>
            </Box>
          </InfoGroup>
          <ToolbarButton
            icon={"find_in_page"}
            onClick={() => {
              goToCoordinatesAndGetMatrikkelFeatures(koordinaterAvvikNibas[0]);
              setSelectedAvvikId(avvikItem.id);
            }}
            aria-label={"Panorer til avvik"}
            tooltip={{
              text: "Panorer til avvik",
            }}
          />
          <ToolbarButton
            icon={"check_box"}
            iconFill
            colorScheme="blue"
            onClick={() => handleStatusEndring(avvikItem.status)}
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

const Row = styled.div<RowProps & { $removing: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--kvib-space-2) var(--kvib-space-2);
  gap: var(--kvib-spacing-12);
  width: 100%;
  background-color: ${({ $active, $removing }) =>
    $removing ? "var(--kvib-colors-green-100)" : $active ? "var(--kvib-colors-gray-50)" : "transparent"};
  transition:
    background-color 0.3s ease,
    transform 0.5s ease;
  transform: ${({ $removing }) => ($removing ? "translateX(100%)" : "translateX(0)")};
`;
const InfoGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--kvib-space-4);
  padding: var(--kvib-space-3);
`;
const ButtonGroup = styled.div`
  display: flex;
  gap: var(--kvib-space-1);
  margin-top: var(--kvib-space-1);
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export default AvvikRow;
