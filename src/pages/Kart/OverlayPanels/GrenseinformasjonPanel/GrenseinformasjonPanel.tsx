import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, SidePanel } from "../Panel";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { FeatureProperties } from "types/api";
import GrenseinformasjonForm from "./GrenseinformasjonForm";
import { useCallback, useEffect } from "react";
import { isTeigFeature } from "utils/features";
import { TilhorighetField } from "./TilhorighetField";
import { Vedtaksinformasjon } from "./Vedtaksinformasjon/Vedtaksinformasjon";
import { Alert, AlertIcon, Card, CardBody, CardHeader, Divider, Heading } from "@kvib/react";
import { styled } from "styled-components";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { newFeatureOnlyExistsAfterIndex } from "contexts/HistoryContext/history-utils";
import { TeiggrenseInformasjon } from "./Matrikkelgrenseinformasjon";

const GrenseinformasjonPanel = () => {
  const { selectedFeatures } = useFeatureStyle();
  const { closeOverlayPanel } = useOverlayPanel();
  const { history } = useHistory();
  const selectedFeature = selectedFeatures.length === 1 ? selectedFeatures[0] : undefined;

  useEffect(() => {
    if (selectedFeatures.length === 0) {
      closeOverlayPanel();
    }
  }, [closeOverlayPanel, selectedFeatures.length]);

  const selectedProperties = selectedFeature?.getProperties() as FeatureProperties | undefined;

  const closeGrenseinfoIfFeatureRemoved = useCallback(() => {
    if (selectedFeature?.getId() === undefined || selectedFeature?.getId() === null) {
      return;
    }

    const isFeatureGone = newFeatureOnlyExistsAfterIndex(selectedFeature!.getId()!.toString(), history);
    if (isFeatureGone) {
      closeOverlayPanel();
    }
  }, [closeOverlayPanel, history, selectedFeature]);

  useEffect(() => {
    if (history.index < history.entries.length) {
      closeGrenseinfoIfFeatureRemoved();
    }
  }, [closeGrenseinfoIfFeatureRemoved, history.entries.length, history.index]);

  return (
    selectedFeature && (
      <SidePanel>
        {!isTeigFeature(selectedFeature) ? (
          <GrensePanelContent>
            {selectedProperties ? (
              <>
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
              </>
            ) : (
              <>
                <PanelHeader noMargin onClose={closeOverlayPanel}>
                  Informasjon
                </PanelHeader>
                <Alert status="error">
                  <AlertIcon />
                  Finner ikke informasjon om valgt grense. Kontakt Kartverket dersom du mener dette er feil.
                </Alert>
              </>
            )}
          </GrensePanelContent>
        ) : (
          <TeiggrenseInformasjon onClose={closeOverlayPanel} feature={selectedFeature} />
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
