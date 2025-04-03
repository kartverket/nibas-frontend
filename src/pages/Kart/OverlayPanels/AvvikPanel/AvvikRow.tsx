import { Box, Button, Stack, Text, useToast } from "@kvib/react";
import { styled } from "styled-components";
import { AvvikForKommune } from "./avvik-utils";
import ToolbarButton from "pages/Kart/Toolbar/ToolbarButton";
import { useState } from "react";

interface Props {
  avvikItem: AvvikForKommune;
  handleGoToCoordinatesAndFetchMatrikkel: (coordinates: number[]) => Promise<boolean>;
  selectedAvvikId: number | null;
  setSelectedAvvikId: (avvikId: number | null) => void;
  updateStatusForAvvik: (avvikId: number, status: string) => Promise<boolean>;
  onStatusUpdated: (id: number, nyStatus: string) => void;
}

interface RowProps {
  $active: boolean;
  $removing: boolean;
  $status: string;
}

const AvvikRow = ({
  avvikItem,
  handleGoToCoordinatesAndFetchMatrikkel,
  selectedAvvikId,
  setSelectedAvvikId,
  updateStatusForAvvik,
}: Props) => {
  const toast = useToast();
  const [isRemoving, setIsRemoving] = useState(false);
  const [rowStatus, setRowStatus] = useState(avvikItem.status.toLowerCase());
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
  const handleStatusEndring = async (status: string) => {
    setIsRemoving(true);
    setRowStatus(status.toLowerCase());
    setTimeout(async () => {
      const success = await updateStatusForAvvik(avvikItem.id, status); // Lagrer ny status i databasen
      if (success) {
        setIsRemoving(false); // tilbakestill
      } else {
        toast({
          status: "error",
          title: "Fikk ikke oppdatert status på avviket",
        });
        setIsRemoving(false); // tilbakestill
      }
    }, 500); // samsvar med CSS-animasjonen
  };
  const isActive = selectedAvvikId === avvikItem?.id;
  const status = avvikItem.status?.toLowerCase();

  return (
    <Container>
      <Row $active={isActive} $removing={isRemoving} $status={rowStatus}>
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
          {status === "ny" && (
            <>
              <ToolbarButton
                icon={"find_in_page"}
                onClick={() => {
                  goToCoordinatesAndGetMatrikkelFeatures(koordinaterAvvikNibas[0]);
                  setSelectedAvvikId(avvikItem.id);
                }}
                aria-label={"Panorer til avvik"}
                tooltip={{ text: "Panorer til avvik" }}
              />
              <ToolbarButton
                icon={"schedule"}
                colorScheme="blue"
                onClick={() => handleStatusEndring("NEDPRIORITERT")}
                aria-label={"Marker som utsatt"}
                tooltip={{ text: "Marker som utsatt" }}
              />
              <ToolbarButton
                // icon={"check_box_outline_blank"}
                icon="check_box"
                iconFill
                colorScheme="blue"
                onClick={() => handleStatusEndring("FIKSET")}
                aria-label={"Marker som løst"}
                tooltip={{ text: "Marker som løst", placement: "left" }}
              />
              {/* TODO: Fikse ny knapp med tooltip */}
              {/* <Button
                colorScheme="blue"
                leftIcon="check"
                width={"12px"}
                onClick={() => handleStatusEndring("FIKSET")}
                aria-label={"Marker som løst"}
                // tooltip={{ text: "Marker som løst", placement: "left" }}
              /> */}
            </>
          )}

          {status === "fikset" && (
            <>
              <ToolbarButton
                icon={"find_in_page"}
                onClick={() => {
                  goToCoordinatesAndGetMatrikkelFeatures(koordinaterAvvikNibas[0]);
                  setSelectedAvvikId(avvikItem.id);
                }}
                aria-label={"Panorer til avvik"}
                tooltip={{ text: "Panorer til avvik" }}
              />
              <ToolbarButton
                icon={"undo"}
                iconFill
                colorScheme="red"
                onClick={() => handleStatusEndring("NY")}
                aria-label={"Marker som uløst"}
                tooltip={{ text: "Marker som uløst", placement: "left" }}
              />
            </>
          )}

          {status === "nedprioritert" && (
            <>
              <ToolbarButton
                icon={"find_in_page"}
                onClick={() => {
                  goToCoordinatesAndGetMatrikkelFeatures(koordinaterAvvikNibas[0]);
                  setSelectedAvvikId(avvikItem.id);
                }}
                aria-label={"Panorer til avvik"}
                tooltip={{ text: "Panorer til avvik" }}
              />
              <ToolbarButton
                icon={"undo"}
                iconFill
                colorScheme="red"
                onClick={() => handleStatusEndring("NY")}
                aria-label={"Marker som uløst"}
                tooltip={{ text: "Marker som uløst", placement: "left" }}
              />
              <ToolbarButton
                icon={"check_box"}
                iconFill
                colorScheme="blue"
                onClick={() => handleStatusEndring("FIKSET")}
                aria-label={"Marker som løst"}
                tooltip={{ text: "Marker som løst", placement: "left" }}
              />
            </>
          )}
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
  background-color: ${({ $active, $removing, $status }) =>
    $removing
      ? $status === "nedprioritert"
        ? "var(--kvib-colors-yellow-100)"
        : $status === "ny"
          ? "var(--kvib-colors-red-100)"
          : "var(--kvib-colors-green-100)"
      : $active
        ? "var(--kvib-colors-gray-50)"
        : "transparent"};
  transition:
    background-color 0.3s ease,
    transform 0.5s ease;
  transform: ${({ $removing, $status }) =>
    $removing
      ? $status === "ny"
        ? "translateX(-100%)" // Slider til venstre hvis status blir satt til "ny" / uløst
        : "translateX(100%)" // ellers til høyre
      : "translateX(0)"};
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
