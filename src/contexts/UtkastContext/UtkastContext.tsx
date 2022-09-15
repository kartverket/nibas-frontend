import { createContext, useContext, useEffect, useState } from "react";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { useMatch } from "react-router-dom";
import {
  EntityUtkastType,
  Utkast,
  UtkastContextValue,
  UtkastEntity,
} from "./types";
import { applyFeatureUtkast, applyNonFeatureUtkast } from "./utils";
import useNibasApi from "hooks/useNibasApi";
import { ApiPath } from "types/api";

// utkastet per ID må byttes ut med de nye verdiene på lagring
// det er kun den siste versjonen av en request som skal brukes,
// de andre er unødvendige

// down the line kan vi kalle mutate på URLen etter lagring for å oppdatere staten!

/**
 * Bruk heller UtkastProvider i koden
 */
export const UtkastContext = createContext<UtkastContextValue | undefined>(
  undefined
);

export const UtkastProvider: React.FC = ({ children }) => {
  const [utkast, setUtkast] = useState<Utkast>({});

  const utkastId = useMatch("/:utkastId")?.params.utkastId;
  // endepunktet finnes ikke enda, så vi må trikse det til litt frem til det gjør det
  // må denne være swrimmutable?
  const apiUtkast = useNibasApi(
    utkastId ? ("/v1/utkast/{id}" as ApiPath) : null,
    {
      id: utkastId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ).data as any;

  useEffect(() => {
    if (!apiUtkast) return;

    setUtkast(apiUtkast);
  }, [apiUtkast]);

  const value = { utkast };

  return (
    <UtkastContext.Provider value={value}>{children}</UtkastContext.Provider>
  );
};

export const useUtkastEntity = <T extends UtkastEntity>(
  entity: T,
  type: EntityUtkastType
) => {
  const context = useContext(UtkastContext);

  if (!context) {
    throw new Error("useUtkastEntity must be used within a UtkastProvider");
  }

  const { utkast } = context;

  if (!entity) return;

  return applyNonFeatureUtkast(entity, utkast, type);
};

export const useUtkastFeature = (
  featureCollection: GeoJSONFeatureCollection | GeoJSONFeatureCollection[]
) => {
  const context = useContext(UtkastContext);

  if (!context) {
    throw new Error(
      "useUtkastGrenseApply must be used within a UtkastProvider"
    );
  }

  const { utkast } = context;

  if (!featureCollection) return;

  if (Array.isArray(featureCollection)) {
    return featureCollection.map((collection) =>
      applyFeatureUtkast(collection, utkast)
    );
  }

  return applyFeatureUtkast(featureCollection, utkast);
};
