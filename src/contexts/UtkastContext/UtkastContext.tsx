import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { useMatch } from "react-router-dom";
import { useSWRConfig } from "swr";
import { EntityUtkastType, UtkastContextValue, UtkastEntity, UtkastRequestWithoutOperations } from "./types";
import {
  addTempFeatureIdToNewFeaturesInUtkast,
  applyFeatureUtkast,
  applyNonFeatureUtkast,
  historyToUtkastOperations,
  toCleanUtkast,
} from "./utils";
import { updateUtkastApi } from "api/utkast";
import { HistoryChange, useHistory } from "contexts/HistoryContext";
import useNibasApi from "hooks/useNibasApi";
import { ApiErrorResponse, OppdaterUtkastRequest, UtkastOperasjoner, UtkastResponse } from "types/api";
import { resetMapView } from "utils/map";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { statusCode } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { useToast } from "@kvib/react";
import { routes } from "utils/routes";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import { isTempFeatureId } from "pages/Kart/interactions/tempFeatureIdUtil";
import useDirtyStyles from "contexts/FeatureStyleContext/useDirtyStyles";
import { CustomOption } from "pages/Kart/OverlayPanels/hooks/tilhorighetUtils";

// down the line kan vi kalle mutate på URLen etter lagring for å oppdatere staten!

/**
 * Bruk heller UtkastProvider i koden
 */
export const UtkastContext = createContext<UtkastContextValue | undefined>(undefined);

export const UtkastProvider = ({ children }: { children: React.ReactNode }) => {
  const [utkast, setUtkast] = useState<UtkastResponse>();

  const { history, clearHistory } = useHistory();
  const { clearFeatureStyles } = useFeatureStyle();
  const { addDirtyFeatures } = useDirtyStyles();
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { resetAndClearAllLayers } = useEditAllGrenser();
  const { closeOverlayPanel } = useOverlayPanel();
  const { closeSidebarPanel } = useSidebarPanel();
  const { setError } = useErrorHandling();
  const { resetTool, resetModeTools } = useToolbar();
  const toast = useToast();
  const { resetKartlag } = useKartlag();

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
    resetKartlag();
    clearHistory({ hasPreviouslySavedHistory: false });
    clearFeatureStyles();
    resetAndClearAllLayers();
    closeOverlayPanel();
    closeSidebarPanel();
    resetModeTools();
    resetTool();
  }, [
    clearFeatureStyles,
    clearHistory,
    closeOverlayPanel,
    closeSidebarPanel,
    resetAndClearAllLayers,
    resetKartlag,
    resetModeTools,
    resetTool,
  ]);

  useEffect(() => {
    if (fetchedUtkast && !utkast) {
      setUtkast(addTempFeatureIdToNewFeaturesInUtkast(fetchedUtkast));
    }

    // fjern utkast hvis utkastid ikke er i url
    if (!utkastId && utkast) {
      setUtkast(undefined);
      closeUtkast();
      mutate();
    }
  }, [fetchedUtkast, utkastId, mutate, utkast, closeUtkast]);

  const operasjonerIsValid = (operasjoner: UtkastOperasjoner): boolean => {
    const endredeFeatures = operasjoner.grenseendringer.endredeFeatures;

    for (const feature of endredeFeatures) {
      const featureProperties = feature.properties;
      if (
        !featureProperties.kontekstEgenskaper ||
        feature.properties.kontekstEgenskaper.length < 2 ||
        featureProperties.kontekstEgenskaper.find((kontekst) => kontekst.id?.lokalid.value === CustomOption.NOT_CHOSEN)
      ) {
        toast({
          status: "error",
          title: "Grense mangler tilhørighet",
          description: `Grense med ID ${feature.id} mangler obligatorisk grenseinformasjon. Husk at nye grenser må få satt tilhørighet før lagring,`,
        });
        return false;
      }
    }

    return true;
  };

  const getUpdateUtkastRequestFromHistory = (): OppdaterUtkastRequest | null => {
    if (!utkast) return null;

    const operasjoner = historyToUtkastOperations(history, utkast);

    if (!operasjonerIsValid(operasjoner)) return null;

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
      const change = (utkastEntry.changes as HistoryChange<UtkastRequestWithoutOperations>[]).find(
        (c) => c.id === utkast.id,
      );

      if (change?.to) {
        updatedUtkast.endringstype = change.to.endringstype;
        updatedUtkast.navn = change.to.navn;
        updatedUtkast.gyldigFra = change.to.gyldigFra;
      }
    }

    return updatedUtkast;
  };

  const updateUtkast = async (id: string, newUtkast: OppdaterUtkastRequest) => {
    const response = await updateUtkastApi(id, toCleanUtkast(newUtkast), tokenHolderFunc()?.token);

    if (statusCode.isSuccessful(response.status)) {
      const updatedUtkast = (await response.json()) as UtkastResponse;
      await mutate(updatedUtkast);
      await globalMutate(["/v1/utkast", tokenHolderFunc()?.token]);
      clearHistory({ hasPreviouslySavedHistory: true });

      // Ved lagring av utkast ble det mismatch mellom state i OpenLayers og state i react
      // For å forhindre dette sletter vi alle grenser med midlertidig id fra det gamle utkastet, slik at disse ikke lenger kan redigeres i OL
      // Grensene vi får fra det oppdaterte utkastet kan da legges tilbake igjen slik at staten vi har i utkastet stemmer overens med staten vi har i OL
      const oldFeatures = newUtkast.operasjoner.grenseendringer.endredeFeatures;

      if (oldFeatures) {
        const oldFeaturesWithTempId = oldFeatures
          .filter((feature) => isTempFeatureId(feature.id))
          .map((feature) => feature.id as string);

        removeFeaturesFromSourceByIds("edit", oldFeaturesWithTempId);
      }

      const updatedUtkastWithTempFeatureIds = addTempFeatureIdToNewFeaturesInUtkast(updatedUtkast);

      const geoJsonFeaturesToBeAddedToSource =
        updatedUtkastWithTempFeatureIds.operasjoner.grenseendringer.endredeFeatures.filter((feature) =>
          isTempFeatureId(feature.id),
        );

      const featuresToBeAddedToSource = geoJsonFeaturesToBeAddedToSource.flatMap(getFeaturesFromGeoJson);

      addFeaturesToSource("edit", featuresToBeAddedToSource);
      addDirtyFeatures(featuresToBeAddedToSource.map((feature) => feature.getId() as string));

      setUtkast(updatedUtkastWithTempFeatureIds);
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

  /**
   * Går gjennom utkastets knotete operasjonstruktur for å sjekke om utkastet har lagrede endringer
   * @returns Hvorvidt utkastet har lagrede endringer eller ei
   */
  const utkastHarEndringer = () => {
    if (!utkast?.operasjoner) return false;
    const endredeFeatures = utkast.operasjoner.grenseendringer.endredeFeatures;
    if (Object.keys(endredeFeatures).length > 0) return true;

    // Går gjennom metadataendringsobjektene og sjekker om de er tomme
    for (const endringstype of Object.values(utkast.operasjoner.metadataendringer)) {
      if (Object.keys(endringstype).length > 0) {
        return true;
      }
    }

    return false;
  };

  const value = {
    utkast,
    utkastHarEndringer,
    getUpdateUtkastRequestFromHistory,
    updateUtkastWithHistory,
    updateUtkast,
    closeUtkast,
    isValidating,
  };

  return <UtkastContext.Provider value={value}>{children}</UtkastContext.Provider>;
};

export const useUtkast = () => {
  const context = useContext(UtkastContext);

  if (!context) {
    throw new Error("useUtkast must be used within a UtkastProvider");
  }

  return context;
};

export const useUtkastEntity = <T extends UtkastEntity>(entity: T, type: EntityUtkastType) => {
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
      return featureCollection.map((collection) => applyFeatureUtkast(collection, utkast));
    }

    return applyFeatureUtkast(featureCollection, utkast);
  }, [featureCollection, utkast]);
};
