import { useToast } from "@kvib/react";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { Inndeling, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useKommunerByIds } from "hooks/inndelinger/useKommuner";
import { useEffect, useState } from "react";
import { clearMatrikkelLayer } from "utils/map/layers";
import { addFeaturesToSource } from "utils/map/source";
import { resetMapView } from "utils/map/useMap";
import { useAuthentication } from "../../../../components/Authentication/useAuthentication";
import { useMatrikkelGrenser } from "../hooks/useMatrikkelGrenser";
import {
  AvvikForKommune,
  AvvikForKommuneResponse,
  AvvikPanelProps,
  AvvikRowKommunerProps,
  AvvikRowProps,
  AvvikStatus,
  KommuneParMedAvvik,
} from "./avvik-utils";
import { avvikUpdateStatus, useAvvikForKommunePar, useKommuneParMedAvvik } from "./useAvvik";

// Akkurat nå skjer alt i denne hooken som useEffect.
// Ikke helt optimalt da hele oppførselen bare er en rekke dependency-triggers som er litt vrient å håndtere.
export const useAvvikPanel = () => {
  const { closeOverlayPanel, activeOverlayModal } = useOverlayPanel();
  const toast = useToast();
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
  const [selectedKommuneIds, setSelectedKommuneIds] = useState<string[]>([]);

  const { data: selectedKommuner } = useKommunerByIds(selectedKommuneIds, gyldighetsdato);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedAvvikId, setSelectedAvvikId] = useState<number | null>(null);

  const { data: kommuneParMedAvvikRaw, isLoading: isLoadingKommuneParMedAvvik } = useKommuneParMedAvvik(
    selectedKommuner == null || selectedKommuner.length === 0,
    currentPage,
    token,
  );

  const {
    data: avvikDataRaw,
    isLoading: isLoadingAvvik,
    mutate: mutateAvvikData,
  } = useAvvikForKommunePar(selectedKommuneIds, token);

  // Her henter vi kun grenser for den ene kommunen.
  // Det holder i denne konteksten (det er gitt at de er naboer) siden settet med den ene kommunen sine grenser alltid vil inneholde de grensene den deler med den andre kommunen.
  const {
    features,
    isLoading: isLoadingMatrikkelGrenser,
    isError,
  } = useMatrikkelGrenser(
    selectedKommuner != null && selectedKommuner.length === 2,
    token,
    selectedKommuner?.[0]?.nummer ?? "",
  );

  const kommuneParMedAvvikData = kommuneParMedAvvikRaw?.content ?? [];
  const pagination =
    kommuneParMedAvvikRaw != null
      ? {
          totalPages: kommuneParMedAvvikRaw.totalPages,
          totalElements: kommuneParMedAvvikRaw.totalElements,
          size: kommuneParMedAvvikRaw.size,
          number: kommuneParMedAvvikRaw.number,
          first: kommuneParMedAvvikRaw.first,
          last: kommuneParMedAvvikRaw.last,
        }
      : null;

  const avvikData = avvikDataRaw?.sort((a, b) => b.antallKoordinaterMedAvvik - a.antallKoordinaterMedAvvik);

  useEffect(() => {
    if (selectedKommuneIds == null || selectedKommuneIds.length !== 2) {
      return;
    }
    if (features.length > 0) {
      clearMatrikkelLayer();
      addFeaturesToSource("matrikkel", features);
    } else if (!isLoadingMatrikkelGrenser && isError) {
      toast({
        status: "error",
        title: "Klarte ikke å hente inn teiggrenser for kommunene",
      });
    }
  }, [features, isLoadingMatrikkelGrenser, isError, toast, selectedKommuneIds]);

  // Oppdaterer avvikstatus, optimistisk
  const updateStatus = async (avvikId: number, status: AvvikStatus): Promise<boolean> => {
    const id = avvikId;
    const updates = [{ id, status }];
    const optimistiskeData: AvvikForKommune[] | undefined = avvikData?.map((item) =>
      item.id === avvikId ? { ...item, status } : item,
    );

    mutateAvvikData(optimistiskeData, false);
    const success = await avvikUpdateStatus(updates, token);
    mutateAvvikData();
    return success?.ok ? true : false;
  };

  useEffect(() => {
    if (selectedKommuner == null || selectedKommuner.length !== 2) {
      return;
    }

    const desiredInndelinger: Inndeling[] = selectedKommuner.map((kommune) => ({
      navn: kommune.navn,
      nummer: kommune.nummer,
      id: kommune.id.lokalid.value,
      inndelingtype: "kommune",
      isEditing: true,
      isViewing: false,
    }));

    const currentEditingKommuner = currentlyEditingInndelinger.filter((i) => i.inndelingtype === "kommune");

    const isSameSelection =
      currentEditingKommuner.length === desiredInndelinger.length &&
      desiredInndelinger.every((d) =>
        currentEditingKommuner.some(
          (c) =>
            c.id === d.id &&
            c.inndelingtype === d.inndelingtype &&
            c.isEditing === d.isEditing &&
            c.isViewing === d.isViewing,
        ),
      );

    if (isSameSelection) {
      return;
    }

    selectInndelinger(desiredInndelinger);
  }, [selectedKommuner, currentlyEditingInndelinger, selectInndelinger]);

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
      setSelectedKommuneIds(
        currentlyEditingInndelinger
          .filter((inndeling) => inndeling.inndelingtype === "kommune")
          .map((inndeling) => inndeling.id),
      );
    }
  }, [
    currentlyEditingInndelinger,
    selectedInndelinger,
    selectedFylkeIds,
    setSelectedKommuneIds,
    activeOverlayModal,
    closeOverlayPanel,
  ]);

  const resetAvvikPanel = () => {
    setSelectedKommuneIds([]);
    setSelectedFylkeIds([]);
    selectInndelinger([]);
    setShouldZoom(true);
    setSelectedInndelinger([]);
    setSelectedAvvikId(null);
    clearEditLayerAndInndelinger();
    clearMatrikkelLayer();
    resetMapView();
  };

  const handleGotoKommunePar = async (kommuneLokalIDs: string[]) => {
    setSelectedKommuneIds(kommuneLokalIDs);
  };

  const avvikRowProps: AvvikRowProps = {
    selectedAvvikId,
    setSelectedAvvikId,
    updateStatus,
  };
  const avvikPanelProps: AvvikPanelProps = {
    isLoadingKommuneParMedAvvik,
    isLoadingAvvik,
    selectedKommuner,
    avvikData,
    kommuneParMedAvvikData,
    pagination,
    currentPage,
    setCurrentPage,
    resetAvvikPanel,
    handleGotoKommunePar,
  };
  const avvikRowKommunerProps: AvvikRowKommunerProps = {
    kommuneParMedAvvikItem: {} as KommuneParMedAvvik,
    handleGotoKommunePar,
  };
  return {
    avvikPanelProps,
    avvikRowKommunerProps,
    avvikRowProps,
  };
};
