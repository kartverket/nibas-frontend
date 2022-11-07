import { createContext, useContext, useEffect, useMemo } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { useSearchParams } from "react-router-dom";
import { useSWRConfig } from "swr";
import {
  EntityUtkastType,
  UtkastContextValue,
  UtkastEntity,
  UtkastRequestWithoutOperations,
} from "./types";
import {
  applyFeatureUtkast,
  applyNonFeatureUtkast,
  historyToUtkastOperations,
} from "./utils";
import { updateUtkast as updateApiUtkast } from "api/utkast";
import { HistoryChange, useToolbar } from "contexts/ToolbarContext";
import useNibasApi from "hooks/useNibasApi";
import { OppdaterUtkastRequest } from "types/api";
import { resetMapView } from "utils/map";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { userOverlayPanels } from "contexts/OverlayPanelsContext";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { resetEditingObject } = useEditAllGrenser();
  const { closePanels } = userOverlayPanels();
  const utkastId = searchParams.get("utkast");

  const { mutate: globalMutate } = useSWRConfig();

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
  }, [utkast, utkastId, mutate]);

  const updateUtkastWithHistory = async () => {
    if (!utkast) return;

    const operasjoner = historyToUtkastOperations(history, utkast);

    const updatedUtkast: OppdaterUtkastRequest = {
      endringstype: utkast.endringstype,
      navn: utkast.navn,
      gyldigFra: utkast.gyldigFra,
      operasjoner,
      version: utkast.version,
    };
    const utkastEntry = history.entries
      .slice(0, history.index)
      .reverse() // siste entry inneholder alle endringene på utkastet
      .find((entry) => entry.changes.some((change) => change.id === utkast.id));

    if (utkastEntry) {
      const change = (
        utkastEntry.changes as HistoryChange<UtkastRequestWithoutOperations>[]
      ).find((c) => c.id === utkast.id);

      if (change?.to) {
        updatedUtkast.endringstype = change.to.endringstype;
        updatedUtkast.navn = change.to.navn;
        updatedUtkast.gyldigFra = change.to.gyldigFra;
      }
    }

    await mutate(
      updateApiUtkast(utkast.id, updatedUtkast, tokenHolderFunc()?.token)
    );
    await globalMutate(["/v1/utkast", tokenHolderFunc()?.token]);

    clearHistory();
  };

  const closeUtkast = () => {
    setSearchParams({});
    resetEditingObject();
    closePanels();
    resetMapView();
    clearHistory();
  };

  const value = { utkast, updateUtkastWithHistory, closeUtkast };

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
