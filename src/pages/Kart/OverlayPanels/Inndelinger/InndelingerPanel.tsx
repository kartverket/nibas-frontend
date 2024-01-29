import {
  Button,
  Divider,
  Modal,
  ModalContent,
  ModalOverlay,
} from "@kvib/react";
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

const InndelingerPanel = ({ isOpen, className }: PanelProps) => {
  const [selectedKretstype, setSelectedKretstype] = useState<Kretstype | null>(
    null,
  );
  const { fylker } = useFylker();
  const { inndelinger } = useInndelinger();

  const [selectedFylkeId, setSelectedFylkeId] = useState<string>("");
  const { kommuner } = useKommuner(selectedFylkeId);

  const { activeOverlayModal, closeOverlayModal } = useOverlayPanel();

  const isEditing = activeOverlayModal === "inndelinger-redigering";

  const { selectInndeling } = useInndelinger();

  const resetInndelingerPanel = () => {
    closeOverlayModal();
    setSelectedKretstype(null);
    setSelectedFylkeId("");
  };

  const selectKretstype = (kretstype: Kretstype) => {
    setSelectedKretstype(kretstype);
    setSelectedFylkeId("");
  };

  // TODO: Overlapper en del med selectKommune, kanskje lurt å slå sammen
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

  // TODO: Overlapper en del med selectFylke, kanskje lurt å slå sammen
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

const Inndeling = styled(Button).attrs({
  variant: "ghost",
})`
  height: unset;
  padding: 24px 16px;
  color: var(--kvib-colors-black);
  font-weight: var(--kvib-fontWeights-normal);

  & > div {
    width: 100%;
    justify-content: space-between;
  }

  &[data-active] {
    background: var(--kvib-colors-blue-50);
  }
`;

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
