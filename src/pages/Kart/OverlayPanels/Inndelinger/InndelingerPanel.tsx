import { Divider, Modal, ModalContent, ModalOverlay } from "@kvib/react";
import { PanelHeader, PanelProps, ModalPanel } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import {
  INNDELINGTYPER,
  Inndelingtype,
  isSameInndelinger,
  useInndelinger,
  Inndeling,
} from "contexts/InndelingerContext/InndelingerContext";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import { useState } from "react";
import useFylker from "hooks/inndelinger/useFylker";
import useKommuner from "hooks/inndelinger/useKommuner";
import { styled } from "styled-components";
import InndelingOption from "./Inndeling";

const InndelingerPanel = ({ isOpen, className }: PanelProps) => {
  const [selectedKretstype, setSelectedKretstype] = useState<Inndelingtype | null>(null);

  // Bedre navn på denne for å skille den mer fra valgt fylke i context?
  const [selectedPanelFylkeId, setSelectedPanelFylkeId] = useState<string>("");
  const { inndelinger, selectInndeling, setSelectedFylkeId } = useInndelinger();
  const { closeOverlayModal, activeOverlayModal } = useOverlayPanel();

  const isEditingPanel = activeOverlayModal === "inndelinger";

  const { fylker } = useFylker();
  const { kommuner } = useKommuner(selectedPanelFylkeId);

  const resetInndelingerPanel = () => {
    closeOverlayModal();
    setSelectedKretstype(null);
    setSelectedPanelFylkeId("");
  };

  const selectKretstype = (kretstype: Inndelingtype) => {
    setSelectedKretstype(kretstype);
    setSelectedPanelFylkeId("");
  };

  const selectFylke = (fylkeId: string) => {
    if (selectedKretstype === "fylke") {
      const newInndeling: Inndeling = {
        id: fylkeId,
        inndelingtype: "fylke",
        isEditing: isEditingPanel,
        isVisible: !isEditingPanel,
      };

      const inndelingIfAlreadySelected = inndelinger["fylke"].get(fylkeId);

      if (inndelingIfAlreadySelected && isSameInndelinger(newInndeling, inndelingIfAlreadySelected)) {
        if (isEditingPanel) {
          newInndeling.isEditing = !inndelingIfAlreadySelected.isEditing;
          newInndeling.isVisible = inndelingIfAlreadySelected.isVisible;
        } else {
          newInndeling.isEditing = inndelingIfAlreadySelected.isEditing;
          newInndeling.isVisible = !inndelingIfAlreadySelected.isVisible;
        }
      }

      selectInndeling(newInndeling);
      resetInndelingerPanel();
    } else {
      setSelectedPanelFylkeId(fylkeId);
      setSelectedFylkeId(fylkeId);
    }
  };

  const selectKommune = (kommuneId: string) => {
    if (selectedKretstype) {
      const newInndeling: Inndeling = {
        id: kommuneId,
        inndelingtype: selectedKretstype,
        isEditing: isEditingPanel,
        isVisible: !isEditingPanel,
      };

      const inndelingIfAlreadySelected = inndelinger[selectedKretstype].get(kommuneId);

      if (inndelingIfAlreadySelected && isSameInndelinger(newInndeling, inndelingIfAlreadySelected)) {
        if (isEditingPanel) {
          newInndeling.isEditing = !inndelingIfAlreadySelected.isEditing;
          newInndeling.isVisible = inndelingIfAlreadySelected.isVisible;
        } else {
          newInndeling.isEditing = inndelingIfAlreadySelected.isEditing;
          newInndeling.isVisible = !inndelingIfAlreadySelected.isVisible;
        }
      }

      selectInndeling(newInndeling);
      resetInndelingerPanel();
    }
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const inndelingIcon = (id: string, inndelingtype: Inndelingtype, isKommune: boolean) => {
    const inndeling = inndelinger[inndelingtype].get(id);

    if (selectedKretstype === "fylke") {
      if (inndeling != null) {
        return "visibility_off";
      } else {
        return "visibility";
      }
    }

    if (!isKommune) return "chevron_right";

    if (inndeling != null && inndeling.inndelingtype === selectedKretstype) {
      return "visibility_off";
    }

    return "visibility";
  };

  return (
    <Modal isOpen={isOpen} onClose={resetInndelingerPanel} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as={ModalPanel} $isOpen={isOpen} className={className}>
        <PanelHeader onClose={resetInndelingerPanel}>
          Velg en inndeling du ønsker å {isEditingPanel ? "redigere" : "se i kartet"}
        </PanelHeader>
        <InndelingerLayout>
          <InndelingerList>
            {INNDELINGTYPER.map((kretstype) => (
              <InndelingOption
                key={kretstype}
                isActive={selectedKretstype === kretstype}
                onClick={() => selectKretstype(kretstype)}
                rightIcon="chevron_right"
              >
                {capitalize(kretstype)}
              </InndelingOption>
            ))}
          </InndelingerList>
          <Divider orientation="vertical" />
          <InndelingerList>
            {selectedKretstype &&
              fylker?.map((fylke) => {
                const fylkeId = getIdFromEntity(fylke);
                return (
                  <InndelingOption
                    isActive={selectedPanelFylkeId === fylkeId}
                    key={fylkeId}
                    onClick={() => selectFylke(fylkeId)}
                    {...(selectedKretstype !== "fylke" ? { rightIcon: inndelingIcon(fylkeId, "fylke", false) } : {})}
                  >
                    {`${fylke.nummer} ${getNavnInSpraak(fylke.navn, "nor")}`}
                  </InndelingOption>
                );
              })}
          </InndelingerList>
          <Divider orientation="vertical" />
          <InndelingerList>
            {selectedPanelFylkeId &&
              kommuner?.map((kommune) => {
                const kommuneId = getIdFromEntity(kommune);
                return (
                  <InndelingOption isActive={false} key={kommuneId} onClick={() => selectKommune(kommuneId)}>
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

export const InndelingerLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: 16px;
  padding: 8px 0 24px;
  overflow: hidden;
`;

export const InndelingerList = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
`;

export default InndelingerPanel;
