import { useCallback, useState } from "react";
import { avvikFetcher, avvikKommunerFetcher, avvikUpdateStatus } from "api/avvik";
import { useAuthentication } from "../../../../components/Authentication/AuthenticationHook";
import { getUrlWithParameters } from "hooks/useNibasApi";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { transformCoordinatesToProjection } from "../NavigasjonPanel/koordinater-utils";
import { EPSGCode, mapProjectionEPSGCode } from "utils/map/projections";
import { map } from "pages/Kart/constants";
import { Inndeling, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { KommuneResponse } from "types/api";
import { fetcherWithToken } from "utils/api";
import { clearMatrikkelLayer, getMatrikkelFeatures } from "utils/map/layers";
import { AvvikForKommuneResponse, AvvikKommunerResponse } from "./avvik-utils";
// 1. Get kommuner med avvik
// 2. Hvis klikk på kommune, gå til inndeling (fylkeid og kommuneid får vi fra Row)
// 3. Sammenligne fylkeid og kommuneid fra avvik med fylkeid og kommuneid fra inndeling
// 4. Sett så til denne inndelingen
// 5. Viser da avvikene for kommunen i AvvikPAnel
// 6. Ved klikk på Row, gå til koordinatene i kartet for avviket og så hent matrikkelgrenser
export const useAvvik = () => {
  const { token } = useAuthentication();
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const [projectionOfCoordinates] = useState<EPSGCode>(mapProjectionEPSGCode);
  const { selectInndelinger, setSelectedFylkeId } = useInndelinger();
  const kommuneFetcher = async ([kommuneIdFraRow]: [string, string | undefined]) => {
    if (!kommuneIdFraRow) {
      return;
    }

    const url = getUrlWithParameters("/v1/kommuner/{id}", { id: kommuneIdFraRow, gyldighetsdato });
    return await fetcherWithToken([url, token]);
  };

  const updateFylkeIdAndKommuneId = async (fylkeIdFraRow: string, kommuneIdFraRow: string) => {
    setSelectedFylkeId(fylkeIdFraRow);
    if (fylkeIdFraRow === "") {
      clearMatrikkelLayer();
      return;
    }
    const kommuneFetch = await kommuneFetcher([kommuneIdFraRow, token]);
    const kommuneForAvvik = kommuneFetch as KommuneResponse;
    openInndelingForAvvik(kommuneForAvvik);
  };
  const updateStatusForAvvik = async (id: number, status: string): Promise<boolean> => {
    const success = await avvikUpdateStatus(id, status, token);
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

  const getKommunerMedAvvik: (page: number, size: number) => Promise<AvvikKommunerResponse> = useCallback(
    async (page: number, size: number) => {
      const avvikJson = await avvikKommunerFetcher(token, page, size);
      return {
        content: avvikJson.content,
        totalPages: avvikJson.totalPages,
        totalElements: avvikJson.totalElements,
        size: avvikJson.size,
        number: avvikJson.number,
        first: avvikJson.first,
        last: avvikJson.last,
        empty: avvikJson.empty,
      };
    },
    [token],
  );

  const getAvvik: (pKommuneId: string) => Promise<AvvikForKommuneResponse> = useCallback(
    async (pKommuneId) => {
      const avvikJson = await avvikFetcher(token, pKommuneId);
      return avvikJson;
    },
    [token],
  );

  const centerOnCoordinate = (
    north: number | null,
    east: number | null,
    zoom?: number | undefined,
    duration?: number | undefined,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      // Bruker promise her for å hente matrikkelgrenser med engang vi er ferdige med å zoome inn
      if (north !== null && east !== null) {
        const view = map.getView();
        view.animate(
          {
            duration: duration !== undefined ? duration : 1,
            center: [east, north],
            zoom: zoom !== undefined ? zoom : 28,
          },
          () => {
            resolve(true);
          },
        );
      } else {
        resolve(false); // resolve med en gang hvis koordinater er ugyldige
      }
    });
  };
  const goToCoordinates = async (
    coordinates: number[],
    zoom?: number | undefined,
    duration?: number | undefined,
  ): Promise<boolean> => {
    const [east, north] = coordinates;
    if (north != null && east != null) {
      const transformedCoordinates = transformCoordinatesToProjection(
        east,
        north,
        projectionOfCoordinates,
        mapProjectionEPSGCode,
      );
      if (transformedCoordinates != null) {
        const success = await centerOnCoordinate(transformedCoordinates[1], transformedCoordinates[0], zoom, duration);
        return success;
      }
    }
    return false;
  };
  const handleGoToCoordinatesAndFetchMatrikkel = async (coordinates: number[]): Promise<boolean> => {
    try {
      const goToSuccess = await goToCoordinates(coordinates); // Wait for goToCoordinates to complete
      const matrikkelSuccess = await getMatrikkelFeatures(); // Fetch matrikkel features after centering
      if (!goToSuccess || !matrikkelSuccess) {
        return false; // Return false if either operation fails
      }
      return true;
    } catch (error) {
      return false;
    }
  };
  const resetInndeling = () => {
    updateFylkeIdAndKommuneId("", "");
    setSelectedFylkeId("");
    selectInndelinger([]);
    goToCoordinates([328380.81, 7111142.73], 6, 2000);
  };

  return {
    getKommunerMedAvvik,
    getAvvik,
    handleGoToCoordinatesAndFetchMatrikkel,
    openInndelingForAvvik,
    updateFylkeIdAndKommuneId,
    resetInndeling,
    updateStatusForAvvik,
  };
};
