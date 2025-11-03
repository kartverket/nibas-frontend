import { useToast } from "@kvib/react";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { Inndeling, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useKommune } from "hooks/inndelinger/useKommuner";
import { useEffect, useState } from "react";
import { clearMatrikkelLayer } from "utils/map/layers";
import { addFeaturesToSource } from "utils/map/source";
import { resetMapView } from "utils/map/useMap";
import { useMatrikkelGrenser } from "../hooks/useMatrikkelGrenser";
import {
  AvvikPanelProps,
  AvvikRowKommunerProps,
  AvvikRowProps,
  AvvikStatus,
  KommuneIAvvik,
  KommuneMedAvvik,
} from "./avvik-utils";
import { avvikUpdateStatus, useAvvikForKommune, useKommunerMedAvvik } from "./useAvvik";
export const useAvvikPanel = () => {
  const { closeOverlayPanel, activeOverlayModal } = useOverlayPanel();
  const toast = useToast();
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

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedAvvikId, setSelectedAvvikId] = useState<number | null>(null);

  // ========== Henter kommuner med avvik ==========
  const { data: kommunerMedAvvikResponse, isLoading: isLoadingKommunerMedAvvik } = useKommunerMedAvvik(
    !selectedKommune,
    currentPage,
  );

  const kommunerMedAvvikData = kommunerMedAvvikResponse?.content ?? [];
  const pagination =
    kommunerMedAvvikResponse != null
      ? {
          totalPages: kommunerMedAvvikResponse.totalPages,
          totalElements: kommunerMedAvvikResponse.totalElements,
          size: kommunerMedAvvikResponse.size,
          number: kommunerMedAvvikResponse.number,
          first: kommunerMedAvvikResponse.first,
          last: kommunerMedAvvikResponse.last,
        }
      : null;

  // ========== Henter avvik for valgt kommune ==========
  const {
    data: avvikDataRaw = [],
    isLoading: isLoadingAvvik,
    mutate: mutateAvvikData,
  } = useAvvikForKommune(selectedKommuneId);

  // Sorterer på kommunenummer som ikke er selectedKommune
  const avvikData = [...avvikDataRaw]
    .map((avvik) => {
      const selected = avvik.kommuner.filter(
        (k: { kommunenummer: string | undefined }) => k.kommunenummer === selectedKommune?.nummer,
      );
      const others = avvik.kommuner
        .filter((k: { kommunenummer: string | undefined }) => k.kommunenummer !== selectedKommune?.nummer)
        .sort((a: KommuneIAvvik, b: KommuneIAvvik) => a.kommunenummer.localeCompare(b.kommunenummer, "nb"));
      return {
        ...avvik,
        kommuner: [...selected, ...others],
      };
    })
    .sort((a, b) => {
      const aOther = a.kommuner.find(
        (k: { kommunenummer: string | undefined }) => k.kommunenummer !== selectedKommune?.nummer,
      );
      const bOther = b.kommuner.find(
        (k: { kommunenummer: string | undefined }) => k.kommunenummer !== selectedKommune?.nummer,
      );
      const kommuneCompare = (aOther?.kommunenummer ?? "").localeCompare(bOther?.kommunenummer ?? "", "nb");
      if (kommuneCompare !== 0) {
        return kommuneCompare;
      }
      const aCoord = a.koordinaterMedAvvik?.[0]?.nibasKoordinat?.coordinates ?? [0, 0];
      const bCoord = b.koordinaterMedAvvik?.[0]?.nibasKoordinat?.coordinates ?? [0, 0];
      if (aCoord[0] !== bCoord[0]) {
        return aCoord[0] - bCoord[0];
      }
      return aCoord[1] - bCoord[1];
    });

  // ========== Henter matrikkelgrenser for valgt kommune ==========
  const {
    features,
    isLoading: isLoadingMatrikkelGrenser,
    isError,
  } = useMatrikkelGrenser(selectedKommune?.nummer != null ? selectedKommune.nummer : "");

  useEffect(() => {
    if (selectedKommuneId == null) {
      return;
    }
    if (features.length > 0) {
      clearMatrikkelLayer();
      addFeaturesToSource("matrikkel", features);
    } else if (!isLoadingMatrikkelGrenser && isError) {
      toast({
        status: "error",
        title: "Klarte ikke å hente inn teiggrenser for kommunen",
      });
    }
  }, [features, isLoadingMatrikkelGrenser, isError, toast, selectedKommuneId]);

  // Oppdaterer avvikstatus, optimistisk
  const updateStatus = async (avvikId: number, status: AvvikStatus): Promise<boolean> => {
    const id = avvikId;
    const updates = [{ id, status }];
    const optimistiskeData = avvikData.map((item: { id: number }) =>
      item.id === avvikId ? { ...item, status } : item,
    );

    mutateAvvikData(optimistiskeData, false);
    const success = await avvikUpdateStatus(updates);
    mutateAvvikData();
    return success?.ok ? true : false;
  };

  const findSecondKommune = (kommunerFromRow: KommuneIAvvik[]) => {
    const secondKommuneFromRow = kommunerFromRow.find((k) => k.kommuneLokalID !== selectedKommuneId);
    if (secondKommuneFromRow === undefined) {
      return;
    }
    if (secondKommuneFromRow.kommuneLokalID === secondKommuneId) {
      return;
    }
    setSecondKommuneId(secondKommuneFromRow.kommuneLokalID);
    // Legg til fylkeid hvis det er kommune fra et annet fylke enn det som er valgt
    const fylkeId = secondKommuneFromRow.fylkesLokalID;
    if (fylkeId != null && !selectedFylkeIds.includes(fylkeId)) {
      setSelectedFylkeIds([...selectedFylkeIds, fylkeId]);
    }
  };

  const handleInndelingForAvvik = () => {
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
        }
      }
    }
  };

  useEffect(() => {
    handleInndelingForAvvik();
  }, [
    selectedKommune,
    secondKommune,
    isLoadingKommune,
    isLoadingSecondKommune,
    currentlyEditingInndelinger,
    selectedKommuneId,
    setShouldZoom,
    selectInndelinger,
    handleInndelingForAvvik,
  ]);
  useEffect(() => {
    return () => {
      setShouldZoom(true); // Resetter shouldZoom når avvikspanelet unmountes så ved f.eks nytt inndelingsvalg zoomer vi som vanlig
    };
  }, [setShouldZoom]);
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
    setSelectedInndelinger([]);
    setSelectedAvvikId(null);
    clearEditLayerAndInndelinger();
    clearMatrikkelLayer();
    resetMapView();
  };

  const handleGoToKommuneClick = async (kommuneLokalID: string) => {
    const kommune = kommunerMedAvvikData.find((k: { kommuneLokalID: string }) => k.kommuneLokalID === kommuneLokalID);
    if (kommune == null) {
      return;
    }

    const fylkeId = kommune.fylkesLokalID;
    if (fylkeId != null && !selectedFylkeIds.includes(fylkeId)) {
      setSelectedFylkeIds([...selectedFylkeIds, fylkeId]);
    }

    setSelectedKommuneId(kommuneLokalID);
  };

  const avvikRowProps: AvvikRowProps = {
    findSecondKommune,
    selectedAvvikId,
    setSelectedAvvikId,
    updateStatus,
  };
  const avvikPanelProps: AvvikPanelProps = {
    isLoadingKommunerMedAvvik,
    isLoadingAvvik,
    selectedKommune,
    avvikData,
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
    avvikPanelProps,
    avvikRowKommunerProps,
    avvikRowProps,
  };
};
