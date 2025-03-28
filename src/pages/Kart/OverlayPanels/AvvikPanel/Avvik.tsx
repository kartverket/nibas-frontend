import { useCallback, useState } from "react";
import { avvikFetcher, avvikKommunerFetcher } from "api/avvik";
import { useAuthentication } from "../../../../components/Authentication/AuthenticationHook";
import { getUrlWithParameters } from "hooks/useNibasApi";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { transformCoordinatesToProjection } from "../NavigasjonPanel/koordinater-utils";
import { EPSGCode, mapProjectionEPSGCode } from "utils/map/projections";
import { Point } from "ol/geom";
import { map } from "pages/Kart/constants";
import { Inndeling, Inndelingtype, useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { AdministrativEnhetNavn, KommuneResponse } from "types/api";
import { fetcherWithToken } from "utils/api";
import { clearMatrikkelLayer, getMatrikkelFeatures } from "utils/map/layers";
export interface KommunerMedAvvik {
  kommunenavn: string;
  kommunenummer: string;
  kommunelokalid: string;
  fylkeslokalid: string;
  antallAvvik: number;
}
export interface KommunerMedAvvikIContent {
  //TODO: Gjøre disse like i backend-responsen
  kommunenavn: string;
  kommunenummer: string;
  kommuneLokalID: string;
  fylkesLokalID: string;
}
export interface Geometri {
  type: string; // Type of geometry, e.g., "LineString"
  coordinates: number[][]; // Array of coordinate pairs [x, y]
}
export interface KoordinaterMedAvvik {
  nibasKoordinat: {
    type: Point;
    coordinates: number[];
  };
  matrikkelKoordinat: {
    type: Point;
    coordinates: number[];
  };
}
export interface AvvikContent {
  fylkeId: string; // Fylke ID
  kommuneId: string; // Kommune ID
  id: number; // ID for avviket
  lokalId: string; // Lokal ID for raden
  status: string; // Status for raden
  antallKoordinater: number; // Antall koordinater
  antallKoordinaterMedAvvik: number; // Antall koordinater med avvik
  geometri: Geometri; // Geometri for raden
  koordinaterMedAvvik: KoordinaterMedAvvik[]; // Koordinater med avvik
  kommuner: KommunerMedAvvikIContent[]; // Kommuner med avvik
}

export interface PaginationInfo {
  totalPages: number; // Totalt antall sider
  totalElements: number; // Totalt antall elementer
  size: number; // Antall elementer per side
  number: number; // Gjeldende side (0-indeksert)
  first: boolean; // Om dette er første siden
  last: boolean; // Om dette er siste siden
}

export interface AvvikResponse extends PaginationInfo {
  content: AvvikContent[]; // Array med innholdet for denne siden
  empty: boolean; // Om denne siden er tom
}
export interface AvvikProps {
  avvikResponse: AvvikResponse; // Hele responsen med paginering og innhold
  onPageChange?: (page: number) => void; // Callback for å håndtere sideendring
}
export type BaseInndeling = {
  id: string;
  nummer: string;
  navn: AdministrativEnhetNavn;
  inndelingtype: Inndelingtype;
};
// 1. Get kommuner med avvik
// 2. Hvis klikk på kommune, gå til inndeling (fylkeid og kommuneid får vi fra Row)
// 3. Sammenligne fylkeid og kommuneid fra avvik med fylkeid og kommuneid fra inndeling
// 4. Sett så til denne inndelingen
// 5. Viser da avvikene for kommunen i AvvikPAnel
// 6. Ved klikk på Row, gå til koordinatene i kartet for avviket og så hent matrikkelgrenser
export const useAvvik = () => {
  const { token } = useAuthentication();
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const [projectionOfCoordinates, setProjectionOfCoordinates] = useState<EPSGCode>(mapProjectionEPSGCode);
  const { selectInndelinger, setSelectedFylkeId, currentlyEditingInndelinger } = useInndelinger();
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

  const getKommunerMedAvvik: () => Promise<KommunerMedAvvik[]> = useCallback(async () => {
    const avvikJson = await avvikKommunerFetcher(token);
    return avvikJson.map((kommune: KommunerMedAvvik) => ({
      kommunenavn: kommune.kommunenavn,
      kommunenummer: kommune.kommunenummer,
      kommunelokalid: kommune.kommunelokalid,
      fylkeslokalid: kommune.fylkeslokalid,
      antallAvvik: kommune.antallAvvik,
    }));
  }, [token]);

  const centerOnCoordinate = (north: number | null, east: number | null): Promise<void> => {
    return new Promise((resolve) => {
      // Bruker promise her for å hente matrikkelgrenser med engang vi er ferdige med å zoome inn
      if (north !== null && east !== null) {
        const view = map.getView();
        // view.animate({ duration: 2000, center: [east, north], zoom: 28 });
        view.animate(
          {
            duration: 1,
            center: [east, north],
            zoom: 28,
          },
          () => {
            resolve();
          },
        );
      } else {
        resolve(); // resolve med en gang hvis koordinater er ugyldige
      }
    });
  };
  const goToCoordinates = async (coordinates: number[]) => {
    const [east, north] = coordinates;
    if (north != null && east != null) {
      const transformedCoordinates = transformCoordinatesToProjection(
        east,
        north,
        projectionOfCoordinates,
        mapProjectionEPSGCode,
      );
      if (transformedCoordinates != null) {
        centerOnCoordinate(transformedCoordinates[1], transformedCoordinates[0]).then(async () => {
          await getMatrikkelFeatures();
        });
      }
    }
  };

  const getAvvik: (pKommuneId: string, page: number, size: number) => Promise<AvvikResponse> = useCallback(
    async (pKommuneId, page, size) => {
      const avvikJson = await avvikFetcher(token, page, size);
      // Filtrer kun avvik som matcher valgt kommune (foreløpig tar ikke endepunktet imot kommuneLokalId, så vi får alle avvikene)
      const filteredContent = avvikJson.content.filter((avvik: { kommuner: KommunerMedAvvikIContent[] }) =>
        avvik.kommuner.some((kommune) => kommune.kommuneLokalID === pKommuneId),
      );
      return {
        content: filteredContent,
        totalPages: avvikJson.totalPages,
        totalElements: avvikJson.totalElements,
        size: avvikJson.size,
        number: avvikJson.number,
        first: avvikJson.first,
        last: avvikJson.last,
        empty: avvikJson.empty,
      } satisfies AvvikResponse;
    },
    [token],
  );

  return { getKommunerMedAvvik, getAvvik, goToCoordinates, openInndelingForAvvik, updateFylkeIdAndKommuneId };
};
