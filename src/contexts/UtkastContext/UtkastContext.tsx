import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
  const apiUtkast = useNibasApi(
    utkastId ? ("/v1/utkast/{id}" as ApiPath) : null,
    {
      id: utkastId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    {
      shouldRetryOnError: false,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ).data as any;

  useEffect(() => {
    if (!apiUtkast) return;

    setUtkast(apiUtkast);
  }, [apiUtkast]);

  const hasChanges = useMemo(() => Object.keys(utkast).length > 0, [utkast]);

  const value = { utkast, hasChanges };

  return (
    <UtkastContext.Provider value={value}>{children}</UtkastContext.Provider>
  );
};

export const useUtkast = () => {
  const context = useContext(UtkastContext);

  if (!context) {
    throw new Error("useUtkast must be used within a UtkastProvider");
  }

  return context;
};

export const useUtkastEntity = <T extends UtkastEntity>(
  entity: T,
  type: EntityUtkastType
) => {
  const { utkast } = useUtkast();

  if (!entity) return;

  return applyNonFeatureUtkast(entity, utkast, type);
};

export const useUtkastFeature = (
  featureCollection: GeoJSONFeatureCollection | GeoJSONFeatureCollection[]
) => {
  const { utkast } = useUtkast();

  if (!featureCollection) return;

  if (Array.isArray(featureCollection)) {
    return featureCollection.map((collection) =>
      applyFeatureUtkast(collection, utkast)
    );
  }

  return applyFeatureUtkast(featureCollection, utkast);
};
