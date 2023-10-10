import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { useMatch } from "react-router-dom";
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
import { updateUtkastApi } from "api/utkast";
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
import { routes } from "utils/routes";
import { useSidebarPanel } from "contexts/SidebarPanelContext";

// down the line kan vi kalle mutate på URLen etter lagring for å oppdatere staten!

/**
 * Bruk heller UtkastProvider i koden
 */
export const UtkastContext = createContext<UtkastContextValue | undefined>(
  undefined,
);

export const UtkastProvider = ({ children }: { children: React.ReactNode }) => {
  const [utkast, setUtkast] = useState<UtkastResponse>();

  const { history, clearHistory } = useHistory();
  const { clearDirtyStyles } = useFeatureStyle();
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { resetAndClearAllLayers } = useEditAllGrenser();
  const { closeOverlayPanel } = useOverlayPanel();
  const { closeSidebarPanel } = useSidebarPanel();
  const { setError } = useErrorHandling();
  const toast = useToast();

  const utkastPathMatch = useMatch(`${routes.utkast}/${routes.utkastId}`);
  const utkastIdMatches = utkastPathMatch?.params["utkastId"]?.match(
    "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}",
  );
  const utkastId = utkastIdMatches ? utkastIdMatches[0] : null;

  const { mutate: globalMutate } = useSWRConfig();
  const {
    data: fetchedUtkast,
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
    },
  );

  // Når utkast lukkes ønsker vi å tilbakestille store deler av applikasjonen
  const closeUtkast = useCallback(() => {
    setUtkast(undefined);
    resetMapView();
    clearHistory({ hasPreviouslySavedHistory: false });
    clearDirtyStyles();
    resetAndClearAllLayers();
    closeOverlayPanel();
    closeSidebarPanel();
  }, [
    clearDirtyStyles,
    clearHistory,
    closeOverlayPanel,
    closeSidebarPanel,
    resetAndClearAllLayers,
  ]);

  useEffect(() => {
    if (fetchedUtkast && !utkast) {
      setUtkast(fetchedUtkast);
    }

    // fjern utkast hvis utkastid ikke er i url
    if (!utkastId && utkast) {
      setUtkast(undefined);
      closeUtkast();
      mutate();
    }
  }, [fetchedUtkast, utkastId, mutate, utkast, closeUtkast]);

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
          entry.changes.some((change) => change.id === utkast.id),
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
    const response = await updateUtkastApi(
      id,
      newUtkast,
      tokenHolderFunc()?.token,
    );

    if (statusCode.isSuccessful(response.status)) {
      const updatedUtkast = (await response.json()) as UtkastResponse;
      await mutate(updatedUtkast);
      await globalMutate(["/v1/utkast", tokenHolderFunc()?.token]);
      clearHistory({ hasPreviouslySavedHistory: true });
      setUtkast(updatedUtkast);
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
    toast({ status: "success", title: "Utkastet er lagret" });
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
  type: EntityUtkastType,
) => {
  const { utkast } = useUtkast();

  return useMemo(() => {
    if (!entity || !utkast) return entity;

    return applyNonFeatureUtkast(entity, utkast, type);
  }, [entity, utkast, type]);
};

export const useUtkastFeature = (
  featureCollection: GeoJSONFeatureCollection | GeoJSONFeatureCollection[],
  utkast?: UtkastResponse,
) => {
  return useMemo(() => {
    if (!featureCollection || !utkast) return featureCollection;

    if (Array.isArray(featureCollection)) {
      return featureCollection.map((collection) =>
        applyFeatureUtkast(collection, utkast),
      );
    }

    return applyFeatureUtkast(featureCollection, utkast);
  }, [featureCollection, utkast]);
};
