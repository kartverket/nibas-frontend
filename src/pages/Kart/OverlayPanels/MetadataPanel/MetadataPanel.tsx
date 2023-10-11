import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import MetadataGenerelt from "./MetadataGenerelt";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { FeatureProperties, Metadata } from "types/api";
import { getDateInFriendlyString } from "./utils";
import { useEffect } from "react";

const MetadataPanel = ({ isOpen, className }: PanelProps) => {
  const { selectedFeatures } = useFeatureStyle();
  const { activeOverlayPanel, closeOverlayPanel } = useOverlayPanel();

  const selectedFeature =
    selectedFeatures.length === 1 ? selectedFeatures[0] : undefined;

  useEffect(() => {
    if (activeOverlayPanel === "metadata" && selectedFeatures.length === 0) {
      closeOverlayPanel();
    }
  }, [activeOverlayPanel, closeOverlayPanel, selectedFeatures.length]);

  const isWFSGrense = selectedFeature
    ?.getId()
    ?.toString()
    .includes("TEIGGRENSEWFS");

  const selectedProperties =
    selectedFeature?.getProperties() as FeatureProperties;

  const sistOppdatertString = `Sist oppdatert: ${
    selectedProperties && selectedProperties.metadata
      ? getDateInFriendlyString(
          (selectedProperties.metadata as Metadata).common?.sporingsinformasjon
            .oppdateringsdato,
        )
      : "Ukjent"
  }`;

  return (
    <SidePanel $isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlayPanel} subHeading={sistOppdatertString}>
        Informasjon om grense
      </PanelHeader>
      {selectedFeature &&
      selectedProperties &&
      selectedProperties.metadata &&
      !isWFSGrense ? (
        <MetadataGenerelt feature={selectedFeature} />
      ) : (
        <p>Valgt grense har ikke metadata</p>
      )}
    </SidePanel>
  );
};

export default MetadataPanel;
