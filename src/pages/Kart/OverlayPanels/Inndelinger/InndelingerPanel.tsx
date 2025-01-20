import { Button, Link, ButtonGroup, Divider, Modal, ModalBody, ModalContent, ModalOverlay, Spinner } from "@kvib/react";
import { PanelHeader, ModalPanel } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { INNDELINGTYPER, BaseInndeling } from "contexts/InndelingerContext/InndelingerContext";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import useFylker from "hooks/inndelinger/useFylker";
import useKommuner from "hooks/inndelinger/useKommuner";
import { styled } from "styled-components";
import InndelingOption from "./InndelingOption";
import { capitalize } from "utils/string-utils";
import useInndelingerPanel from "./useInndelingerPanel";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";

const InndelingerPanel = () => {
  const { closeOverlayModal } = useOverlayPanel();
  const { gyldighetsdato } = useValgtGyldighetsdato();

  const {
    activePanelFylkeId,
    selectedInndelingtype,
    selectInndelingtype,
    toggleFylke,
    toggleKommune,
    resetInndelingerPanel,
    isEditingPanel,
    isInndelingSelected,
    isSelectionAvailable,
    selectNewInndelinger,
    resetSelection,
  } = useInndelingerPanel();

  const { fylker } = useFylker(gyldighetsdato);
  const { kommuner } = useKommuner(activePanelFylkeId, gyldighetsdato);

  return (
    <Modal isOpen={true} onClose={resetInndelingerPanel} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as={ModalPanel}>
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
                  <Spinner thickness="2px" emptyColor="gray.200" color="blue.500" size="xl" />
                </InndelingSpinnerContainer>
              )}
            </InndelingerList>
          </InndelingerLayout>
          <Divider></Divider>
          <ButtonContainer>
            <Link size={"md"} onClick={resetSelection}>
              Nullstill markering
            </Link>
            <ButtonGroup>
              <Button variant="tertiary" size={"md"} onClick={closeOverlayModal}>
                Avbryt
              </Button>
              <Button size={"md"} isDisabled={!isSelectionAvailable} onClick={selectNewInndelinger}>
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
  align-items: center;
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
