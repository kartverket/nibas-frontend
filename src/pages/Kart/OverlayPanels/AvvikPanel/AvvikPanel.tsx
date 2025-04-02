import { Fragment, useEffect, useState } from "react";
import { PanelHeader, SidePanel } from "../Panel";
import { useOverlayPanel } from "../../../../contexts/OverlayPanelContext";
import { Divider, IconButton, Spinner, Text } from "@kvib/react";
import AvvikRow from "./AvvikRow";
import AvvikRowKommuner from "./AvvikRowKommuner";
import { AvvikForKommuneResponse, KommunerMedAvvik, PaginationInfo } from "./avvik-utils";
import { useAvvik } from "./useAvvik";
import { styled } from "styled-components";
import { Inndeling, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";

export const AvvikPanel = () => {
  const {
    getKommunerMedAvvik,
    getAvvik,
    handleGoToCoordinatesAndFetchMatrikkel,
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
  // ========== 1. Hent kommuner med avvik én gang ==========
  useEffect(() => {
    const fetchKommunerMedAvvik = async () => {
      const kommuner = await getKommunerMedAvvik(currentPage, size);
      // setKommunerMedAvvik(kommuner);
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
  }, [getKommunerMedAvvik, currentPage]);

  // ========== Hvis inndeling allerede valgt henter vi automatisk avvik for den kommunen ==========
  useEffect(() => {
    if (currentlyEditingInndelinger.length === 1 && selectedInndelinger[0] !== undefined && selectedFylkeId !== "") {
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
        setAvvikData(avvik);
      } finally {
        setIsLoadingAvvik(false);
      }
    };

    fetchAvvik();
  }, [selectedKommuneId, getAvvik]);

  // ==========  Fjerner avviksraden fra listen (ved "Utført" f.eks) =====================
  const handleRemoveRow = (avvikId: number) => {
    setAvvikData((prevRows) => prevRows.filter((row) => row.id !== avvikId)); // Remove the row
  };

  const handleBackButton = () => {
    setSelectedKommuneId(null);
    setAvvikData([]);
    setPagination(null);
    setSelectedInndelinger([]);
    setSelectedKommuneNavn("");
    setSelectedKommuneNummer("");
    setSelectedAvvikId(null);
    setSelectedFylkeId("");
    setCurrentPage(0);
    resetInndeling();
  };
  return (
    <SidePanel>
      {/* ========== VISER ENTEN Avvik-liste for valgt kommune ELLER Kommuneliste ========== */}
      {selectedKommuneId != null ? (
        // ========== VIS AVVIK for den valgte kommunen ==========
        <>
          <PanelHeader onClose={closeOverlayPanel}>
            <IconButton aria-label="Tilbake" icon="arrow_back" onClick={() => handleBackButton()}></IconButton>
            <Text width={"100%"} fontSize={"lg"} padding={"12px"} gap={"var(--kvib-spacing-12)"}>
              Avvik for {selectedKommuneNummer + " " + selectedKommuneNavn}
            </Text>
          </PanelHeader>
          {isLoadingAvvik && (
            <AvvikSpinnerContainer>
              <Spinner thickness="2px" emptyColor="gray.200" color="blue.500" size="xl" />
            </AvvikSpinnerContainer>
          )}

          {!isLoadingAvvik &&
            avvikData?.map((row) => (
              <Fragment key={row.id}>
                <AvvikRow
                  avvikItem={row}
                  handleGoToCoordinatesAndFetchMatrikkel={handleGoToCoordinatesAndFetchMatrikkel}
                  selectedAvvikId={selectedAvvikId}
                  setSelectedAvvikId={setSelectedAvvikId}
                  onRemoveRow={handleRemoveRow}
                  updateStatusForAvvik={updateStatusForAvvik}
                />
                <Divider />
              </Fragment>
            ))}
        </>
      ) : (
        // ========== VIS KOMMUNER med avvik (ingenting valgt enda) ==========
        <>
          <PanelHeader onClose={closeOverlayPanel}>Avvik fra matrikkelen {}</PanelHeader>
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
