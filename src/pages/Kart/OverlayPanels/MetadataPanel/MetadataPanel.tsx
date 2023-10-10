import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import MetadataGenerelt from "./MetadataGenerelt";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { FeatureProperties, Metadata } from "types/api";
import { getDateInFriendlyString } from "./utils";
import { useEffect } from "react";
import { styled } from "styled-components";

const StyledSidePanel = styled(SidePanel)`
  padding: 0;
`;

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

  const sistOppdatertString = "Sist oppdatert:".concat(
    selectedProperties && selectedProperties.metadata
      ? " " +
          getDateInFriendlyString(
            (
              (selectedFeature?.getProperties() as FeatureProperties)
                .metadata as Metadata
            ).common?.sporingsinformasjon.oppdateringsdato
          )
      : " Ukjent"
  );

  return (
    <StyledSidePanel $isOpen={isOpen} className={className}>
      <PanelHeader
        onClose={closeOverlayPanel}
        subHeading={
          selectedProperties &&
          selectedProperties.metadata &&
          sistOppdatertString
        }
      >
        Informasjon om grense
      </PanelHeader>
      {selectedFeature && !isWFSGrense && selectedProperties.metadata ? (
        <MetadataGenerelt feature={selectedFeature} />
      ) : (
        <p>Den valgte grensen har ingen metadata</p>
      )}
    </StyledSidePanel>
  );
};

export default MetadataPanel;
