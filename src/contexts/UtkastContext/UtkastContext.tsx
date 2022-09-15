import { createContext, useContext, useEffect, useState } from "react";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { useMatch } from "react-router-dom";
import { mockUtkast } from "./constants";
import {
  EntityUtkastType,
  Utkast,
  UtkastContextValue,
  UtkastEntity,
} from "./types";
import { applyFeatureUtkast, applyNonFeatureUtkast } from "./utils";

// utkastet per ID må byttes ut med de nye verdiene på lagring
// det er kun den siste versjonen av en request som skal brukes,
// de andre er unødvendige

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
