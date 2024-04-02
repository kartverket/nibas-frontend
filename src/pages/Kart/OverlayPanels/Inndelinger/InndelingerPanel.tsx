import { Divider, Modal, ModalContent, ModalOverlay } from "@kvib/react";
import { PanelHeader, PanelProps, ModalPanel } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import {
  KRETSTYPER,
  Kretstype,
  isEqualInndelinger,
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
  const [selectedKretstype, setSelectedKretstype] = useState<Kretstype | null>(null);
  const [selectedFylkeId, setSelectedFylkeId] = useState<string>("");
  const { inndelinger, getInndeling, selectInndeling, currentlyEditedInndeling } = useInndelinger();
  const { closeOverlayModal, activeOverlayModal } = useOverlayPanel();

  const isEditingPanel = activeOverlayModal === "inndelinger";

  const { fylker } = useFylker();
  const { kommuner } = useKommuner(selectedFylkeId);

  const resetInndelingerPanel = () => {
    closeOverlayModal();
    setSelectedKretstype(null);
    setSelectedFylkeId("");
  };

  const selectKretstype = (kretstype: Kretstype) => {
    setSelectedKretstype(kretstype);
    setSelectedFylkeId("");
  };

  const selectFylke = (fylkeId: string) => {
    if (selectedKretstype === "fylke") {
      const newInndeling: Inndeling = {
        id: fylkeId,
        kretstype: "fylke",
        isEditing: isEditingPanel,
        isVisible: true,
      };

      if (currentlyEditedInndeling && isEqualInndelinger(newInndeling, currentlyEditedInndeling)) {
        newInndeling.isEditing = false;
        newInndeling.isVisible = false;
      }

      selectInndeling(newInndeling);
      resetInndelingerPanel();
    } else {
      setSelectedFylkeId(fylkeId);
    }
  };

  const selectKommune = (kommuneId: string) => {
    if (selectedKretstype) {
      const newInndeling: Inndeling = {
        id: kommuneId,
        kretstype: selectedKretstype,
        isEditing: isEditingPanel,
        isVisible: true,
      };

      const inndelingIfAlreadySelected = getInndeling(kommuneId);

      if (inndelingIfAlreadySelected && isEqualInndelinger(newInndeling, inndelingIfAlreadySelected)) {
        newInndeling.isEditing = false;
        newInndeling.isVisible = false;
      }

      selectInndeling(newInndeling);
      resetInndelingerPanel();
    }
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const inndelingIcon = (id: string, isKommune: boolean) => {
    const inndeling = inndelinger[id];

    if (selectedKretstype === "fylke") {
      if (inndeling != null) {
        return "visibility_off";
      } else {
        return "visibility";
      }
    }

    if (!isKommune) return "chevron_right";

    if (inndeling != null && inndeling.kretstype === selectedKretstype) {
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
            {KRETSTYPER.map((kretstype) => (
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
                    isActive={selectedFylkeId === fylkeId}
                    key={fylkeId}
                    onClick={() => selectFylke(fylkeId)}
                    {...(selectedKretstype !== "fylke" ? { rightIcon: inndelingIcon(fylkeId, false) } : {})}
                  >
                    {`${fylke.nummer} ${getNavnInSpraak(fylke.navn, "nor")}`}
                  </InndelingOption>
                );
              })}
          </InndelingerList>
          <Divider orientation="vertical" />
          <InndelingerList>
            {selectedFylkeId &&
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
