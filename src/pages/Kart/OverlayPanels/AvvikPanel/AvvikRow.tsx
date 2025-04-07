import { Box, Button, Stack, Text, useToast } from "@kvib/react";
import { styled } from "styled-components";
import { AvvikForKommune, AvvikStatus, KommunerIAvvik } from "./avvik-utils";
import ToolbarButton from "pages/Kart/Toolbar/ToolbarButton";
import { useState } from "react";
import CustomTooltip from "pages/Kart/Toolbar/CustomTooltip";

interface Props {
  avvikItem: AvvikForKommune;
  addInndelingForAvvik: (kommuner: KommunerIAvvik[]) => Promise<void>;
  goToCoordinatesAndFetchMatrikkel: (coordinates: number[]) => Promise<boolean>;
  selectedAvvikId: number | null; // ==> AvvikId fra parent
  setSelectedAvvikId: (avvikId: number | null) => void; // <== Setter avvikId i parent
  updateStatusForAvvik: (avvikId: number, status: string) => Promise<boolean>;
  onStatusUpdated: (id: number, nyStatus: AvvikStatus) => void;
}

interface RowProps {
  $active: boolean;
  $removing: boolean;
  $status: AvvikStatus;
}

const AvvikRow = ({
  avvikItem,
  addInndelingForAvvik,
  goToCoordinatesAndFetchMatrikkel,
  selectedAvvikId,
  setSelectedAvvikId,
  updateStatusForAvvik,
}: Props) => {
  const toast = useToast();
  const [isRemoving, setIsRemoving] = useState(false);
  const [rowStatus, setRowStatus] = useState<AvvikStatus>(avvikItem.status as AvvikStatus);
  const koordinaterAvvikNibas = avvikItem.koordinaterMedAvvik.map((k) => k.nibasKoordinat.coordinates);

  const handlePanorerBtn = async (coordinates: number[]) => {
    addInndelingForAvvik(avvikItem.kommuner);
    const success = await goToCoordinatesAndFetchMatrikkel(coordinates);

    if (!success) {
      toast({
        status: "error",
        title: "Fikk ikke panorert til avvik eller hentet teiggrenser",
      });
    }
  };
  const handleStatusEndring = async (status: AvvikStatus) => {
    setIsRemoving(true);
    setRowStatus(status);
    setTimeout(async () => {
      const success = await updateStatusForAvvik(avvikItem.id, status);
      if (success) {
        setIsRemoving(false);
      } else {
        toast({
          status: "error",
          title: "Fikk ikke oppdatert status på avviket",
        });
        setIsRemoving(false);
      }
    }, 500); // samsvar med CSS-animasjonen
  };
  const isActive = selectedAvvikId === avvikItem?.id;
  const status = avvikItem.status;

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
          {status === AvvikStatus.NY && (
            <>
              <ToolbarButton
                icon={"find_in_page"}
                onClick={() => {
                  handlePanorerBtn(koordinaterAvvikNibas[0]);
                  setSelectedAvvikId(avvikItem.id);
                }}
                aria-label={"Panorer til avvik"}
                tooltip={{ text: "Panorer til avvik" }}
              />
              <ToolbarButton
                icon={"schedule"}
                colorScheme="blue"
                onClick={() => handleStatusEndring(AvvikStatus.VENT)}
                aria-label={"Marker som utsatt"}
                tooltip={{ text: "Marker som utsatt" }}
              />
              <CustomTooltip text="Marker som løst" placement="left">
                <Button
                  colorScheme="blue"
                  leftIcon="check"
                  width={"12px"}
                  onClick={() => handleStatusEndring(AvvikStatus.FIKSET)}
                  aria-label={"Marker som løst"}
                />
              </CustomTooltip>
            </>
          )}

          {status === AvvikStatus.FIKSET && (
            <>
              <ToolbarButton
                icon={"find_in_page"}
                onClick={() => {
                  handlePanorerBtn(koordinaterAvvikNibas[0]);
                  setSelectedAvvikId(avvikItem.id);
                }}
                aria-label={"Panorer til avvik"}
                tooltip={{ text: "Panorer til avvik" }}
              />
              <ToolbarButton
                icon={"undo"}
                iconFill
                colorScheme="red"
                onClick={() => handleStatusEndring(AvvikStatus.NY)}
                aria-label={"Marker som uløst"}
                tooltip={{ text: "Marker som uløst", placement: "left" }}
              />
            </>
          )}

          {status === AvvikStatus.VENT && (
            <>
              <ToolbarButton
                icon={"find_in_page"}
                onClick={() => {
                  handlePanorerBtn(koordinaterAvvikNibas[0]);
                  setSelectedAvvikId(avvikItem.id);
                }}
                aria-label={"Panorer til avvik"}
                tooltip={{ text: "Panorer til avvik" }}
              />
              <ToolbarButton
                icon={"undo"}
                iconFill
                colorScheme="red"
                onClick={() => handleStatusEndring(AvvikStatus.NY)}
                aria-label={"Marker som uløst"}
                tooltip={{ text: "Marker som uløst", placement: "left" }}
              />
              <CustomTooltip text="Marker som løst" placement="left">
                <Button
                  colorScheme="blue"
                  leftIcon="check"
                  width={"12px"}
                  onClick={() => handleStatusEndring(AvvikStatus.FIKSET)}
                  aria-label={"Marker som løst"}
                />
              </CustomTooltip>
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
  gap: var(--kvib-spacing-12);
  width: 100%;
  padding: var(--kvib-space-2) var(--kvib-space-2);
  background-color: ${({ $active, $removing, $status }) =>
    $removing
      ? $status === AvvikStatus.VENT
        ? "var(--kvib-colors-yellow-100)"
        : $status === AvvikStatus.NY
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
      ? $status === AvvikStatus.NY
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
