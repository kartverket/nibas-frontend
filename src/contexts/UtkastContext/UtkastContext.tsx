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
import { HistoryChange, useHistory } from "contexts/HistoryContext";
import useNibasApi from "hooks/useNibasApi";
import {
  ApiErrorResponse,
  OppdaterUtkastRequest,
  UtkastResponse,
} from "types/api";
import { resetMapView } from "utils/map";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { statusCode } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { useToast } from "@kvib/react";
import { createSuccessToast } from "utils/components/toast";

// down the line kan vi kalle mutate på URLen etter lagring for å oppdatere staten!

/**
 * Bruk heller UtkastProvider i koden
 */
export const UtkastContext = createContext<UtkastContextValue | undefined>(
  undefined
);

export const UtkastProvider = ({ children }: { children: React.ReactNode }) => {
  const { history, clearHistory } = useHistory();
  const { clearDirtyStyles } = useFeatureStyle();
  const { tokenHolderFunc } = useAuthenticationFlow();
  const [searchParams, setSearchParams] = useSearchParams();
  const { resetAndClearEditingLayer } = useEditAllGrenser();
  const { closeOverlayPanel } = useOverlayPanel();
  const utkastId = searchParams.get("utkast");
  const { setError } = useErrorHandling();
  const toast = useToast();

  const { mutate: globalMutate } = useSWRConfig();

  const {
    data: utkast,
    mutate,
    isValidating,
  } = useNibasApi(
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

  const getUpdateUtkastRequestFromHistory =
    (): OppdaterUtkastRequest | null => {
      if (!utkast) return null;

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
        .find((entry) =>
          entry.changes.some((change) => change.id === utkast.id)
        );

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

      return updatedUtkast;
    };

  const updateUtkast = async (id: string, newUtkast: OppdaterUtkastRequest) => {
    const response = await updateApiUtkast(
      id,
      newUtkast,
      tokenHolderFunc()?.token
    );

    if (statusCode.isSuccessful(response.status)) {
      const json = await response.json();
      await mutate(json as UtkastResponse);
      await globalMutate(["/v1/utkast", tokenHolderFunc()?.token]);
      clearHistory({ hasPreviouslySavedHistory: true });
    } else if (statusCode.isError(response.status)) {
      const wrapper = (await response.json()) as ApiErrorResponse;
      setError({
        title: "Oppdatering av utkast feilet",
        description: wrapper.errorDescription.description,
        errorCode: wrapper.errorCode,
      });
    }
  };

  const updateUtkastWithHistory = async () => {
    const updatedUtkast = getUpdateUtkastRequestFromHistory();

    if (!updatedUtkast || !utkast) return;

    await updateUtkast(utkast.id, updatedUtkast);
    toast(createSuccessToast("Utkastet er lagret"));
  };

  const closeUtkast = () => {
    resetMapView();
    clearHistory({ hasPreviouslySavedHistory: false });
    clearDirtyStyles();
    setSearchParams({});
    resetAndClearEditingLayer();
    closeOverlayPanel();
  };

  const value = {
    utkast,
    getUpdateUtkastRequestFromHistory,
    updateUtkastWithHistory,
    updateUtkast,
    closeUtkast,
    isValidating,
  };

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
  featureCollection: GeoJSONFeatureCollection | GeoJSONFeatureCollection[],
  utkast?: UtkastResponse
) => {
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
