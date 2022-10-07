import { createContext, useContext, useEffect, useMemo } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { useMatch } from "react-router-dom";
import { EntityUtkastType, UtkastContextValue, UtkastEntity } from "./types";
import {
  applyFeatureUtkast,
  applyNonFeatureUtkast,
  historyToUtkastOperations,
} from "./utils";
import { updateUtkast as updateApiUtkast } from "api/utkast";
import { useToolbar } from "contexts/ToolbarContext";
import useNibasApi from "hooks/useNibasApi";
import { UtkastRequest } from "types/api";

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
  const { history, clearHistory } = useToolbar();
  const { tokenHolderFunc } = useAuthenticationFlow();
  const utkastId = useMatch("/:utkastId")?.params.utkastId;

  const { data: utkast, mutate } = useNibasApi(
    utkastId ? "/v1/utkast/{id}" : null,
    {
      // id blir ikke brukt før den er truthy, så vi kan trygt si at den
      // ikke er null her
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: utkastId!,
    },
    {
      shouldRetryOnError: false,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    // fjern utkast hvis utkastid ikke er i url
    if (utkast && !utkastId) {
      mutate();
    }
  });

  const updateUtkastWithHistory = async () => {
    if (!utkast) return;

    const operasjoner = historyToUtkastOperations(history, utkast);

    const updatedUtkast: UtkastRequest = {
      endringstype: utkast.endringstype,
      navn: utkast.navn,
      gyldigFra: utkast.gyldigFra,
      operasjoner,
    };

    await mutate(
      updateApiUtkast(utkast.id, updatedUtkast, tokenHolderFunc()?.token)
    );

    clearHistory();
  };

  const value = { utkast, updateUtkastWithHistory };

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

  return useMemo(() => {
    if (!entity || !utkast) return entity;

    return applyNonFeatureUtkast(entity, utkast, type);
  }, [entity, utkast, type]);
};

export const useUtkastFeature = (
  featureCollection: GeoJSONFeatureCollection | GeoJSONFeatureCollection[]
) => {
  const { utkast } = useUtkast();

  return useMemo(() => {
    if (!featureCollection || !utkast) return featureCollection;

    if (Array.isArray(featureCollection)) {
      return featureCollection.map((collection) =>
        applyFeatureUtkast(collection, utkast)
      );
    }

    return applyFeatureUtkast(featureCollection, utkast);
  }, [featureCollection, utkast]);
};
