import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelProps, SidePanel } from "../Panel";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { FeatureProperties } from "types/api";
import GrenseinformasjonForm from "./GrenseinformasjonForm";
import { useCallback, useEffect } from "react";
import { isMatrikkelFeature } from "utils/features";
import { TilhorighetField } from "./TilhorighetField";
import { Vedtaksinformasjon } from "./Vedtaksinformasjon/Vedtaksinformasjon";
import { Card, CardBody, CardHeader, Divider, Heading } from "@kvib/react";
import { styled } from "styled-components";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { featureDoesNotExistBeforeIndex } from "contexts/HistoryContext/history-utils";

const GrenseinformasjonPanel = ({ isOpen, className }: PanelProps) => {
  const { selectedFeatures } = useFeatureStyle();
  const { activeOverlayPanel, closeOverlayPanel } = useOverlayPanel();
  const { history } = useHistory();
  const selectedFeature = selectedFeatures.length === 1 ? selectedFeatures[0] : undefined;
  useEffect(() => {
    if (activeOverlayPanel === "grenseinfo" && selectedFeatures.length === 0) {
      closeOverlayPanel();
    }
  }, [activeOverlayPanel, closeOverlayPanel, selectedFeatures.length]);

  const selectedProperties = selectedFeature?.getProperties() as FeatureProperties | undefined;

  const closeGrenseinfoIfFeatureRemoved = useCallback(() => {
    if (selectedFeature?.getId() == null) return;

    const isFeatureGone = featureDoesNotExistBeforeIndex(selectedFeature!.getId()!.toString(), history);
    if (isFeatureGone && isOpen) closeOverlayPanel();
  }, [closeOverlayPanel, history, isOpen, selectedFeature]);

  useEffect(() => {
    if (history.index < history.entries.length) closeGrenseinfoIfFeatureRemoved();
  }, [closeGrenseinfoIfFeatureRemoved, history.entries.length, history.index]);

  return (
    selectedFeature &&
    !isMatrikkelFeature(selectedFeature) && (
      <SidePanel $isOpen={isOpen} className={className}>
        {selectedProperties ? (
          <GrensePanelContent>
            <GrenseinformasjonForm onClose={closeOverlayPanel} feature={selectedFeature} />
            <Divider />
            <Card variant="filled">
              <GrenseInfoExtraCardHeader>
                <Heading size="md">Ytterligere informasjon</Heading>
              </GrenseInfoExtraCardHeader>
              <GrenseInfoExtraCardBody>
                <Divider />
                <TilhorighetField feature={selectedFeature} />
                <Divider />
                <Vedtaksinformasjon feature={selectedFeature} />
              </GrenseInfoExtraCardBody>
            </Card>
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
  gap: 24px;
  padding-bottom: 24px;
`;

const GrenseInfoExtraCardBody = styled(CardBody)`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const GrenseInfoExtraCardHeader = styled(CardHeader)`
  padding-bottom: 0;
`;

export default GrenseinformasjonPanel;
