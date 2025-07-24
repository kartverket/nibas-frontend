import { Button, Center, Input, Spinner, useToast } from "@kvib/react";
import { FEATURE_VISIBLE_PROPERTY, SOSI_FILE_ORIGIN_PROPERTY } from "contexts/KartlagContext/kartlag-utils";
import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import useToastUnique from "hooks/toast/useToastUnique";
import { useRef, useState } from "react";
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
  const toast = useToast();
  const { mappedLayers, addSOSIFileSublayers, uploadKartlag } = useKartlag();
  const { closeOverlayPanel } = useOverlayPanel();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const existingFiles = mappedLayers.find((l) => l.title === "SOSI-filer")?.sublayers ?? [];
    const maxFiles = 5;
    if (existingFiles.length + files.length > maxFiles) {
      toast({
        status: "error",
        title: "For mange SOSI-filer",
        description: `Du har allerede lastet opp ${existingFiles.length} filer. Du kan maksimalt laste opp ${maxFiles} filer om gangen.`,
      });
      return;
    }

    const newFileNames = Array.from(files).map((f) => f.name);
    const existingFileNames = existingFiles.map((sl) => sl.title);

    if (new Set(newFileNames).size !== files.length) {
      toast({
        status: "error",
        title: "Duplikater",
        description: "Du kan ikke laste opp filer med samme navn",
      });
      return;
    }

    if (newFileNames.some((fileName) => existingFileNames.includes(fileName))) {
      toast({
        status: "error",
        title: "Duplikater",
        description: `Du har allerede lastet opp ${files.length > 1 ? "filer med noen av disse navnene" : "en fil med dette navnet"}`,
      });
      return;
    }

    setIsUploadingFiles(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        try {
          const response = await uploadKartlag(file);
          if (response !== null) {
            const fileId = Math.random().toString(36).substring(2, 15);
            const features = geoJsonToSource(response).getFeatures();

            features.forEach((feature, j) => {
              feature.setId(`${fileId}_${j}`);
              feature.set(SOSI_FILE_ORIGIN_PROPERTY, fileId);
              feature.set(FEATURE_VISIBLE_PROPERTY, true);
            });

            return {
              sublayer: {
                type: "vector" as const,
                sourceId: "sosiFiler" as const,
                id: fileId,
                title: file.name,
                isVisible: true,
                sublayers: [],
              },
              features,
            };
          }
        } catch {
          innlastingFeiletToast();
        }
        return null;
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((result) => result !== null);

      if (successfulUploads.length > 0) {
        const allSublayers = successfulUploads.map((upload) => upload.sublayer);
        const allFeatures = successfulUploads.flatMap((upload) => upload.features);

        addSOSIFileSublayers(allSublayers);
        addFeaturesToSource("sosiFiler", allFeatures);

        const paddingRightIndex = 1;
        const padding = [...defaultZoomToFeaturesPadding];
        padding[paddingRightIndex] = padding[paddingRightIndex] + SidePanelWidth;
        zoomToFeatures(allFeatures, padding);
      }
    } finally {
      setIsUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <SidePanel>
      <PanelHeader onClose={closeOverlayPanel}>
        Bakgrunnskart
        <Button
          leftIcon="upload"
          size="sm"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          isLoading={isUploadingFiles}
          isDisabled={isUploadingFiles}
        >
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
