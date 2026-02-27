import {
  Button,
  ButtonGroup,
  Divider,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Search,
  Spinner,
} from "@kvib/react";
import { useFlag } from "components/FeatureToggle";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { BaseInndeling } from "contexts/InndelingerContext/InndelingerContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import useFylker from "hooks/inndelinger/useFylker";
import useKommuner from "hooks/inndelinger/useKommuner";
import useSearch from "hooks/useSearch";
import { styled } from "styled-components";
import { Inndelingtype, INNDELINGTYPE_VALUES } from "types/api";
import { getIdFromEntity } from "utils/api";
import { getInndelingtypeLabel } from "utils/inndelinger-utils";
import { getNavnInSpraak } from "utils/language/language";
import { ModalPanel, PanelHeader } from "../Panel";
import InndelingOption from "./InndelingOption";
import useInndelingerPanel from "./useInndelingerPanel";
import { usePrevious } from "hooks/usePrevious";
import { useEffect } from "react";

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
    clearInndelingerForPanel,
  } = useInndelingerPanel();

  const { inputValue, setInputValue } = useSearch();

  const { fylker } = useFylker(gyldighetsdato);
  const { kommuner, isLoading: kommunerIsLoading } = useKommuner(
    activePanelFylkeId,
    gyldighetsdato,
    activePanelFylkeId != null,
  );

  const prevActivePanelFylkeId = usePrevious(activePanelFylkeId);
  const prevSelectedInndelingtype = usePrevious(selectedInndelingtype);
  useEffect(() => {
    if (prevActivePanelFylkeId !== activePanelFylkeId || prevSelectedInndelingtype !== selectedInndelingtype) {
      setInputValue("");
    }
  }, [activePanelFylkeId, selectedInndelingtype, prevActivePanelFylkeId, prevSelectedInndelingtype, setInputValue]);

  const bopliktomraadeEditingEnabled = useFlag("BOPLIKTOMRADE_EDITING");
  const bopliktomraadeViewingEnabled = useFlag("BOPLIKTOMRADE_VIEWING");

  const isInndelingtypeDisabledForEditing = (inndelingtype: Inndelingtype) => {
    const DISABLED_FOR_EDITING_INNDELINGTYPER: string[] = [
      bopliktomraadeEditingEnabled === false ? "bopliktomraade" : "",
    ];
    return isEditingPanel && DISABLED_FOR_EDITING_INNDELINGTYPER.includes(inndelingtype);
  };

  const isInndelingtypeDisabledForViewing = (inndelingtype: Inndelingtype) => {
    const DISABLED_FOR_VIEWING_INNDELINGTYPER: string[] = [
      bopliktomraadeViewingEnabled === false ? "bopliktomraade" : "",
    ];
    return !isEditingPanel && DISABLED_FOR_VIEWING_INNDELINGTYPER.includes(inndelingtype);
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
              {INNDELINGTYPE_VALUES.map((inndelingtype) => (
                <InndelingOption
                  isDisabled={
                    isInndelingtypeDisabledForEditing(inndelingtype) || isInndelingtypeDisabledForViewing(inndelingtype)
                  }
                  key={inndelingtype}
                  isActive={selectedInndelingtype === inndelingtype}
                  onClick={() => selectInndelingtype(inndelingtype)}
                  rightIcon="chevron_right"
                  type="button"
                >
                  {getInndelingtypeLabel(inndelingtype, { pluralizeLabel: false, capitalizeLabel: true })}
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
                    inndelingtype: "FYLKE",
                  };

                  return (
                    <InndelingOption
                      isActive={
                        selectedInndelingtype === "FYLKE"
                          ? (isInndelingSelected(selectedInndelingtype, fylkeId) ?? false)
                          : activePanelFylkeId === fylkeId
                      }
                      key={fylkeId}
                      onClick={() => toggleFylke(fylkeInndeling)}
                      rightIcon={selectedInndelingtype !== "FYLKE" ? "chevron_right" : undefined}
                      type={selectedInndelingtype === "FYLKE" ? "checkbox" : "button"}
                    >
                      {`${fylke.nummer} ${getNavnInSpraak(fylke.navn, "nor")}`}
                    </InndelingOption>
                  );
                })}
            </InndelingerList>
            <Divider orientation="vertical" />

            <KommunerColumn>
              <Search
                autoFocus={activePanelFylkeId != null}
                disabled={activePanelFylkeId == null || selectedInndelingtype == null}
                value={inputValue}
                placeholder="Søk etter navn eller nummer"
                onChange={(e) => setInputValue(e.currentTarget.value)}
              />
              <InndelingerList>
                {kommuner != null
                  ? activePanelFylkeId != null &&
                    selectedInndelingtype &&
                    kommuner
                      .filter((kommune) =>
                        kommune.nummer
                          .concat(" ", getNavnInSpraak(kommune.navn, "nor"))
                          .toLowerCase()
                          .includes(inputValue.toLowerCase().trim()),
                      )
                      .map((kommune) => {
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
                            type={
                              selectedInndelingtype === "KOMMUNE" ? "checkbox" : isEditingPanel ? "radio" : "checkbox"
                            }
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
            </KommunerColumn>
          </InndelingerLayout>
          <Divider />
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
  padding: 4px;
`;

const KommunerColumn = styled(InndelingerList)`
  overflow: hidden;
`;
export default InndelingerPanel;
