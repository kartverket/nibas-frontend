import {
  Button,
  ButtonGroup,
  Divider,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
} from "@kvib/react";
import { PanelHeader, PanelProps, ModalPanel } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import {
  INNDELINGTYPER,
  BaseInndeling,
  Inndeling,
  Inndelingtype,
  useInndelinger,
} from "contexts/InndelingerContext/InndelingerContext";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import { useEffect, useState } from "react";
import useFylker from "hooks/inndelinger/useFylker";
import useKommuner from "hooks/inndelinger/useKommuner";
import { styled } from "styled-components";
import InndelingOption from "./InndelingOption";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { capitalize } from "utils/string-utils";

const InndelingerPanel = ({ isOpen }: PanelProps) => {
  const [selectedInndelingtype, setSelectedInndelingtype] = useState<Inndelingtype | null>(null);
  const [activePanelFylkeId, setActivePanelFylkeId] = useState<string>("");

  const { selectInndelinger, getAllInndelinger, setSelectedFylkeId } = useInndelinger();

  const [selectedInndelinger, setSelectedInndelinger] = useState<Inndeling[]>(getAllInndelinger());

  const { closeOverlayModal, activeOverlayModal } = useOverlayPanel();

  const { history, clearHistory } = useHistory();
  const { fylker } = useFylker();
  const { kommuner } = useKommuner(activePanelFylkeId);

  const hasUnsavedChangesInHistory = history.entries.length > 0;
  const isEditingPanel = activeOverlayModal === "inndelinger";

  useEffect(() => {
    if (isOpen) {
      isEditingPanel ? setSelectedInndelinger([]) : setSelectedInndelinger(getAllInndelinger());
    }
  }, [getAllInndelinger, isEditingPanel, isOpen]);

  const resetInndelingerPanel = () => {
    closeOverlayModal();
    setSelectedInndelingtype(null);
    setActivePanelFylkeId("");
  };

  const selectNewInndelinger = () => {
    if (hasUnsavedChangesInHistory && isEditingPanel) {
      clearHistory();
    }

    selectInndelinger(selectedInndelinger);
    resetInndelingerPanel();
  };

  const isInndelingSelected = (inndelingtype: Inndelingtype | null, inndelingId: string) => {
    if (inndelingtype == null) return false;

    const inndelingIfSelected = selectedInndelinger.find((inndeling) => {
      return inndeling.inndelingtype === inndelingtype && inndeling.id === inndelingId;
    });

    if (inndelingIfSelected != null) {
      return isEditingPanel ? inndelingIfSelected.isEditing : inndelingIfSelected.isVisible;
    }

    return false;
  };

  const selectInndelingtype = (inndelingtype: Inndelingtype) => {
    if (isEditingPanel) setSelectedInndelinger([]);

    if (selectedInndelingtype !== inndelingtype) {
      setSelectedInndelingtype(inndelingtype);
      setActivePanelFylkeId("");
    }
  };

  const toggleFylke = (fylke: BaseInndeling) => {
    if (isEditingPanel) setSelectedInndelinger([]);

    if (selectedInndelingtype === "fylke") {
      const isAlreadySelected = selectedInndelinger.findIndex(
        (inndeling) => inndeling.id === fylke.id && inndeling.inndelingtype === selectedInndelingtype,
      );

      if (isAlreadySelected < 0) {
        const newInndeling: Inndeling = {
          navn: fylke.navn,
          nummer: fylke.nummer,
          id: fylke.id,
          inndelingtype: selectedInndelingtype,
          isEditing: isEditingPanel,
          isVisible: !isEditingPanel,
        };
        setSelectedInndelinger(selectedInndelinger.concat(newInndeling));
        return;
      }

      setSelectedInndelinger(selectedInndelinger.filter((_, index) => isAlreadySelected !== index));
    } else {
      setActivePanelFylkeId(fylke.id);
      setSelectedFylkeId(fylke.id);
    }
  };

  const toggleKommune = (kommune: BaseInndeling) => {
    if (selectedInndelingtype) {
      const newInndeling: Inndeling = {
        navn: kommune.navn,
        nummer: kommune.nummer,
        id: kommune.id,
        inndelingtype: selectedInndelingtype,
        isEditing: isEditingPanel,
        isVisible: !isEditingPanel,
      };

      if (isEditingPanel) {
        if (selectedInndelingtype === "grunnkrets" || selectedInndelingtype === "stemmekrets") {
          const selectedInndelingerWithoutSelectedInndeling = selectedInndelinger.filter(
            (inndeling) => inndeling.inndelingtype !== selectedInndelingtype,
          );
          setSelectedInndelinger([...selectedInndelingerWithoutSelectedInndeling, newInndeling]);
          return;
        }
      }

      const isAlreadySelected = selectedInndelinger.findIndex(
        (inndeling) => inndeling.id === kommune.id && inndeling.inndelingtype === selectedInndelingtype,
      );

      if (isAlreadySelected === -1) {
        setSelectedInndelinger(selectedInndelinger.concat(newInndeling));
        return;
      }
      setSelectedInndelinger(selectedInndelinger.filter((_, index) => isAlreadySelected !== index).concat());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetInndelingerPanel} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as={ModalPanel} $isOpen={isOpen}>
        <PanelHeader
          onClose={resetInndelingerPanel}
          subHeading={
            isEditingPanel
              ? "Ved redigering av kommune- og fylkesgrenser må du velge inndelingene på begge sider av en grense for å kunne redigere grensen"
              : ""
          }
        >
          Velg en inndeling du ønsker å {isEditingPanel ? "redigere" : "se i kartet"}
        </PanelHeader>
        <Content>
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

                  const fylkeInndeling: BaseInndeling = {
                    id: fylkeId,
                    nummer: fylke.nummer,
                    navn: fylke.navn,
                    inndelingtype: "fylke",
                  };

                  return (
                    <InndelingOption
                      isActive={
                        selectedInndelingtype === "fylke"
                          ? isInndelingSelected(selectedInndelingtype, fylkeId)
                          : activePanelFylkeId === fylkeId
                      }
                      key={fylkeId}
                      onClick={() => toggleFylke(fylkeInndeling)}
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
              {kommuner ? (
                activePanelFylkeId &&
                selectedInndelingtype &&
                kommuner.map((kommune) => {
                  const kommuneId = getIdFromEntity(kommune);

                  const kommuneInndeling: BaseInndeling = {
                    id: kommuneId,
                    nummer: kommune.nummer,
                    navn: kommune.navn,
                    inndelingtype: selectedInndelingtype,
                  };
                  return (
                    <InndelingOption
                      key={kommuneId}
                      isActive={isInndelingSelected(selectedInndelingtype, kommuneId)}
                      onClick={() => toggleKommune(kommuneInndeling)}
                      type={selectedInndelingtype === "kommune" ? "checkbox" : isEditingPanel ? "radio" : "checkbox"}
                    >
                      {`${kommune.nummer} ${getNavnInSpraak(kommune.navn, "nor")}`}
                    </InndelingOption>
                  );
                })
              ) : (
                <InndelingSpinnerContainer>
                  <Spinner />
                </InndelingSpinnerContainer>
              )}
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
              <Button
                size={"md"}
                isDisabled={
                  !selectedInndelinger.some((inndeling) => (isEditingPanel ? inndeling.isEditing : inndeling.isVisible))
                }
                onClick={selectNewInndelinger}
              >
                {isEditingPanel ? "Rediger" : "Se"} valgte inndelinger
              </Button>
            </ButtonGroup>
          </ButtonContainer>
        </Content>
      </ModalContent>
    </Modal>
  );
};

const InndelingSpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const Content = styled(ModalBody)`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto auto;
  padding: 0;
`;

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

export default InndelingerPanel;
