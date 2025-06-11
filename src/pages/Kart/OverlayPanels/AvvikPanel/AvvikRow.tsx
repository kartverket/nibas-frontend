import { Box, Button, Stack, Text, useToast } from "@kvib/react";
import { styled } from "styled-components";
import { AvvikRowPropsExtended, AvvikStatus } from "./avvik-utils";
import ToolbarButton from "pages/Kart/Toolbar/ToolbarButton";
import { useState } from "react";
import CustomTooltip from "pages/Kart/Toolbar/CustomTooltip";
import { centerOnCoordinate } from "../NavigasjonPanel/koordinater-utils";
import Feature from "ol/Feature";
import { Circle as CircleGeom } from "ol/geom";
import { Style, Stroke, Fill } from "ol/style";
import { highlightSource } from "hooks/layers/constants";
interface StyledRowProps {
  $active: boolean;
  $removing: boolean;
  $status: AvvikStatus;
}

const AvvikRow = ({
  avvikItem,
  selectedAvvikId,
  setSelectedAvvikId,
  updateStatus,
  findSecondKommune,
}: AvvikRowPropsExtended) => {
  const showHighlightCircle = (coordinate: number[], radius = 1200) => {
    highlightSource.clear();
    const circleFeature = new Feature(new CircleGeom(coordinate, radius));
    circleFeature.setStyle(
      new Style({
        stroke: new Stroke({ color: "rgba(255,174,73,0.8)", width: 12 }),
        fill: new Fill({ color: "rgba(255,174,73,0.2)" }),
      }),
    );
    highlightSource.addFeature(circleFeature);
  };

  const clearHighlightCircle = () => {
    highlightSource.clear();
  };
  const toast = useToast();
  const [isRemoving, setIsRemoving] = useState(false);
  const [rowStatus, setRowStatus] = useState<AvvikStatus>(avvikItem.status as AvvikStatus);
  const koordinaterAvvikNibas = avvikItem.koordinaterMedAvvik.map((k) => k.nibasKoordinat.coordinates);
  const panAndZoom = async (coordinates: number[]) => {
    let zoomLevel = 12;
    centerOnCoordinate(coordinates[1], coordinates[0], zoomLevel, 1000);
    setTimeout(() => {
      zoomLevel = 24;
      centerOnCoordinate(coordinates[1], coordinates[0], zoomLevel, 1000);
    }, 2000);
  };
  const handlePanAndSelect = () => {
    panAndZoom(koordinaterAvvikNibas[0]); // Per nå bruker vi kun første koordinat for panoreringsfunksjonen selv om det er evt flere koordinater med avvik
    findSecondKommune(avvikItem.kommuner);
    setSelectedAvvikId(avvikItem.id);
  };
  const highlightAvvik = async () => {
    const coordinates = avvikItem.koordinaterMedAvvik[0]?.nibasKoordinat.coordinates;
    showHighlightCircle(coordinates);
  };

  const removeHighlight = () => {
    clearHighlightCircle();
  };
  const handleStatusEndring = async (status: AvvikStatus) => {
    setIsRemoving(true);
    setRowStatus(status);
    setTimeout(async () => {
      const success = await updateStatus(avvikItem.id, status);
      if (!success) {
        toast({
          status: "error",
          title: "Fikk ikke oppdatert status på avviket",
        });
        setRowStatus(avvikItem.status);
      }
      setIsRemoving(false);
    }, 500);
  };
  const isActive = selectedAvvikId === avvikItem?.id;
  const status = avvikItem.status;

  return (
    <Container>
      <Row
        $active={isActive}
        $removing={isRemoving}
        $status={rowStatus}
        onMouseOver={() => {
          highlightAvvik();
        }}
        onMouseLeave={() => {
          removeHighlight();
        }}
      >
        <Stack spacing="1">
          {avvikItem.kommuner.map((kommune, index) => (
            <Text key={index} fontSize={"sm"}>
              {kommune.kommunenummer} - {kommune.kommunenavn}
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
                  handlePanAndSelect();
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
                  handlePanAndSelect();
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
                  handlePanAndSelect();
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

const Row = styled.div<StyledRowProps & { $removing: boolean }>`
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

  &:hover {
    background-color: var(--kvib-colors-gray-100);
    cursor: pointer;
  }
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
