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

  const { selectInndelinger, getAllInndelinger, setSelectedFylkeId, getNewInndeling, setSelectedFlatedataInndeling } =
    useInndelinger();

  const [selectedInndelinger, setSelectedInndelinger] = useState<Inndeling[]>(getAllInndelinger());

  const { closeOverlayModal, activeOverlayModal, openOverlayModal } = useOverlayPanel();

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

  const toggleFylke = (fylkeId: string) => {
    if (isEditingPanel) setSelectedInndelinger([]);

    if (selectedInndelingtype === "fylke") {
      const isAlreadySelected = selectedInndelinger.findIndex(
        (inndeling) => inndeling.id === fylkeId && inndeling.inndelingtype === selectedInndelingtype,
      );

      if (isAlreadySelected < 0) {
        const newInndeling: Inndeling = {
          id: fylkeId,
          inndelingtype: selectedInndelingtype,
          isEditing: isEditingPanel,
          isVisible: !isEditingPanel,
        };
        setSelectedInndelinger(selectedInndelinger.concat(newInndeling));
        return;
      }

      setSelectedInndelinger(selectedInndelinger.filter((_, index) => isAlreadySelected !== index));
    } else {
      setActivePanelFylkeId(fylkeId);
      setSelectedFylkeId(fylkeId);
    }
  };

  const toggleKommune = (kommuneId: string) => {
    if (selectedInndelingtype) {
      const newInndeling: Inndeling = {
        id: kommuneId,
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
                  return (
                    <InndelingOption
                      isActive={
                        selectedInndelingtype === "fylke"
                          ? isInndelingSelected(selectedInndelingtype, fylkeId)
                          : activePanelFylkeId === fylkeId
                      }
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
              {kommuner ? (
                activePanelFylkeId &&
                kommuner.map((kommune) => {
                  const kommuneId = getIdFromEntity(kommune);
                  return (
                    <FlatedataWrapper key={kommuneId}>
                      <InndelingOption
                        isActive={isInndelingSelected(selectedInndelingtype, kommuneId)}
                        onClick={() => toggleKommune(kommuneId)}
                        type={selectedInndelingtype === "kommune" ? "checkbox" : isEditingPanel ? "radio" : "checkbox"}
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

const FlatedataWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export default InndelingerPanel;
