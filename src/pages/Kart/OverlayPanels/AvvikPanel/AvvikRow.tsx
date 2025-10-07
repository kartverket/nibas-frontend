import { Box, Button, Stack, Text, useToast } from "@kvib/react";
import { highlightPointSource, highlightStrokeSource } from "hooks/layers/constants";
import { equals } from "ol/coordinate";
import Feature, { FeatureLike } from "ol/Feature";
import { LineString, MultiPoint } from "ol/geom";
import { Fill, Stroke, Style, Circle } from "ol/style";
import CustomTooltip from "pages/Kart/Toolbar/CustomTooltip";
import ToolbarButton from "pages/Kart/Toolbar/ToolbarButton";
import { useState } from "react";
import { styled } from "styled-components";
import { endpointStyleZIndex, getEndPointsOnFeature, getNonEndpointsOnFeature } from "utils/map/layerStyles";
import { useMap } from "utils/map/useMap";
import { AvvikRowPropsExtended, AvvikStatus } from "./avvik-utils";

interface StyledRowProps {
  $removing: boolean;
  $status: AvvikStatus;
}

const AvvikRow = ({ avvikItem, setSelectedAvvikId, updateStatus, findSecondKommune }: AvvikRowPropsExtended) => {
  const toast = useToast();
  const [isRemoving, setIsRemoving] = useState(false);
  const [rowStatus, setRowStatus] = useState<AvvikStatus>(avvikItem.status as AvvikStatus);
  const koordinaterAvvikNibas = avvikItem.koordinaterMedAvvik.map((k) => k.nibasKoordinat.coordinates);
  const { zoomToFeatures } = useMap();

  const isAvvikPoint = (coordinate: number[]) => {
    return koordinaterAvvikNibas.some((c) => equals(c, coordinate));
  };

  const getNonAvvikEndpointsOnFeature = (feature: FeatureLike) => {
    return new MultiPoint(
      getNonEndpointsOnFeature(feature)
        ?.getCoordinates()
        .filter((c) => isAvvikPoint(c)) ?? [],
    );
  };

  const getAvvikEndpointsOnFeature = (feature: FeatureLike) => {
    return new MultiPoint(
      getEndPointsOnFeature(feature)
        ?.getCoordinates()
        .filter((c) => isAvvikPoint(c)) ?? [],
    );
  };

  const featureHighlightStrokeStyle = [
    new Style({
      stroke: new Stroke({
        color: "rgba(255, 221, 157, 0.75)",
        width: 20,
        lineCap: "round",
        lineJoin: "round",
      }),
    }),
  ];

  const featureHighlightPointStyles = [
    new Style({
      image: new Circle({
        radius: 3.5,
        fill: new Fill({
          color: "rgba(207, 145, 74, 1)",
        }),
      }),
      geometry: getNonAvvikEndpointsOnFeature,
    }),
    new Style({
      zIndex: endpointStyleZIndex,
      image: new Circle({
        radius: 3.5,
        fill: new Fill({
          color: "#FFFFFF",
        }),
        stroke: new Stroke({
          color: "rgba(207, 145, 74, 1)",
          width: 2.5,
        }),
      }),
      geometry: getAvvikEndpointsOnFeature,
    }),
  ];

  const addFeatureHighlightToHighlightSource = () => {
    const strokeFeature = new Feature(new LineString(avvikItem.geometri.coordinates));
    strokeFeature.setStyle(featureHighlightStrokeStyle);
    highlightStrokeSource.addFeature(strokeFeature);

    const pointsFeature = new Feature(new LineString(avvikItem.geometri.coordinates));
    pointsFeature.setStyle(featureHighlightPointStyles);
    highlightPointSource.addFeature(pointsFeature);
  };

  const removeFeatureHighlightFromHighlightSource = () => {
    highlightStrokeSource.clear();
    highlightPointSource.clear();
  };

  const handlePanAndSelect = async () => {
    findSecondKommune(avvikItem.kommuner);
    zoomToFeatures([new Feature(new LineString(avvikItem.geometri.coordinates))]);
    setSelectedAvvikId(avvikItem.id);
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

  const status = avvikItem.status;

  return (
    <Container>
      <Row
        $removing={isRemoving}
        $status={rowStatus}
        onMouseOver={() => {
          addFeatureHighlightToHighlightSource();
        }}
        onMouseLeave={() => {
          removeFeatureHighlightFromHighlightSource();
        }}
        onClick={() => {
          handlePanAndSelect();
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
                icon={"schedule"}
                colorScheme="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusEndring(AvvikStatus.VENT);
                }}
                aria-label={"Marker som utsatt"}
                tooltip={{ text: "Marker som utsatt" }}
              />
              <CustomTooltip text="Marker som løst" placement="left">
                <Button
                  colorScheme="blue"
                  leftIcon="check"
                  width={"12px"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusEndring(AvvikStatus.FIKSET);
                  }}
                  aria-label={"Marker som løst"}
                />
              </CustomTooltip>
            </>
          )}

          {status === AvvikStatus.FIKSET && (
            <>
              <ToolbarButton
                icon={"undo"}
                iconFill
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusEndring(AvvikStatus.NY);
                }}
                aria-label={"Marker som uløst"}
                tooltip={{ text: "Marker som uløst", placement: "left" }}
              />
            </>
          )}

          {status === AvvikStatus.VENT && (
            <>
              <ToolbarButton
                icon={"undo"}
                iconFill
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusEndring(AvvikStatus.NY);
                }}
                aria-label={"Marker som uløst"}
                tooltip={{ text: "Marker som uløst", placement: "left" }}
              />
              <CustomTooltip text="Marker som løst" placement="left">
                <Button
                  colorScheme="blue"
                  leftIcon="check"
                  width={"12px"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusEndring(AvvikStatus.FIKSET);
                  }}
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
  border-left: 4px solid transparent;
  background-color: ${({ $removing, $status }) =>
    $removing
      ? $status === AvvikStatus.VENT
        ? "var(--kvib-colors-yellow-100)"
        : $status === AvvikStatus.NY
          ? "var(--kvib-colors-red-100)"
          : "var(--kvib-colors-green-100)"
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
    border-left: 4px solid var(--kvib-colors-orange-300);
    background-color: rgb(186, 215, 248, 33%);
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
