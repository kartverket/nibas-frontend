import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import GrenseinformasjonFieldList from "./GrenseinformasjonFieldList";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { FeatureProperties, Metadata } from "types/api";
import { getDateInFriendlyString } from "./grenseinformasjon-utils";
import { useEffect } from "react";
import { Feature } from "ol";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import { isMatrikkelFeature } from "utils/features";

const GrenseinformasjonPanel = ({ isOpen, className }: PanelProps) => {
  const { selectedFeatures } = useFeatureStyle();
  const { activeOverlayPanel, closeOverlayPanel } = useOverlayPanel();

  const selectedFeature = selectedFeatures.length === 1 ? selectedFeatures[0] : undefined;

  useEffect(() => {
    if (activeOverlayPanel === "grenseinfo" && selectedFeatures.length === 0) {
      closeOverlayPanel();
    }
  }, [activeOverlayPanel, closeOverlayPanel, selectedFeatures.length]);

  const selectedProperties = selectedFeature?.getProperties() as FeatureProperties;

  const getSistOppdatert = (feature: Feature) => {
    if (isTempFeatureId(feature.getId()?.toString())) return "Ny grense, aldri oppdatert";

    const featureProperties = feature.getProperties() as FeatureProperties;
    const metadata = featureProperties.metadata as Metadata | null;

    if (metadata) {
      const oppdateringsDato = metadata.common?.sporingsinformasjon.oppdateringsdato;

      if (oppdateringsDato) {
        return getDateInFriendlyString(oppdateringsDato);
      }
    }

    return "Ukjent";
  };

  return (
    selectedFeature &&
    !isMatrikkelFeature(selectedFeature) && (
      <SidePanel $isOpen={isOpen} className={className}>
        <PanelHeader onClose={closeOverlayPanel} subHeading={`Sist oppdatert: ${getSistOppdatert(selectedFeature)}`}>
          Informasjon om grense
        </PanelHeader>
        {selectedFeature && selectedProperties ? (
          <GrenseinformasjonFieldList feature={selectedFeature} />
        ) : (
          <p>Valgt grense har ikke metadata</p>
        )}
      </SidePanel>
    )
  );
};

export default GrenseinformasjonPanel;
