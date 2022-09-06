import { createContext, useContext, useEffect, useState } from "react";
import { useMatch } from "react-router-dom";
import { GrunnkretsRequest } from "types/api";

const grunnkretsUtkast: GrunnkretsRequest = {
  grunnkretsnummer: "12345678",
  identifikasjon: {
    lokalid: "lokalid",
    navnerom: "navnerom",
    versjonid: "versjonId",
  },
  navn: "Mock grunnkrets",
};

type Utkast = Record<string, Record<string, any>>;

type Response = {
  id: string;
};

// utkastet per ID må byttes ut med de nye verdiene på lagring
// det er kun den siste versjonen av en request som skal brukes,
// de andre er unødvendige

const applyUtkast = <T extends Response>(
  entity: T,
  utkastSlice: any | undefined
) => {
  // spread utkast på originale typen for å overskrive verdier
  const utkastForEntity = utkastSlice[entity.id];

  console.log("Utkast for entity", utkastForEntity);

  if (utkastForEntity) {
    return {
      ...entity,
      ...utkastForEntity,
    } as T;
  }

  return entity;
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
      console.log("Fetched utkast", {
        grunnkretser: {
          "db1f6e5e-6bac-4d79-87ff-2d3d43e61844": grunnkretsUtkast,
        },
      });
      setUtkast({
        grunnkretser: {
          "db1f6e5e-6bac-4d79-87ff-2d3d43e61844": grunnkretsUtkast,
        },
      });
    }, 250);
  }, [utkastId]);

  const value = { utkast };

  return (
    <UtkastContext.Provider value={value}>{children}</UtkastContext.Provider>
  );
};

export const useUtkastApply = <T extends Response | Response[] | undefined>(
  entity: T,
  type: string
) => {
  const context = useContext(UtkastContext);

  if (!context) {
    throw new Error("useUtkast must be used within a UtkastProvider");
  }

  const { utkast } = context;

  if (!entity) return;

  const utkastSlice = utkast[type];

  console.log("Utkast slice", utkastSlice);

  if (Array.isArray(entity)) {
    console.log("Entity is an array", entity);
    return entity.map((e) => applyUtkast(e, utkastSlice));
  }

  return applyUtkast(entity, utkastSlice);
};
