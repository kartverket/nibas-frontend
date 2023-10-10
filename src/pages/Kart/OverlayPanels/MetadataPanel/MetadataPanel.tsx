import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import MetadataGenerelt from "./MetadataGenerelt";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { FeatureProperties, Metadata } from "types/api";
import { getDateInFriendlyString } from "./utils";
import { useEffect } from "react";

const grenseTypeWithReferanser = [
  "Territorialgrense",
  "Fylkesgrense",
  "Kommunegrense",
  "AvtaltAvgrensningslinje",
  "Riksgrense",
  "Grunnlinje",
];

const MetadataPanel = ({ isOpen, className }: PanelProps) => {
  const { selectedFeatures } = useFeatureStyle();
  const { activeOverlayPanel, closeOverlayPanel } = useOverlayPanel();

  const selectedFeature =
    selectedFeatures.length === 1 ? selectedFeatures[0] : undefined;

  // Død kode for grenserefaranser
  // const showReferanser = grenseTypeWithReferanser.includes(
  //   selectedFeature?.get("type") as string
  // );

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

  return (
    <SidePanel $isOpen={isOpen} className={className}>
      <PanelHeader
        onClose={closeOverlayPanel}
        subHeading={
          selectedProperties &&
          selectedProperties.metadata && (
            <>
              Sist oppdatert:{" "}
              {getDateInFriendlyString(
                (
                  (selectedFeature?.getProperties() as FeatureProperties)
                    .metadata as Metadata
                ).common?.sporingsinformasjon.oppdateringsdato
              )}
            </>
          )
        }
      >
        Informasjon om grense
      </PanelHeader>
      {selectedFeature && !isWFSGrense && selectedProperties.metadata ? (
        <MetadataGenerelt feature={selectedFeature} />
      ) : (
        <p>Den valgte grensen har ingen metadata</p>
      )}
    </SidePanel>
  );
};

export default MetadataPanel;
