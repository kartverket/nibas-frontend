import { useToast } from "@kvib/react";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { Inndeling, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import useKommuner from "hooks/inndelinger/useKommuner";
import { useEffect, useState } from "react";
import { clearMatrikkelLayer } from "utils/map/layers";
import { addFeaturesToSource } from "utils/map/source";
import { resetMapView } from "utils/map/useMap";
import { useAuthentication } from "../../../../components/Authentication/useAuthentication";
import { useMatrikkelGrenser } from "../hooks/useMatrikkelGrenser";
import { AvvikPanelProps, AvvikRowKommunerProps, AvvikRowProps, AvvikStatus, KommuneParMedAvvik } from "./avvik-utils";
import { avvikUpdateStatus, useAvvikForKommunePar, useKommuneParMedAvvik } from "./useAvvik";
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

  const { kommuner: selectedKommuner, isLoading: isLoadingKommuner } = useKommuner(
    selectedKommuneIds,
    gyldighetsdato,
    selectedKommuneIds.length === 2,
  );

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedAvvikId, setSelectedAvvikId] = useState<number | null>(null);

  const { data: kommuneParMedAvvikResponse, isLoading: isLoadingKommuneParMedAvvik } = useKommuneParMedAvvik(
    selectedKommuner == null || selectedKommuner.length === 0,
    currentPage,
    token,
  );

  const {
    data: avvikData,
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
    selectedKommuneIds != null && selectedKommuneIds.length === 2,
    token,
    selectedKommuneIds[0] ?? "",
  );

  const kommuneParMedAvvikData = kommuneParMedAvvikResponse?.content ?? [];
  const pagination =
    kommuneParMedAvvikResponse != null
      ? {
          totalPages: kommuneParMedAvvikResponse.totalPages,
          totalElements: kommuneParMedAvvikResponse.totalElements,
          size: kommuneParMedAvvikResponse.size,
          number: kommuneParMedAvvikResponse.number,
          first: kommuneParMedAvvikResponse.first,
          last: kommuneParMedAvvikResponse.last,
        }
      : null;

  // // Sorterer på kommunenummer som ikke er selectedKommune
  // const avvikData = [...avvikDataRaw]
  //   .map((avvik) => {
  //     const selected = avvik.kommuner.filter(
  //       (k: { kommunenummer: string | undefined }) => k.kommunenummer === selectedKommune?.nummer,
  //     );
  //     const others = avvik.kommuner
  //       .filter((k: { kommunenummer: string | undefined }) => k.kommunenummer !== selectedKommune?.nummer)
  //       .sort((a: KommuneIAvvik, b: KommuneIAvvik) => a.kommunenummer.localeCompare(b.kommunenummer, "nb"));
  //     return {
  //       ...avvik,
  //       kommuner: [...selected, ...others],
  //     };
  //   })
  //   .sort((a, b) => {
  //     const aOther = a.kommuner.find(
  //       (k: { kommunenummer: string | undefined }) => k.kommunenummer !== selectedKommune?.nummer,
  //     );
  //     const bOther = b.kommuner.find(
  //       (k: { kommunenummer: string | undefined }) => k.kommunenummer !== selectedKommune?.nummer,
  //     );
  //     const kommuneCompare = (aOther?.kommunenummer ?? "").localeCompare(bOther?.kommunenummer ?? "", "nb");
  //     if (kommuneCompare !== 0) {
  //       return kommuneCompare;
  //     }
  //     const aCoord = a.koordinaterMedAvvik?.[0]?.nibasKoordinat?.coordinates ?? [0, 0];
  //     const bCoord = b.koordinaterMedAvvik?.[0]?.nibasKoordinat?.coordinates ?? [0, 0];
  //     if (aCoord[0] !== bCoord[0]) {
  //       return aCoord[0] - bCoord[0];
  //     }
  //     return aCoord[1] - bCoord[1];
  //   });

  useEffect(() => {
    if (selectedKommuneIds == null) {
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
    const optimistiskeData = avvikData.map((item: { id: number }) =>
      item.id === avvikId ? { ...item, status } : item,
    );

    mutateAvvikData(optimistiskeData, false);
    const success = await avvikUpdateStatus(updates, token);
    mutateAvvikData();
    return success?.ok ? true : false;
  };

  const handleInndelingForAvvik = () => {
    // if (selectedKommune && !isLoadingKommune) {
    //   const inndelingtype = "kommune";
    //   const newInndeling: Inndeling = {
    //     navn: selectedKommune.navn,
    //     nummer: selectedKommune.nummer,
    //     id: selectedKommune.id.lokalid.value,
    //     inndelingtype: inndelingtype,
    //     isEditing: true,
    //     isViewing: false,
    //   };
    //   const isAlreadySelected = currentlyEditingInndelinger.some(
    //     (inndeling) => inndeling.id === selectedKommune.id.lokalid.value,
    //   );
    //   if (!isAlreadySelected) {
    //     setShouldZoom(true);
    //     selectInndelinger([newInndeling]);
    //   }
    // }
    // if (secondKommune && !isLoadingSecondKommune) {
    //   const currentMainInndeling = currentlyEditingInndelinger.find((inndeling) => inndeling.id === selectedKommuneId);
    //   if (currentMainInndeling) {
    //     const isAlreadySelected = currentlyEditingInndelinger.some(
    //       (inndeling) => inndeling.id === secondKommune.id.lokalid.value,
    //     );
    //     if (!isAlreadySelected) {
    //       const inndelingtype = "kommune";
    //       const newInndeling: Inndeling = {
    //         navn: secondKommune.navn,
    //         nummer: secondKommune.nummer,
    //         id: secondKommune.id.lokalid.value,
    //         inndelingtype: inndelingtype,
    //         isEditing: true,
    //         isViewing: false,
    //       };
    //       setShouldZoom(false);
    //       selectInndelinger([currentMainInndeling, newInndeling]);
    //     }
    //   }
    // }
  };

  useEffect(() => {
    handleInndelingForAvvik();
  }, [
    selectedKommuner,
    isLoadingKommuner,
    currentlyEditingInndelinger,
    selectedKommuneIds,
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
      setSelectedKommuneIds([inndeling.id]);
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
    // const kommune = kommunerMedAvvikData.find((k: { kommuneLokalID: string }) => k.kommuneLokalID === kommuneLokalID);
    // if (kommune == null) {
    //   return;
    // }

    // const fylkeId = kommune.fylkesLokalID;
    // if (fylkeId != null && !selectedFylkeIds.includes(fylkeId)) {
    //   setSelectedFylkeIds([...selectedFylkeIds, fylkeId]);
    // }

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
