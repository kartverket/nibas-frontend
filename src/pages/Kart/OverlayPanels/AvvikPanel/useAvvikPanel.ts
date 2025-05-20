import { useCallback, useEffect, useState } from "react";
import { useAuthentication } from "../../../../components/Authentication/AuthenticationHook";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { Inndeling, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { clearMatrikkelLayer, getMatrikkelFeatures } from "utils/map/layers";
import {
  AvvikForKommuneResponse,
  AvvikKommunerResponse,
  AvvikPanelProps,
  AvvikRowKommunerProps,
  AvvikRowProps,
  AvvikStatus,
  KommuneIAvvik,
  KommuneMedAvvik,
  PaginationInfo,
} from "./avvik-utils";
import { centerOnCoordinate } from "../NavigasjonPanel/koordinater-utils";
import { useKommune } from "hooks/inndelinger/useKommuner";
import { resetMapView } from "utils/map/map-utils";
import { avvikFetcher, avvikKommunerFetcher, avvikUpdateStatus } from "./useAvvik";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
export const useAvvikPanel = () => {
  const { closeOverlayPanel, activeOverlayModal } = useOverlayPanel();
  const { token } = useAuthentication();
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const {
    selectInndelinger,
    setSelectedFylkeIds,
    selectedFylkeIds,
    currentlyEditingInndelinger,
    setShouldZoom,
    clearEditLayerAndInndelinger,
    getAllInndelinger,
  } = useInndelinger();
  const [selectedInndelinger, setSelectedInndelinger] = useState<Inndeling[]>(getAllInndelinger());
  const [selectedKommuneId, setSelectedKommuneId] = useState<string>("");
  const { kommune: selectedKommune, isLoading: isLoadingKommune } = useKommune(
    selectedKommuneId ?? "",
    gyldighetsdato,
    !!selectedKommuneId,
  );
  const [secondKommuneId, setSecondKommuneId] = useState<string | null>(null);
  const { kommune: secondKommune, isLoading: isLoadingSecondKommune } = useKommune(
    secondKommuneId ?? "",
    gyldighetsdato,
    !(secondKommuneId == null),
  );

  const [kommunerMedAvvikData, setKommunerMedAvvik] = useState<KommuneMedAvvik[]>([]);
  const [avvikData, setAvvikData] = useState<AvvikForKommuneResponse>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLoadingAvvik, setIsLoadingAvvik] = useState<boolean>(false);
  const [selectedAvvikId, setSelectedAvvikId] = useState<number | null>(null);

  // Oppdaterer avvikstatus, optimistisk
  const updateStatus = async (avvikId: number, status: AvvikStatus): Promise<boolean> => {
    const previousData = avvikData;
    setAvvikData((prev) => prev.map((item) => (item.id === avvikId ? { ...item, status } : item)));
    const id = avvikId;
    const updates = [{ id, status }];
    const success = await avvikUpdateStatus(updates, token);
    if (success?.ok) {
      return true;
    } else {
      setAvvikData(previousData); // Setter tilbake igjen ved feil i kallet
      return false;
    }
  };

  const findSecondKommune = (kommunerFromRow: KommuneIAvvik[]) => {
    const secondKommuneFromRow = kommunerFromRow.find((k) => k.kommuneLokalID !== selectedKommuneId);
    if (secondKommuneFromRow === undefined) {
      return;
    }
    setSecondKommuneId(secondKommuneFromRow.kommuneLokalID);
  };

  const handleInndelingForAvvik = useCallback(() => {
    if (selectedKommune && !isLoadingKommune) {
      const inndelingtype = "kommune";
      const newInndeling: Inndeling = {
        navn: selectedKommune.navn,
        nummer: selectedKommune.nummer,
        id: selectedKommune.id.lokalid.value,
        inndelingtype: inndelingtype,
        isEditing: true,
        isViewing: false,
      };

      const isAlreadySelected = currentlyEditingInndelinger.some(
        (inndeling) => inndeling.id === selectedKommune.id.lokalid.value,
      );

      if (!isAlreadySelected) {
        setShouldZoom(true);
        selectInndelinger([newInndeling]);
      }
    }

    // Per nå 07.04.25 er det kun en fylkeid om gangen, brukeren ser derfor ikke at det  blir lagt til flere kommuner dersom de er i et annet fylke f.eks Oslo og legger så til Bærum.
    // Men man kan fortsatt redigere da grensa i mellom
    if (secondKommune && !isLoadingSecondKommune) {
      const currentMainInndeling = currentlyEditingInndelinger.find((inndeling) => inndeling.id === selectedKommuneId);

      if (currentMainInndeling) {
        const isAlreadySelected = currentlyEditingInndelinger.some(
          (inndeling) => inndeling.id === secondKommune.id.lokalid.value,
        );

        if (!isAlreadySelected) {
          const inndelingtype = "kommune";
          const newInndeling: Inndeling = {
            navn: secondKommune.navn,
            nummer: secondKommune.nummer,
            id: secondKommune.id.lokalid.value,
            inndelingtype: inndelingtype,
            isEditing: true,
            isViewing: false,
          };

          setShouldZoom(false);
          selectInndelinger([currentMainInndeling, newInndeling]);

          setTimeout(() => {
            setShouldZoom(true);
          }, 4000);
        }
      }
    }
  }, [
    selectedKommune,
    secondKommune,
    isLoadingKommune,
    isLoadingSecondKommune,
    currentlyEditingInndelinger,
    selectedKommuneId,
    setShouldZoom,
    selectInndelinger,
  ]);

  useEffect(() => {
    handleInndelingForAvvik();
  }, [handleInndelingForAvvik]);

  const getKommunerMedAvvik: (page: number) => Promise<AvvikKommunerResponse> = useCallback(
    async (page: number) => {
      const paginationSize = 15;
      const result = await avvikKommunerFetcher(token, page, paginationSize);
      return {
        content: result.content,
        totalPages: result.totalPages,
        totalElements: result.totalElements,
        size: result.size,
        number: result.number,
        first: result.first,
        last: result.last,
        empty: result.empty,
      };
    },
    [token],
  );

  const getAvvikForKommune: (pKommuneId: string) => Promise<AvvikForKommuneResponse> = useCallback(
    async (pKommuneId) => {
      const result = await avvikFetcher(token, pKommuneId);
      return result;
    },
    [token],
  );
  const goToCoordinatesAndFetchMatrikkel = async (coordinates: number[]): Promise<boolean> => {
    let zoomLevel = 30;
    const minZoomLevel = 20;
    // Her forsøker vi mindre zoom helt til matrikkelFeatures har innhold, eller zoomLevel er mindre enn minZoomLevel
    // pga ikke alltid finner man ikke nærliggende matr.grenser ved maks zoom.
    while (zoomLevel >= minZoomLevel) {
      centerOnCoordinate(coordinates[1], coordinates[0], zoomLevel, 0);
      const matrikkelGrenser = await getMatrikkelFeatures();
      if (matrikkelGrenser && matrikkelGrenser.length > 0) {
        return true;
      }
      zoomLevel--;
    }
    return false;
  };

  // ========== Hent avvik for valgt kommune ==========
  useEffect(() => {
    if (selectedKommuneId == null || selectedKommuneId === "") {
      return;
    }
    const fetchAvvik = async () => {
      setIsLoadingAvvik(true);
      try {
        const avvik = await getAvvikForKommune(selectedKommuneId);
        setAvvikData([...avvik]);
      } finally {
        setIsLoadingAvvik(false);
      }
    };

    fetchAvvik();
  }, [selectedKommuneId, getAvvikForKommune]);

  // ==========  Hent kommuner med avvik én gang ==========
  useEffect(() => {
    if (!selectedKommune) {
      const fetchKommunerMedAvvik = async () => {
        const kommuner = await getKommunerMedAvvik(currentPage);
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
    }
  }, [getKommunerMedAvvik, currentPage, selectedKommuneId, token, selectedKommune]);

  // ========== Hvis inndeling allerede valgt henter vi automatisk avvik for den kommunen ==========
  useEffect(() => {
    if (activeOverlayModal === "inndelinger") {
      closeOverlayPanel(); // Gjør det enkelt og lukker avvikPanel hvis inndelinger-modal er åpen
    }
    if (currentlyEditingInndelinger.length > 0 && selectedFylkeIds.length > 0) {
      const inndeling = currentlyEditingInndelinger[0];
      setSelectedKommuneId(inndeling.id);
    }
  }, [
    currentlyEditingInndelinger,
    selectedInndelinger,
    selectedFylkeIds,
    setSelectedKommuneId,
    activeOverlayModal,
    closeOverlayPanel,
  ]);

  const resetAvvikPanel = () => {
    setSelectedKommuneId("");
    setSelectedFylkeIds([]);
    setSecondKommuneId(null);
    selectInndelinger([]);
    setShouldZoom(true);
    setAvvikData([]);
    setSelectedInndelinger([]);
    setSelectedAvvikId(null);
    clearEditLayerAndInndelinger();
    clearMatrikkelLayer();
    resetMapView();
  };
  const handleGoToKommuneClick = async (kommuneLokalID: string) => {
    const kommune = kommunerMedAvvikData.find((k) => k.kommuneLokalID === kommuneLokalID);
    if (kommune == null) {
      return;
    }

    const fylkeId = kommune.fylkesLokalID;
    if (fylkeId !== null && fylkeId !== undefined && !selectedFylkeIds.includes(fylkeId)) {
      setSelectedFylkeIds([...selectedFylkeIds, fylkeId]);
    }

    setSelectedKommuneId(kommuneLokalID);
  };
  const avvikRowProps: AvvikRowProps = {
    goToCoordinatesAndFetchMatrikkel,
    findSecondKommune,
    selectedAvvikId,
    setSelectedAvvikId,
    updateStatus,
  };
  const avvikPanelProps: AvvikPanelProps = {
    isLoadingAvvik,
    selectedKommune,
    avvikData,
    setAvvikData,
    kommunerMedAvvikData,
    pagination,
    currentPage,
    setCurrentPage,
    resetAvvikPanel,
    handleGoToKommuneClick,
  };
  const avvikRowKommunerProps: AvvikRowKommunerProps = {
    kommuneMedAvvikItem: {} as KommuneMedAvvik,
    handleGoToKommuneClick,
  };
  return {
    avvikPanelProps, // Panel
    avvikRowKommunerProps, // AvvikRowKommuner
    avvikRowProps, // AvvikRow
  };
};
