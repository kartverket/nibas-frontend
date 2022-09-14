import { createContext, useContext, useEffect, useState } from "react";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { useMatch } from "react-router-dom";
import { GrunnkretsRequest, StemmekretsRequest } from "types/api";

const grunnkretsUtkast: GrunnkretsRequest = {
  grunnkretsnummer: "12345678",
  identifikasjon: {
    lokalid: "lokalid",
    navnerom: "navnerom",
    versjonid: "versjonId",
  },
  navn: "Mock grunnkrets",
};

const stemmekretsUtkast: StemmekretsRequest = {
  stemmekretsnavn: "SNEISEN 2.0",
  stemmekretsnummer: "10",
  identifikasjon: {
    lokalid: "ae914f4b-dbdc-4e08-9f8a-0b5e4457ae9f",
    navnerom: "https://data.geonorge.no/sosi/administrativeenheter",
    versjonid: undefined,
  },
  kommunenummer: "a4400206-5903-4eff-9c36-4d2d37683caa",
  tellekretsnummer: "Et nytt nummer",
  tellekretsnavn: "Nytt navn",
  valgdistriktsnummer: "12345678",
};

const mockUtkast: Utkast = {
  grunnkretser: {
    "db1f6e5e-6bac-4d79-87ff-2d3d43e61844": grunnkretsUtkast,
  },
  stemmmekretser: {
    "38a3afc0-58af-4b1a-aeee-9026348e73f2": stemmekretsUtkast,
  },
};

type Utkast = {
  grunnkretser?: Record<string, GrunnkretsRequest>;
  stemmmekretser?: Record<string, StemmekretsRequest>;
  grenser?: Record<string, GeoJSONFeatureCollection>;
};

type UtkastType = keyof Utkast;

type Response = {
  id: string;
};

// utkastet per ID må byttes ut med de nye verdiene på lagring
// det er kun den siste versjonen av en request som skal brukes,
// de andre er unødvendige

const combine = <T extends Response>(
  entity: T,
  utkastSlice: Utkast[UtkastType]
) => {
  if (!utkastSlice) return entity;

  const utkastForEntity = utkastSlice[entity.id];
  console.log("Utkast for entity", utkastForEntity);

  return {
    ...entity,
    ...utkastForEntity,
  } as T;
};

const applyUtkast = <T extends Response | Response[]>(
  entity: T,
  utkast: Utkast,
  type: UtkastType
) => {
  const utkastSlice = utkast[type];

  if (!utkastSlice) return entity;

  if (Array.isArray(entity) && type === "stemmmekretser") {
    // navn på stemmekrets har forskjellig field på StemmekretsRef og StemmekretsRequest

    console.log("applying utkast to stemmekretsref array");
    return entity.map((e) => {
      const utkastForEntity = utkast[type]?.[e.id];

      return {
        ...e,
        ...utkastForEntity,
        navn: utkastForEntity?.stemmekretsnavn,
      };
    });
  } else if (Array.isArray(entity)) {
    return entity.map((e) => combine(e, utkastSlice));
  }

  return combine(entity, utkastSlice);
};

type UtkastContextValue = {
  utkast: Utkast;
};

/**
 * Bruk heller UtkastProvider i koden
 */
export const UtkastContext = createContext<UtkastContextValue | undefined>(
  undefined
);

export const UtkastProvider: React.FC = ({ children }) => {
  const [utkast, setUtkast] = useState<Utkast>({});

  const utkastId = useMatch("/:utkastId")?.params.utkastId;
  console.log(utkastId);

  useEffect(() => {
    if (!utkastId) return;

    // hent utkast for id på URL
    // down the line kan vi kalle mutate på URLen etter lagring for å oppdatere staten!

    setTimeout(() => {
      console.log("Fetched utkast", mockUtkast);
      setUtkast(mockUtkast);
    }, 250);
  }, [utkastId]);

  const value = { utkast };

  return (
    <UtkastContext.Provider value={value}>{children}</UtkastContext.Provider>
  );
};

export const useUtkastApply = <T extends Response | Response[] | undefined>(
  entity: T,
  type: UtkastType
) => {
  const context = useContext(UtkastContext);

  if (!context) {
    throw new Error("useUtkast must be used within a UtkastProvider");
  }

  const { utkast } = context;

  if (!entity) return;

  const utkastSlice = utkast[type];

  console.log("Utkast slice", utkastSlice);

  return applyUtkast(entity, utkast, type);
};
