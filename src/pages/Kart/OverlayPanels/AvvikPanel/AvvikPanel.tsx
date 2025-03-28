import { Fragment, useEffect, useState } from "react";
import { PanelHeader, SidePanel } from "../Panel";
import { useOverlayPanel } from "../../../../contexts/OverlayPanelContext";
import { Container, Divider, IconButton, Text } from "@kvib/react";
import AvvikRow from "./AvvikRow";
import AvvikRowKommuner from "./AvvikRowKommuner";
import { AvvikContent, AvvikResponse, KommunerMedAvvik, PaginationInfo, useAvvik } from "./Avvik";
import styled from "styled-components";

export const AvvikPanel = () => {
  const { getKommunerMedAvvik, getAvvik, goToCoordinates, updateFylkeIdAndKommuneId } = useAvvik();
  const { closeOverlayPanel } = useOverlayPanel();

  // State for liste over alle kommuner med avvik:
  const [kommunerMedAvvikData, setKommunerMedAvvik] = useState<KommunerMedAvvik[]>([]);

  // State for avvik i én valgt kommune:
  const [avvikData, setAvvikData] = useState<AvvikContent[]>([]);

  // State for hvilken kommune som er valgt:
  const [selectedKommuneId, setSelectedKommuneId] = useState<string | null>(null);
  const [selectedKommuneNavn, setSelectedKommuneNavn] = useState<string>("");
  const [selectedKommuneNummer, setSelectedKommuneNummer] = useState<string>("");

  // Pagination
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const size = 1000;

  // ========== 1. Hent kommuner med avvik én gang ==========
  useEffect(() => {
    const fetchKommunerMedAvvik = async () => {
      const kommuner = await getKommunerMedAvvik();
      setKommunerMedAvvik(kommuner);
    };
    fetchKommunerMedAvvik();
  }, [getKommunerMedAvvik]);

  // ========== 2. Hent avvik for "selectedKommuneId" ==========
  useEffect(() => {
    // Kjør bare hvis vi faktisk har en valgt kommune
    if (selectedKommuneId == null) {
      return;
    }
    const fetchAvvik = async () => {
      const avvik: AvvikResponse = await getAvvik(selectedKommuneId, currentPage, size);
      setAvvikData(avvik.content);
      setPagination({
        totalPages: avvik.totalPages,
        totalElements: avvik.totalElements,
        size: avvik.size,
        number: avvik.number,
        first: avvik.first,
        last: avvik.last,
      });
    };

    fetchAvvik();
  }, [selectedKommuneId, currentPage, getAvvik]);

  // ========== 3. Klikk på en kommune i lista =============
  const handleRowClickForKommune = (fylkeId: string, kommuneId: string, kommuneNavn: string, kommuneNummer: string) => {
    setSelectedKommuneId(kommuneId);
    setSelectedKommuneNavn(kommuneNavn);
    setSelectedKommuneNummer(kommuneNummer);

    updateFylkeIdAndKommuneId(fylkeId, kommuneId);
  };

  // ========== 4. Pagination-handling =====================
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleBackButton = () => {
    setSelectedKommuneId(null);
    updateFylkeIdAndKommuneId("", "");
    setAvvikData([]);
    setPagination(null);
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
          {avvikData.length === 0 && <Fragment>Laster avvik...</Fragment>}
          {avvikData.map((row) => (
            <Fragment key={row.id}>
              <AvvikRow
                kommuner={row.kommuner}
                avvikId={row.id}
                antallKoordinaterMedAvvik={row.antallKoordinaterMedAvvik}
                koordinatAvvikNibas={row.koordinaterMedAvvik
                  .map((koordinat) => koordinat.nibasKoordinat.coordinates)
                  .flat()}
                goToCoordinates={goToCoordinates}
              />
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
      ) : (
        // ========== VIS KOMMUNER med avvik (ingenting valgt enda) ==========
        <>
          <PanelHeader onClose={closeOverlayPanel}>Avvik fra matrikkelen {}</PanelHeader>
          {kommunerMedAvvikData.map((kommune) => (
            <Fragment key={kommune.kommunelokalid}>
              <AvvikRowKommuner
                fylkeId={kommune.fylkeslokalid}
                kommuneId={kommune.kommunelokalid}
                kommuneNavn={kommune.kommunenavn}
                kommuneNummer={kommune.kommunenummer}
                antallAvvik={kommune.antallAvvik}
                handleGoToKommuneClick={handleRowClickForKommune}
              />
              <Divider />
            </Fragment>
          ))}
        </>
      )}
    </SidePanel>
  );
};
// TODO: Erstatte med kvib-vars
export const PaginationButton = styled.button`
  font-weight: 500;
  font-size: 0.875rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaginationSpan = styled.span`
  font-size: 0.875rem;
`;
const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding: 1rem;
  gap: var(--kvib-spacing-12);
`;
