import { useCallback, useState } from "react";
import { avvikFetcher, avvikKommunerFetcher, avvikUpdateStatus } from "api/avvik";
import { useAuthentication } from "../../../../components/Authentication/AuthenticationHook";
import { kommunerFetcher } from "hooks/inndelinger/useKommuner";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { Inndeling, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { KommuneResponse } from "types/api";

import { clearMatrikkelLayer, getMatrikkelFeatures } from "utils/map/layers";
import { AvvikForKommuneResponse, AvvikKommunerResponse, KommunerIAvvik } from "./avvik-utils";
import { centerOnCoordinate } from "../NavigasjonPanel/koordinater-utils";

export const useAvvik = () => {
  const { token } = useAuthentication();
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const { selectInndelinger, setSelectedFylkeId, currentlyEditingInndelinger, setShouldZoom } = useInndelinger();
  const [selectedKommuneId, setSelectedKommuneId] = useState<string>("");

  const getKommuneFromId = async (kommuneId: string) => {
    const kommuneArr = kommuneId.split(",");
    const kommuneFetch = await kommunerFetcher([kommuneArr, gyldighetsdato, token]);
    return (kommuneFetch as KommuneResponse[])[0];
  };

  const updateFylkeIdAndKommuneId = async (fylkeIdFraRow: string, kommuneIdFraRow: string) => {
    setSelectedFylkeId(fylkeIdFraRow);
    setSelectedKommuneId(kommuneIdFraRow);
    if (fylkeIdFraRow === "") {
      clearMatrikkelLayer();
      return;
    }
    const kommuneForAvvik = await getKommuneFromId(kommuneIdFraRow);
    if (kommuneForAvvik !== null) {
      openInndelingForAvvik(kommuneForAvvik);
    }
  };

  const updateStatusForAvvik = async (id: number, status: string): Promise<boolean> => {
    const updates = [{ id, status }];
    const success = await avvikUpdateStatus(updates, token);
    if (success?.ok) {
      return true;
    } else {
      return false;
    }
  };
  const openInndelingForAvvik = (kommuneForAvvik: KommuneResponse) => {
    if (kommuneForAvvik !== null) {
      const inndelingtype = "kommune";
      const newInndeling: Inndeling = {
        navn: kommuneForAvvik.navn,
        nummer: kommuneForAvvik.nummer,
        id: kommuneForAvvik.id.lokalid.value,
        inndelingtype: inndelingtype,
        isEditing: true,
        isViewing: false,
      };
      selectInndelinger([newInndeling]);
    }
  };

  const addInndelingForAvvik = async (kommunerFromRow: KommunerIAvvik[]) => {
    // Per nå 07.04.25 er det kun en fylkeid om gangen, brukeren ser derfor ikke at det  blir lagt til flere kommuner dersom de er i et annet fylke f.eks Oslo og legger så til Bærum.
    // Men man kan fortsatt redigere da grensa i mellom

    const currentMainInndeling = currentlyEditingInndelinger.find((inndeling) => inndeling.id === selectedKommuneId);
    const secondKommune = kommunerFromRow.filter((kommune) => kommune.kommuneLokalID !== selectedKommuneId)[0];
    const secondKommuneFetched = await getKommuneFromId(secondKommune?.kommuneLokalID);
    if (currentMainInndeling && secondKommuneFetched !== null) {
      // Ønsker ikke å zoome inn / resette zoomen når vi legger til inndelingen
      setShouldZoom(false);
      const inndelingtype = "kommune";
      const newInndeling: Inndeling = {
        navn: secondKommuneFetched.navn,
        nummer: secondKommuneFetched.nummer,
        id: secondKommuneFetched.id.lokalid.value,
        inndelingtype: inndelingtype,
        isEditing: true,
        isViewing: false,
      };

      selectInndelinger([currentMainInndeling, newInndeling]);

      setTimeout(() => {
        setShouldZoom(true);
      }, 5000);
    }
  };

  const getKommunerMedAvvik: (page: number, size: number) => Promise<AvvikKommunerResponse> = useCallback(
    async (page: number, size: number) => {
      const result = await avvikKommunerFetcher(token, page, size);
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

  const getAvvik: (pKommuneId: string) => Promise<AvvikForKommuneResponse> = useCallback(
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

  const resetInndeling = () => {
    updateFylkeIdAndKommuneId("", "");
    setSelectedFylkeId("");
    selectInndelinger([]);
    setShouldZoom(false);
    // Zoomer ut for "å vise" at man ikke har valgt inndeling lenger
    centerOnCoordinate(7111142.73, 328380.81, 6, 2000);
  };

  return {
    getKommunerMedAvvik,
    getAvvik,
    addInndelingForAvvik,
    goToCoordinatesAndFetchMatrikkel,
    openInndelingForAvvik,
    updateFylkeIdAndKommuneId,
    resetInndeling,
    updateStatusForAvvik,
  };
};
