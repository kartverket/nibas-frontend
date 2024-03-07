import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelProps, SidePanel } from "../Panel";
import GrenseinformasjonFieldList from "./GrenseinformasjonFieldList";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { FeatureProperties } from "types/api";
import { useEffect } from "react";
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

  return (
    selectedFeature &&
    !isMatrikkelFeature(selectedFeature) && (
      <SidePanel $isOpen={isOpen} className={className}>
        {selectedProperties ? (
          <GrenseinformasjonFieldList onClose={closeOverlayPanel} feature={selectedFeature} />
        ) : (
          <p>Valgt grense har ikke metadata</p>
        )}
      </SidePanel>
    )
  );
};

export default GrenseinformasjonPanel;
