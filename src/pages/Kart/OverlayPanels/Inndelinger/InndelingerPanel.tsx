import { Button, ButtonGroup, Divider, Link, Modal, ModalBody, ModalContent, ModalOverlay, Spinner } from "@kvib/react";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { BaseInndeling, Inndelingtype, INNDELINGTYPER } from "contexts/InndelingerContext/InndelingerContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import useFylker from "hooks/inndelinger/useFylker";
import useKommuner from "hooks/inndelinger/useKommuner";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { getIdFromEntity } from "utils/api";
import { getNavnInSpraak } from "utils/language/language";
import { capitalize } from "utils/string-utils";
import { ModalPanel, PanelHeader } from "../Panel";
import InndelingOption from "./InndelingOption";
import useInndelingerPanel from "./useInndelingerPanel";

const InndelingerPanel = () => {
  const { closeOverlayModal } = useOverlayPanel();
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const [bopliktomraadeEditingEnabled, setBopliktomraadeEditingEnabled] = useState(false);

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
    clearInndelingerForPanel,
  } = useInndelingerPanel();

  const { fylker } = useFylker(gyldighetsdato);
  const { kommuner, isLoading: kommunerIsLoading } = useKommuner(
    activePanelFylkeId,
    gyldighetsdato,
    activePanelFylkeId != null,
  );

  useEffect(() => {
    window.enableBopliktEditing = () => {
      setBopliktomraadeEditingEnabled(true);
    };
    return () => {
      delete window.enableBopliktEditing;
    };
  }, []);

  const isInndelingtypeDisabledForEditing = (inndelingtype: Inndelingtype) => {
    if (inndelingtype === "bopliktomraade" && bopliktomraadeEditingEnabled) {
      return false;
    }
    const DISABLED_FOR_EDITING_INNDELINGTYPER: string[] = ["bopliktomraade"];
    return DISABLED_FOR_EDITING_INNDELINGTYPER.includes(inndelingtype) && isEditingPanel;
  };

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
                  isDisabled={isInndelingtypeDisabledForEditing(inndelingtype)}
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
                          ? (isInndelingSelected(selectedInndelingtype, fylkeId) ?? false)
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
              {kommuner != null
                ? activePanelFylkeId != null &&
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
                        isActive={isInndelingSelected(selectedInndelingtype, kommuneId) ?? false}
                        onClick={() => toggleKommune(kommuneInndeling)}
                        type={selectedInndelingtype === "kommune" ? "checkbox" : isEditingPanel ? "radio" : "checkbox"}
                      >
                        {`${kommune.nummer} ${getNavnInSpraak(kommune.navn, "nor")}`}
                      </InndelingOption>
                    );
                  })
                : kommunerIsLoading && (
                    <InndelingSpinnerContainer>
                      <Spinner thickness="2px" emptyColor="gray.200" color="blue.500" size="xl" />
                    </InndelingSpinnerContainer>
                  )}
            </InndelingerList>
          </InndelingerLayout>
          <Divider></Divider>
          <ButtonContainer>
            <Link
              size={"md"}
              onClick={() => {
                clearInndelingerForPanel();
                resetInndelingerPanel();
              }}
            >
              {`Nullstill ${isEditingPanel ? "redigering" : "visning"}`}
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
