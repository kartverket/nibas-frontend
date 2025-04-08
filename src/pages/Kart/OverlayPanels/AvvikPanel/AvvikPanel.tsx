import { Fragment, useEffect, useState } from "react";
import { PanelHeader, SidePanel } from "../Panel";
import { useOverlayPanel } from "../../../../contexts/OverlayPanelContext";
import { Divider, IconButton, Spinner, Tab, TabList, TabPanels, Tabs, Text } from "@kvib/react";
import AvvikRow from "./AvvikRow";
import AvvikRowKommuner from "./AvvikRowKommuner";
import { AvvikForKommuneResponse, KommunerMedAvvik, PaginationInfo, AvvikStatus } from "./avvik-utils";
import { useAvvik } from "./useAvvik";
import { styled } from "styled-components";
import { Inndeling, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";

export const AvvikPanel = () => {
  const {
    getKommunerMedAvvik,
    getAvvik,
    addInndelingForAvvik,
    goToCoordinatesAndFetchMatrikkel,
    updateFylkeIdAndKommuneId,
    resetInndeling,
    updateStatusForAvvik,
  } = useAvvik();
  const { closeOverlayPanel } = useOverlayPanel();
  const { getAllInndelinger, setSelectedFylkeId, currentlyEditingInndelinger, selectedFylkeId } = useInndelinger();
  const [selectedInndelinger, setSelectedInndelinger] = useState<Inndeling[]>(getAllInndelinger());

  // State for liste over alle kommuner med avvik:
  const [kommunerMedAvvikData, setKommunerMedAvvik] = useState<KommunerMedAvvik[]>([]);

  // State for avvik i én valgt kommune:
  const [avvikData, setAvvikData] = useState<AvvikForKommuneResponse>([]);

  // State for hvilken kommune som er valgt:
  const [selectedKommuneId, setSelectedKommuneId] = useState<string | null>(null);
  const [selectedKommuneNavn, setSelectedKommuneNavn] = useState<string>("");
  const [selectedKommuneNummer, setSelectedKommuneNummer] = useState<string>("");

  // Pagination
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const size = 15;

  // Loading
  const [isLoadingAvvik, setIsLoadingAvvik] = useState<boolean>(false);

  // Viser hvilken rad som er valgt (avvik)
  const [selectedAvvikId, setSelectedAvvikId] = useState<number | null>(null);

  // Gjør kall til API for å oppdatere status på avviket, men oppdaterer bare lokalt i state for å slippe fetching hver gang
  const updateStatusForAvvikLokalt = async (avvikId: number, status: string): Promise<boolean> => {
    const res = await updateStatusForAvvik(avvikId, status);
    if (res === true) {
      setAvvikData((prev) => prev.map((item) => (item.id === avvikId ? { ...item, status: status } : item)));
      return true;
    }
    return false;
  };

  // ==========  Hent kommuner med avvik én gang ==========
  useEffect(() => {
    const fetchKommunerMedAvvik = async () => {
      const kommuner = await getKommunerMedAvvik(currentPage, size);
      setKommunerMedAvvik(kommuner.content);
      setPagination({
        totalPages: kommuner.totalPages,
        totalElements: kommuner.totalElements,
        size: kommuner.size,
        number: kommuner.number,
        first: kommuner.first,
        last: kommuner.last,
      });
    };
    fetchKommunerMedAvvik();
  }, [getKommunerMedAvvik, currentPage, selectedKommuneId]);

  // ========== Hvis inndeling allerede valgt henter vi automatisk avvik for den kommunen ==========
  useEffect(() => {
    if (currentlyEditingInndelinger.length > 0 && selectedInndelinger[0] !== undefined && selectedFylkeId !== "") {
      const inndeling = selectedInndelinger[0];
      setSelectedKommuneId(inndeling.id);
      setSelectedKommuneNavn(inndeling.navn[0].navn);
      setSelectedKommuneNummer(inndeling.nummer);
    }
  }, [currentlyEditingInndelinger, selectedInndelinger, selectedFylkeId]);

  // ========== Klikk på en kommune i lista =============
  const handleRowClickForKommune = (fylkeId: string, kommuneId: string, kommuneNavn: string, kommuneNummer: string) => {
    setSelectedKommuneId(kommuneId);
    setSelectedKommuneNavn(kommuneNavn);
    setSelectedKommuneNummer(kommuneNummer);

    updateFylkeIdAndKommuneId(fylkeId, kommuneId);
  };

  // ==========  Pagination-handling =====================
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // ========== Hent avvik for valgt kommune ==========
  useEffect(() => {
    if (selectedKommuneId == null) {
      return;
    }
    const fetchAvvik = async () => {
      setIsLoadingAvvik(true);
      try {
        const avvik = await getAvvik(selectedKommuneId);
        setAvvikData([...avvik]);
      } finally {
        setIsLoadingAvvik(false);
      }
    };

    fetchAvvik();
  }, [selectedKommuneId, getAvvik]);

  const handleBackButton = () => {
    setSelectedKommuneId(null);
    setAvvikData([]);
    setSelectedInndelinger([]);
    setSelectedKommuneNavn("");
    setSelectedKommuneNummer("");
    setSelectedAvvikId(null);
    setSelectedFylkeId(null);
    setTabIndex(0);
    resetInndeling();
  };
  const [tabIndex, setTabIndex] = useState(0);
  const tabList = [
    { label: "Uløst", value: AvvikStatus.NY },
    { label: "Løst", value: AvvikStatus.FIKSET },
    { label: "Utsatt", value: AvvikStatus.VENT },
  ];

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };
  const getAvvikCountByStatus = (status: string): number => {
    return avvikData.filter((row) => row.status === status).length;
  };
  return (
    <SidePanel>
      {/* ========== VISER ENTEN Avvik-liste for valgt kommune ELLER Kommuneliste ========== */}
      {selectedKommuneId != null ? (
        // ========== VIS AVVIK for den valgte kommunen ==========
        <>
          <AvvikPanelHeader onClose={closeOverlayPanel}>
            <IconButton aria-label="Tilbake" icon="arrow_back" onClick={() => handleBackButton()}></IconButton>
            <Text width={"100%"} fontSize={"lg"} padding={"12px"} gap={"var(--kvib-spacing-12)"}>
              Avvik for {selectedKommuneNummer + " " + selectedKommuneNavn}
            </Text>
          </AvvikPanelHeader>
          <AvvikTabs size="md" index={tabIndex} onChange={handleTabsChange}>
            <AvvikTabList>
              {tabList.map((tab) => (
                <AvvikTab key={tab.value}>
                  {tab.label} ({getAvvikCountByStatus(tab.value)})
                </AvvikTab>
              ))}
            </AvvikTabList>
            <AvvikTabPanels>
              {isLoadingAvvik && (
                <AvvikSpinnerContainer>
                  <Spinner thickness="2px" emptyColor="gray.200" color="blue.500" size="xl" />
                </AvvikSpinnerContainer>
              )}
              {isLoadingAvvik ? (
                <AvvikSpinnerContainer>
                  <Spinner thickness="2px" emptyColor="gray.200" color="blue.500" size="xl" />
                </AvvikSpinnerContainer>
              ) : (
                avvikData
                  ?.filter((row) => row.status.toLowerCase() === tabList[tabIndex].value.toLowerCase())
                  .map((row) => (
                    <Fragment key={row.id}>
                      <AvvikRow
                        avvikItem={row}
                        addInndelingForAvvik={addInndelingForAvvik}
                        goToCoordinatesAndFetchMatrikkel={goToCoordinatesAndFetchMatrikkel}
                        selectedAvvikId={selectedAvvikId}
                        setSelectedAvvikId={setSelectedAvvikId}
                        updateStatusForAvvik={updateStatusForAvvikLokalt}
                        onStatusUpdated={(id: number, nyStatus: AvvikStatus) => {
                          setAvvikData((prev) =>
                            prev.map((item) => (item.id === id ? { ...item, status: nyStatus } : item)),
                          );
                        }}
                      />
                      <Divider />
                    </Fragment>
                  ))
              )}
            </AvvikTabPanels>
          </AvvikTabs>
        </>
      ) : (
        // ========== VIS KOMMUNER med avvik, første steg ==========
        <>
          <AvvikPanelHeader onClose={closeOverlayPanel}>Avvik fra matrikkelen {}</AvvikPanelHeader>
          {kommunerMedAvvikData.map((row) => (
            <Fragment key={row.kommuneLokalID}>
              <AvvikRowKommuner kommuneMedAvvikItem={row} handleGoToKommuneClick={handleRowClickForKommune} />
              <Divider />
            </Fragment>
          ))}
          {pagination && (
            <PaginationContainer>
              <PaginationButton disabled={pagination.first} onClick={() => handlePageChange(currentPage - 1)}>
                Forrige
              </PaginationButton>
              <PaginationSpan>
                Side {pagination.number + 1} av {pagination.totalPages}
              </PaginationSpan>
              <PaginationButton disabled={pagination.last} onClick={() => handlePageChange(currentPage + 1)}>
                Neste
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      )}
    </SidePanel>
  );
};

const AvvikPanelHeader = styled(PanelHeader)`
  border: none;
  margin-bottom: 8px;
`;
export const PaginationButton = styled.button`
  font-weight: var(--kvib-fontWeights-normal);
  font-size: var(--kvib-fontSizes-md);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationSpan = styled.span`
  font-size: var(--kvib-fontSizes-sm);
  padding: var(--kvib-space-1);
`;
const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: var(--kvib-space-4);
  padding: var(--kvib-space-4);
  gap: var(--kvib-spacing-12);
`;

const AvvikSpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const AvvikTabs = styled(Tabs)`
  display: grid;
  grid-template-rows: auto 1fr;
  width: calc(100%);

  /* margin: 0 calc(var(--panel-padding) * -1); */
  overflow: hidden;
`;

const AvvikTabList = styled(TabList)`
  position: relative;
  overflow-x: auto;
  border-bottom: none;
  box-shadow: inset 0 -2px var(--kvib-colors-chakra-border-color);
  padding-left: 16px;

  &::after {
    content: "";
    position: sticky;
    top: 0;
    right: 0;
    margin-bottom: 2px;
    background: linear-gradient(to right, transparent, white);
  }
`;

const AvvikTabPanels = styled(TabPanels)`
  height: 100%;
  overflow: hidden;
`;

const AvvikTab = styled(Tab)`
  white-space: nowrap;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
`;
