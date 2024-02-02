import { Divider, Modal, ModalContent, ModalOverlay } from "@kvib/react";
import { Panel, PanelHeader, PanelProps } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import {
  KRETSTYPER,
  Kretstype,
  useInndelinger,
} from "contexts/InndelingerContekst/InndelingerContext";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import { useState } from "react";
import useFylker from "hooks/inndelinger/useFylker";
import useKommuner from "hooks/inndelinger/useKommuner";
import { styled } from "styled-components";
import Inndeling from "./Inndeling";

const InndelingerPanel = ({ isOpen, className }: PanelProps) => {
  const [selectedKretstype, setSelectedKretstype] = useState<Kretstype | null>(
    null,
  );
  const [selectedFylkeId, setSelectedFylkeId] = useState<string>("");
  const { inndelinger, selectInndeling } = useInndelinger();
  const { activeOverlayModal, closeOverlayModal } = useOverlayPanel();

  const { fylker } = useFylker();
  const { kommuner } = useKommuner(selectedFylkeId);

  const isEditing = activeOverlayModal === "inndelinger-redigering";

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
    if (selectedKretstype === "fylker") {
      selectInndeling(fylkeId, "fylker", isEditing);
      if (isEditing) {
        resetInndelingerPanel();
      }
    } else {
      setSelectedFylkeId(fylkeId);
    }
  };

  const selectKommune = (kommuneId: string) => {
    if (selectedKretstype) {
      selectInndeling(kommuneId, selectedKretstype, isEditing);
    }
    if (isEditing) {
      resetInndelingerPanel();
    }
  };

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const inndelingIcon = (id: string, fylkeIcon?: boolean) => {
    const inndeling = inndelinger[id];
    if (isEditing || (fylkeIcon && selectedKretstype !== "fylker")) {
      return "chevron_right";
    }
    if (inndeling && inndeling.isVisible) {
      return "visibility";
    }
    return "visibility_off";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetInndelingerPanel}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={Panel} $isOpen={isOpen} className={className}>
        <PanelHeader onClose={resetInndelingerPanel}>
          Velg en inndeling du ønsker å {isEditing ? "redigere" : "vise"}
        </PanelHeader>
        <InndelingerLayout>
          <InndelingerList>
            {KRETSTYPER.map((kretstype) => (
              <Inndeling
                key={kretstype}
                isActive={selectedKretstype === kretstype}
                onClick={() => selectKretstype(kretstype)}
                rightIcon="chevron_right"
                kretstype={null}
              >
                {capitalize(kretstype)}
              </Inndeling>
            ))}
          </InndelingerList>
          <Divider orientation="vertical" />
          <InndelingerList>
            {selectedKretstype &&
              fylker.map((fylke) => {
                const fylkeId = getIdFromEntity(fylke);
                return (
                  <Inndeling
                    key={fylkeId}
                    isActive={selectedFylkeId === fylkeId}
                    onClick={() => selectFylke(fylkeId)}
                    rightIcon={inndelingIcon(fylkeId, true)}
                    kretstype="fylker"
                  >
                    {`${fylke.fylkesnummer.kodeverdi} ${getNavnInSpraak(
                      fylke.navn,
                      "nor",
                    )}`}
                  </Inndeling>
                );
              })}
          </InndelingerList>
          <Divider orientation="vertical" />
          <InndelingerList>
            {selectedFylkeId &&
              kommuner.map((kommune) => {
                const kommuneId = getIdFromEntity(kommune);
                return (
                  <Inndeling
                    key={kommuneId}
                    isActive={selectedFylkeId === kommuneId}
                    onClick={() => selectKommune(kommuneId)}
                    rightIcon={inndelingIcon(kommuneId)}
                    kretstype={selectedKretstype}
                  >
                    {`${kommune.kommunenummer.kodeverdi} ${getNavnInSpraak(
                      kommune.navn,
                      "nor",
                    )}`}
                  </Inndeling>
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
