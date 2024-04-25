import { Divider, Modal, ModalContent, ModalOverlay } from "@kvib/react";
import { PanelHeader, PanelProps, ModalPanel } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import {
  BaseInndeling,
  INNDELINGTYPER,
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

  // Bedre navn på denne for å skille den mer fra valgt fylke i context?
  const [selectedPanelFylkeId, setSelectedPanelFylkeId] = useState<string>("");
  const { selectInndeling, setSelectedFylkeId, getNewInndeling } = useInndelinger();
  const { closeOverlayModal, activeOverlayModal } = useOverlayPanel();
  const { disableModeTool } = useToolbar();

  const { history, clearHistory } = useHistory();
  const hasUnsavedChangesInHistory = history.entries.length > 0;

  const isEditingPanel = activeOverlayModal === "inndelinger";

  const { fylker } = useFylker();
  const { kommuner } = useKommuner(selectedPanelFylkeId);

  const resetInndelingerPanel = () => {
    closeOverlayModal();
    setSelectedInndelingtype(null);
    setSelectedPanelFylkeId("");
  };

  const selectInndelingtype = (inndelingtype: Inndelingtype) => {
    setSelectedInndelingtype(inndelingtype);
    setSelectedPanelFylkeId("");
  };

  const selectNewInndeling = (baseInndeling: BaseInndeling) => {
    if (hasUnsavedChangesInHistory && isEditingPanel) {
      clearHistory();
    }

    const newInndeling = getNewInndeling(baseInndeling, isEditingPanel);

    selectInndeling(newInndeling);
    resetInndelingerPanel();

    if (isEditingPanel) {
      disableModeTool("move");
    }
  };

  const selectFylke = (fylkeInndeling: BaseInndeling) => {
    if (selectedInndelingtype === "fylke") {
      selectNewInndeling(fylkeInndeling);
    } else {
      setSelectedPanelFylkeId(fylkeInndeling.id);
      setSelectedFylkeId(fylkeInndeling.id);
    }
  };

  const selectKommune = (kommuneInndeling: BaseInndeling) => {
    if (selectedInndelingtype) {
      selectNewInndeling(kommuneInndeling);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetInndelingerPanel} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as={ModalPanel} $isOpen={isOpen}>
        <PanelHeader onClose={resetInndelingerPanel}>
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

                const fylkeInndeling: BaseInndeling = {
                  id: fylkeId,
                  nummer: fylke.nummer,
                  navn: fylke.navn,
                  inndelingtype: "fylke",
                };

                return (
                  <InndelingOption
                    isActive={selectedPanelFylkeId === fylkeId}
                    key={fylkeId}
                    onClick={() => selectFylke(fylkeInndeling)}
                    rightIcon={selectedInndelingtype !== "fylke" ? "chevron_right" : undefined}
                  >
                    {`${fylke.nummer} ${getNavnInSpraak(fylke.navn, "nor")}`}
                  </InndelingOption>
                );
              })}
          </InndelingerList>
          <Divider orientation="vertical" />
          <InndelingerList>
            {selectedInndelingtype &&
              selectedPanelFylkeId &&
              kommuner?.map((kommune) => {
                const kommuneId = getIdFromEntity(kommune);

                const kommuneInndeling: BaseInndeling = {
                  id: kommuneId,
                  nummer: kommune.nummer,
                  navn: kommune.navn,
                  inndelingtype: selectedInndelingtype,
                };

                return (
                  <InndelingOption key={kommuneId} isActive={false} onClick={() => selectKommune(kommuneInndeling)}>
                    {`${kommune.nummer} ${getNavnInSpraak(kommune.navn, "nor")}`}
                  </InndelingOption>
                );
              })}
          </InndelingerList>
        </InndelingerLayout>
      </ModalContent>
    </Modal>
  );
};

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

export default InndelingerPanel;
