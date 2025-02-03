import { statusCode } from "utils/api";
import { Eiendom } from "./EiendomSearch";
import useToastUnique from "hooks/toast/useToastUnique";

// Hjelpefunksjon for å få en url med parametere. Bruk getUrlWithParameters hvis du skal fetche fra nibas-backend for mer typesikkerhet.
const getExternalUrlWithParameters = (url: string, params: Record<string, string>): string => {
  let urlWithParams = url;
  let i = 0;
  for (const [param, value] of Object.entries(params)) {
    urlWithParams = urlWithParams.concat(`${i === 0 ? "?" : "&"}${param}=${value}`);
    i++;
  }
  return urlWithParams;
};

type EiendomRequestParameter = {
  gardsnummer: string;
  bruksnummer: string;
  festenummer?: string;
  kommunenummer: string;
  utkoordsys: string;
};

export const useEiendom = () => {
  const { toastUnique: searchErrorToast } = useToastUnique({
    status: "error",
    title: "Søket feilet",
    description: "Hvis feilen vedvarer, vennligst kontakt Kartverket",
  });

  const searchForEiendom = async (eiendom: Eiendom): Promise<EiendomResult | null> => {
    if (eiendom.gaardsnummer != null && eiendom.bruksnummer != null && eiendom.kommune?.nummer != null) {
      const params: EiendomRequestParameter = {
        gardsnummer: eiendom.gaardsnummer.toString(),
        bruksnummer: eiendom.bruksnummer.toString(),
        ...(eiendom.festenummer != null && { festenummer: eiendom.festenummer.toString() }),
        kommunenummer: eiendom.kommune?.nummer,
        utkoordsys: "25833", // I Nibas bruker vi EPSG:25833
      };
      const response = await fetch(
        getExternalUrlWithParameters("https://api.kartverket.no/eiendom/v1/geokoding", params),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (statusCode.isSuccessful(response.status)) {
        return response.json();
      } else if (statusCode.isError(response.status)) {
        searchErrorToast();
      }
    }
    return null;
  };

  return searchForEiendom;
};

type EiendomResult = {
  crs: {
    properties: {
      name: string;
    };
    type: string;
  };
  features: [
    {
      geometry: {
        coordinates: string[];
        type: string;
      };
      properties: {
        bruksnummer: number;
        festenummer: number;
        gardsnummer: number;
        hovedområde: boolean;
        kommunenummer: string;
        lokalid: number;
        matrikkelnummertekst: string;
        meterFraPunkt: number;
        nøyaktighetsklasseteig: string;
        objekttype: string;
        oppdateringsdato: string;
        seksjonsnummer: number;
        teigmedflerematrikkelenheter: boolean;
        uregistrertjordsameie: boolean;
      };
      type: string;
    },
  ];
  type: string;
};
