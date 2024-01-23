import {
  Button,
  Divider,
  Modal,
  ModalContent,
  ModalOverlay,
} from "@kvib/react";
import { Panel, PanelHeader, PanelProps } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { styled } from "styled-components";
import {
  KRETSTYPER,
  Kretstype,
} from "contexts/InndelingerContekst/InndelingerContext";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import { useState } from "react";
import useFylker from "hooks/inndelinger/useFylker";
import useKommuner from "hooks/inndelinger/useKommuner";

const InndelingerPanel = ({ isOpen, className }: PanelProps) => {
  const [selectedKretstype, setSelectedKretstype] = useState<Kretstype | null>(
    null,
  );
  const { fylker } = useFylker();

  const [selectedFylkeId, setSelectedFylkeId] = useState<string>("");
  const { kommuner } = useKommuner(selectedFylkeId);

  const { activeOverlayModal, closeOverlayModal } = useOverlayPanel();

  const isEditing = activeOverlayModal === "inndelinger_redigering";

  const resetInndelingerPanel = () => {
    closeOverlayModal();
    setSelectedKretstype(null);
    setSelectedFylkeId("");
  };

  // TODO: avhengig av kretstype ønsker vi enten å bare se kommuner, eller legge til i kartet?
  const selectFylke = (fylkeId: string) => {
    if (selectedKretstype === "fylker") {
      // startEditingFylke();
      resetInndelingerPanel();
    } else {
      setSelectedFylkeId(fylkeId);
    }
  };

  // TODO: avhengig av kretstype ønsker vi å aktivere redigering eller synliggjøre visse kretser
  // mye av dette bør nok bo i inndelingercontext
  const selectKommune = (selectedKommuneId: string) => {
    if (selectedKretstype === "kommuner") {
      // startEditingKommune(selectedKommuneId);
    } else if (selectedKretstype === "stemmekretser") {
      // startEditingStemmekretser(selectedKommuneId)
    } else if (selectedKretstype === "grunnkretser") {
      // startEditingGrunnkretser(selectedKommuneId)
    }
    resetInndelingerPanel();
  };

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <Modal isOpen={isOpen} onClose={closeOverlayModal} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as={Panel} $isOpen={isOpen} className={className}>
        <PanelHeader onClose={closeOverlayModal}>
          Velg en inndeling du ønsker å redigere
        </PanelHeader>
        <InndelingerLayout>
          <InndelingerList>
            {KRETSTYPER.map((kretstype) => (
              <Inndeling
                key={kretstype}
                onClick={() => setSelectedKretstype(kretstype)}
                isActive={selectedKretstype === kretstype}
              >
                {capitalize(kretstype)}
              </Inndeling>
            ))}
          </InndelingerList>
          <Divider orientation="vertical" />
          <InndelingerList>
            {selectedKretstype &&
              fylker.map((fylke) => (
                <Inndeling
                  key={getIdFromEntity(fylke)}
                  onClick={() => selectFylke(getIdFromEntity(fylke))}
                  isActive={selectedFylkeId === getIdFromEntity(fylke)}
                >
                  {`${fylke.fylkesnummer.kodeverdi} ${getNavnInSpraak(
                    fylke.navn,
                    "nor",
                  )}`}
                </Inndeling>
              ))}
          </InndelingerList>
          <Divider orientation="vertical" />
          <InndelingerList>
            {selectedFylkeId &&
              kommuner.map((kommune) => (
                <Inndeling
                  key={getIdFromEntity(kommune)}
                  onClick={() => selectKommune(getIdFromEntity(kommune))}
                >
                  {`${kommune.kommunenummer.kodeverdi} ${getNavnInSpraak(
                    kommune.navn,
                    "nor",
                  )}`}
                </Inndeling>
              ))}
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

const Inndeling = styled(Button).attrs({
  variant: "ghost",
  rightIcon: "chevron_right",
})`
  height: unset;
  padding: 24px 16px;
  color: var(--kvib-colors-black);
  font-weight: var(--kvib-fontWeights-normal);

  & > div {
    width: 100%;
    justify-content: space-between;
  }
`;

export default InndelingerPanel;
