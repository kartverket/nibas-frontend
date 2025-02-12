import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { SidePanel, PanelHeader } from "../Panel";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { FeatureProperties } from "types/api";
import GrenseinformasjonForm from "./GrenseinformasjonForm";
import { useCallback, useEffect } from "react";
import { isMatrikkelFeature } from "utils/features";
import { TilhorighetField } from "./TilhorighetField";
import { Vedtaksinformasjon } from "./Vedtaksinformasjon/Vedtaksinformasjon";
import { Card, CardBody, Divider, Heading, Text, CardHeader } from "@kvib/react";
import { styled } from "styled-components";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { newFeatureOnlyExistsAfterIndex } from "contexts/HistoryContext/history-utils";
import { useToolbar } from "contexts/ToolbarContext";

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
      ) : selectedFeature && isMatrikkelFeature(selectedFeature) ? (
        <GrensePanelContent>
          <PanelHeader onClose={handleClose} noMargin>
            Informasjon
          </PanelHeader>
          <Text>Kan ikke vise informasjon om matrikkelgrenser.</Text>
        </GrensePanelContent>
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
          <Text>Valgt grense har ikke metadata</Text>
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
