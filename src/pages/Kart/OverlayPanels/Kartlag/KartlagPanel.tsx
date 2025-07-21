import { Button, Center, Input, Spinner } from "@kvib/react";
import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import useToastUnique from "hooks/toast/useToastUnique";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { useRef } from "react";
import { styled } from "styled-components";
import { geoJsonToSource } from "utils/map/geoJson";
import { defaultZoomToFeaturesPadding, zoomToFeatures } from "utils/map/map-utils";
import { addFeaturesToSource } from "utils/map/source";
import { PanelHeader, SidePanel, SidePanelWidth } from "../Panel";
import Kartlag from "./Kartlag";

const KartlagPanel = () => {
  const { toastUnique: innlastingFeiletToast } = useToastUnique({
    status: "error",
    title: "Innlasting av grenser feilet",
    description: "Prøv å laste opp filen på nytt, og hvis feilen vedvarer, vennligst kontakt Kartverket",
  });
  const { mappedLayers, addSOSIFileSublayer, uploadKartlag } = useKartlag();
  const { closeOverlayPanel } = useOverlayPanel();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const zoomFeatures: Feature<Geometry>[] = [];
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const response = await uploadKartlag(file);
          if (response !== null) {
            const features = geoJsonToSource(response).getFeatures();
            addFeaturesToSource("sosiFiler", features);
            addSOSIFileSublayer({
              type: "vector",
              sourceId: "sosiFiler",
              id: Math.random().toString(36).substring(2, 15),
              title: file.name,
              isVisible: true,
              sublayers: [],
            });
            zoomFeatures.push(...features);
          }
        } catch {
          innlastingFeiletToast();
        }
      }

      if (zoomFeatures.length > 0) {
        const paddingRightIndex = 1;
        const padding = [...defaultZoomToFeaturesPadding];
        padding[paddingRightIndex] = padding[paddingRightIndex] + SidePanelWidth;
        zoomToFeatures(zoomFeatures, padding);
      }
    }
  };

  return (
    <SidePanel>
      <PanelHeader onClose={closeOverlayPanel}>
        Bakgrunnskart
        <Button leftIcon="upload" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
          <Input
            type="file"
            accept=".sos"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          Last opp kartlag (SOSI-fil)
        </Button>
      </PanelHeader>
      <KartlagList>
        {mappedLayers.length > 0 ? (
          mappedLayers.map((mappedLayer, index) => (
            <Kartlag
              key={mappedLayer.sourceId}
              mappedLayer={mappedLayer}
              index={index}
              maxIndex={mappedLayers.length - 1}
            />
          ))
        ) : (
          <Center>
            <Spinner thickness="2px" emptyColor="gray.200" color="blue.500" size="xl" />
          </Center>
        )}
      </KartlagList>
    </SidePanel>
  );
};

const KartlagList = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
`;

export default KartlagPanel;
