import { Button, ButtonGroup, Divider, IconButton, Modal, ModalContent, ModalOverlay } from "@kvib/react";
import { PanelHeader, PanelProps, ModalPanel } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import {
  INNDELINGTYPER,
  Inndeling,
  Inndelingtype,
  useInndelinger,
} from "contexts/InndelingerContext/InndelingerContext";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import { useState } from "react";
import useFylker from "hooks/inndelinger/useFylker";
import useKommuner from "hooks/inndelinger/useKommuner";
import { styled } from "styled-components";
import InndelingOption from "./InndelingOption";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { capitalize } from "utils/string-utils";
import { useToolbar } from "contexts/ToolbarContext";

const InndelingerPanel = ({ isOpen }: PanelProps) => {
  const [selectedInndelingtype, setSelectedInndelingtype] = useState<Inndelingtype | null>(null);
  const [selectedInndelinger, setSelectedInndelinger] = useState<Inndeling[]>([]);
  const [activePanelFylkeId, setActivePanelFylkeId] = useState<string>("");

  const { selectInndelinger, setSelectedFylkeId, getNewInndeling, setSelectedFlatedataInndeling } = useInndelinger();
  const { closeOverlayModal, activeOverlayModal, openOverlayModal } = useOverlayPanel();
  const { disableModeTool } = useToolbar();
  const { history, clearHistory } = useHistory();
  const { fylker } = useFylker();
  const { kommuner } = useKommuner(activePanelFylkeId);

  const hasUnsavedChangesInHistory = history.entries.length > 0;
  const isEditingPanel = activeOverlayModal === "inndelinger";
  const isMultiSelectionInndeling = selectedInndelingtype === "kommune" || selectedInndelingtype === "fylke";

  const resetInndelingerPanel = () => {
    closeOverlayModal();
    setSelectedInndelingtype(null);
    setActivePanelFylkeId("");
  };

  const selectInndelingtype = (inndelingtype: Inndelingtype) => {
    if (selectedInndelingtype !== inndelingtype) {
      setSelectedInndelingtype(inndelingtype);
      setActivePanelFylkeId("");
      setSelectedInndelinger([]);
    }
  };

  const selectNewInndelinger = () => {
    if (hasUnsavedChangesInHistory && isEditingPanel) {
      clearHistory();
    }

    selectInndelinger(selectedInndelinger);
    resetInndelingerPanel();

    if (isEditingPanel) {
      disableModeTool("move");
    }
  };

  const toggleFylke = (fylkeId: string) => {
    if (selectedInndelingtype === "fylke") {
      const isAlreadySelected = selectedInndelinger.findIndex(
        (inndeling) => inndeling.id === fylkeId && inndeling.inndelingtype === selectedInndelingtype,
      );

      if (isAlreadySelected < 0) {
        const newInndeling = getNewInndeling(fylkeId, selectedInndelingtype, isEditingPanel);
        setSelectedInndelinger(selectedInndelinger.concat(newInndeling));
        return;
      }

      setSelectedInndelinger(selectedInndelinger.filter((_, index) => isAlreadySelected !== index));
    } else {
      setActivePanelFylkeId(fylkeId);
      setSelectedFylkeId(fylkeId);
      setSelectedInndelinger([]);
    }
  };

  const toggleKommune = (kommuneId: string) => {
    if (selectedInndelingtype) {
      const newInndeling = getNewInndeling(kommuneId, selectedInndelingtype, isEditingPanel);

      if (selectedInndelingtype === "grunnkrets" || selectedInndelingtype === "stemmekrets") {
        setSelectedInndelinger([newInndeling]);
        return;
      }

      const isAlreadySelected = selectedInndelinger.findIndex(
        (inndeling) => inndeling.id === kommuneId && inndeling.inndelingtype === selectedInndelingtype,
      );

      if (isAlreadySelected === -1) {
        setSelectedInndelinger(selectedInndelinger.concat(newInndeling));
        return;
      }

      setSelectedInndelinger(selectedInndelinger.filter((_, index) => isAlreadySelected !== index).concat());
    }
  };

  const flatedataIsAvailable = selectedInndelingtype === "stemmekrets" || selectedInndelingtype === "grunnkrets";

  const toggleFlatedetaljer = (inndelingId: string) => {
    if (flatedataIsAvailable) {
      setSelectedFlatedataInndeling(getNewInndeling(inndelingId, selectedInndelingtype, isEditingPanel));
      openOverlayModal(selectedInndelingtype);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetInndelingerPanel} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as={ModalPanel} $isOpen={isOpen}>
        <PanelHeader
          onClose={resetInndelingerPanel}
          subHeading={
            isMultiSelectionInndeling
              ? "For å redigere kommunegrenser må du skru på redigering for begge kommunene grensen gjelder"
              : ""
          }
        >
          Velg en inndeling du ønsker å {isEditingPanel ? "redigere" : "se i kartet"}
        </PanelHeader>
        <InndelingerLayout>
          <InndelingerList>
            {INNDELINGTYPER.map((inndelingtype) => (
              <InndelingOption
                key={inndelingtype}
                isActive={selectedInndelingtype === inndelingtype}
                onClick={() => selectInndelingtype(inndelingtype)}
                rightIcon="chevron_right"
                type="button"
              >
                {capitalize(inndelingtype)}
              </InndelingOption>
            ))}
          </InndelingerList>
          <Divider orientation="vertical" />
          <InndelingerList>
            {selectedInndelingtype &&
              fylker?.map((fylke) => {
                const fylkeId = getIdFromEntity(fylke);
                return (
                  <InndelingOption
                    isActive={selectedInndelinger.some(
                      (inndeling) =>
                        inndeling.id === fylke.id.lokalid.value && inndeling.inndelingtype === selectedInndelingtype,
                    )}
                    key={fylkeId}
                    onClick={() => toggleFylke(fylkeId)}
                    rightIcon={selectedInndelingtype !== "fylke" ? "chevron_right" : undefined}
                    type={selectedInndelingtype === "fylke" ? "checkbox" : "button"}
                  >
                    {`${fylke.nummer} ${getNavnInSpraak(fylke.navn, "nor")}`}
                  </InndelingOption>
                );
              })}
          </InndelingerList>
          <Divider orientation="vertical" />
          <InndelingerList>
            {activePanelFylkeId &&
              kommuner?.map((kommune) => {
                const kommuneId = getIdFromEntity(kommune);
                return (
                  <FlatedataWrapper key={kommuneId}>
                    <InndelingOption
                      isActive={selectedInndelinger.some(
                        (inndeling) =>
                          inndeling.id === kommune.id.lokalid.value &&
                          inndeling.inndelingtype === selectedInndelingtype,
                      )}
                      onClick={() => toggleKommune(kommuneId)}
                      type={selectedInndelingtype === "kommune" ? "checkbox" : "radio"}
                    >
                      {`${kommune.nummer} ${getNavnInSpraak(kommune.navn, "nor")}`}
                    </InndelingOption>
                    {flatedataIsAvailable && !isEditingPanel && (
                      <IconButton
                        variant="ghost"
                        icon="feed"
                        aria-label="Vis informasjon om flatene"
                        onClick={() => toggleFlatedetaljer(kommuneId)}
                      />
                    )}
                  </FlatedataWrapper>
                );
              })}
          </InndelingerList>
        </InndelingerLayout>
        <Divider></Divider>
        <ButtonContainer>
          <Button variant="ghost" size={"md"} onClick={() => setSelectedInndelinger([])}>
            Nullstill markering
          </Button>
          <ButtonGroup>
            <Button variant="secondary" size={"md"} onClick={closeOverlayModal}>
              Avbryt
            </Button>
            <Button size={"md"} isDisabled={selectedInndelinger.length === 0} onClick={selectNewInndelinger}>
              {isEditingPanel ? "Rediger" : "Se"} valgte inndelinger
            </Button>
          </ButtonGroup>
        </ButtonContainer>
      </ModalContent>
    </Modal>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
`;

const InndelingerLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: 16px;
  padding: 8px 0 24px;
  overflow: hidden;
`;

const InndelingerList = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
`;

const FlatedataWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export default InndelingerPanel;
