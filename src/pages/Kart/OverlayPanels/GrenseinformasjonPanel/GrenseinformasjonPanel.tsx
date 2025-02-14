import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, SidePanel } from "../Panel";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { FeatureProperties } from "types/api";
import GrenseinformasjonForm from "./GrenseinformasjonForm";
import { useCallback, useEffect } from "react";
import { isTeigFeature } from "utils/features";
import { TilhorighetField } from "./TilhorighetField";
import { Vedtaksinformasjon } from "./Vedtaksinformasjon/Vedtaksinformasjon";
import { Alert, AlertIcon, Card, CardBody, CardHeader, Divider, Heading, Text } from "@kvib/react";
import { styled } from "styled-components";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { newFeatureOnlyExistsAfterIndex } from "contexts/HistoryContext/history-utils";
import { useToolbar } from "contexts/ToolbarContext";
import { TeiggrenseInformasjon } from "./Matrikkelgrenseinformasjon";

const GrenseinformasjonPanel = () => {
  const { selectedFeatures } = useFeatureStyle();
  const { closeOverlayPanel } = useOverlayPanel();
  const { history } = useHistory();
  const { toggleTool } = useToolbar();
  const selectedFeature = selectedFeatures.length === 1 ? selectedFeatures[0] : undefined;
  const selectedProperties = selectedFeature?.getProperties() as FeatureProperties | undefined;

  const handleClose = () => {
    closeOverlayPanel(false);
    toggleTool("grenseinfo");
  };

  const closeGrenseinfoIfFeatureRemoved = useCallback(() => {
    if (selectedFeature?.getId() === undefined || selectedFeature.getId() === null) {
      return;
    }

    const isFeatureGone = newFeatureOnlyExistsAfterIndex(selectedFeature.getId()!.toString(), history);
    if (isFeatureGone) {
      closeOverlayPanel(false);
      toggleTool("grenseinfo");
    }
  }, [closeOverlayPanel, history, selectedFeature, toggleTool]);

  useEffect(() => {
    if (history.index < history.entries.length) {
      closeGrenseinfoIfFeatureRemoved();
    }
  }, [closeGrenseinfoIfFeatureRemoved, history.entries.length, history.index]);

  return (
    <SidePanel>
      {selectedFeatures.length === 0 ? (
        <GrensePanelContent>
          <PanelHeader onClose={handleClose} noMargin>
            Informasjon
          </PanelHeader>
          <Text>Velg en grense i kartet for å se grenseinformasjon</Text>
        </GrensePanelContent>
      ) : selectedFeatures.length > 1 ? (
        <GrensePanelContent>
          <PanelHeader onClose={handleClose} noMargin>
            Informasjon
          </PanelHeader>
          <Text>
            Du kan kun se informasjon om én grense om gangen. Velg grensen på nytt som du ønsker å se informasjon til.
          </Text>
        </GrensePanelContent>
      ) : selectedFeature && isTeigFeature(selectedFeature) === true ? (
        <TeiggrenseInformasjon onClose={handleClose} feature={selectedFeature} />
      ) : selectedFeature && selectedProperties ? (
        <GrensePanelContent>
          <GrenseinformasjonForm onClose={handleClose} feature={selectedFeature} />
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
        <GrensePanelContent>
          <PanelHeader onClose={handleClose} noMargin>
            Informasjon
          </PanelHeader>
          <Alert status="error">
            <AlertIcon />
            Finner ikke informasjon om valgt grense. Kontakt Kartverket dersom du mener dette er feil.
          </Alert>
        </GrensePanelContent>
      )}
    </SidePanel>
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
