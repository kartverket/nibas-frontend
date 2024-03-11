import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelProps, SidePanel } from "../Panel";
import GrenseinformasjonForm from "./GrenseinformasjonForm";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import { FeatureProperties } from "types/api";
import { useEffect } from "react";
import { isMatrikkelFeature } from "utils/features";
import { TilhorighetField } from "./TilhorighetField";
import { Vedtaksinformasjon } from "./Vedtaksinformasjon/Vedtaksinformasjon";
import { styled } from "styled-components";

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
          <GrensePanelContent>
            <GrenseinformasjonForm onClose={closeOverlayPanel} feature={selectedFeature} />
            <TilhorighetField feature={selectedFeature} />
            <Vedtaksinformasjon feature={selectedFeature} />
          </GrensePanelContent>
        ) : (
          <p>Valgt grense har ikke metadata</p>
        )}
      </SidePanel>
    )
  );
};

const GrensePanelContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 24px;
`;

export default GrenseinformasjonPanel;
