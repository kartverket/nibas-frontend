import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useMatch } from "react-router-dom";
import { useSWRConfig } from "swr";
import { EntityUtkastType, UtkastContextValue, UtkastEntity, UtkastRequestWithoutOperations } from "./types";
import {
  addTempFeatureIdToNewFeaturesInUtkast,
  applyNonFeatureUtkast,
  historyToUtkastOperations,
  toCleanUtkast,
} from "./utkast-utils";
import { updateUtkastApi } from "api/utkast";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { HistoryChange } from "contexts/HistoryContext/types";
import useNibasApi from "hooks/useNibasApi";
import { ApiErrorResponse, OppdaterUtkastRequest, UtkastResponse } from "types/api";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { statusCode } from "utils/api";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { useToast } from "@kvib/react";
import { routes } from "utils/routes";
import { addEditedFeaturesToSource, removeEditedFeaturesFromSourceByIds } from "utils/map/source";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import { FeatureIdWithEndpoints, getAllFeatureEndPointCoordinates, isFeatureDeadEnd } from "utils/features";
import { removeNil } from "utils/list-utils";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { isTempFeatureId } from "pages/Kart/interactions/feature-id-utils";

export const UtkastContext = createContext<UtkastContextValue | undefined>(undefined);

export const UtkastProvider = ({ children }: { children: React.ReactNode }) => {
  const [utkast, setUtkast] = useState<UtkastResponse>();
  const auth = useAuthentication();

  const { history, clearHistory } = useHistory();
  const { addDirtyStyles, addErrorStyles, clearFeatureStyles } = useFeatureStyle();
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
    utkastId != null ? "/v1/utkast/{id}" : null,
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
    clearHistory();
    clearFeatureStyles();
  }, [clearFeatureStyles, clearHistory]);

  useEffect(() => {
    if (fetchedUtkast && !utkast) {
      setUtkast(addTempFeatureIdToNewFeaturesInUtkast(fetchedUtkast));
    }

    // fjern utkast hvis utkastid ikke er i url
    if (utkastId == null && utkast) {
      setUtkast(undefined);
      closeUtkast();
      mutate();
    }
  }, [fetchedUtkast, utkastId, mutate, utkast, closeUtkast]);

  const getUpdateUtkastRequestFromHistory = (): OppdaterUtkastRequest | null => {
    if (!utkast) {
      return null;
    }

    const operasjoner = historyToUtkastOperations(history, utkast);
    const updatedUtkast: OppdaterUtkastRequest = {
      endringstype: utkast.endringstype,
      navn: utkast.navn,
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
      }
    }

    return updatedUtkast;
  };

  const updateUtkast = async (id: string, newUtkast: OppdaterUtkastRequest, shouldClearHistory: boolean = true) => {
    const response = await updateUtkastApi(id, toCleanUtkast(newUtkast), auth.token);

    if (statusCode.isSuccessful(response.status)) {
      const updatedUtkast = (await response.json()) as UtkastResponse;
      await mutate(updatedUtkast);
      await globalMutate(["/v1/utkast", auth.token]);
      if (shouldClearHistory) {
        clearHistory();
      }

      // Ved lagring av utkast ble det mismatch mellom state i OpenLayers og state i react
      // For å forhindre dette sletter vi alle grenser med midlertidig id fra det gamle utkastet, slik at disse ikke lenger kan redigeres i OL
      // Grensene vi får fra det oppdaterte utkastet kan da legges tilbake igjen slik at staten vi har i utkastet stemmer overens med staten vi har i OL
      const oldFeatures = newUtkast.operasjoner.grenseendringer.endredeFeatures;

      if (oldFeatures.length > 0) {
        const oldFeaturesWithTempId = oldFeatures
          .filter((feature) => isTempFeatureId(feature.id))
          .map((feature) => feature.id);
        removeEditedFeaturesFromSourceByIds(removeNil(oldFeaturesWithTempId));
      }

      const updatedUtkastWithTempFeatureIds = addTempFeatureIdToNewFeaturesInUtkast(updatedUtkast);

      const geoJsonFeaturesToBeAddedToSource =
        updatedUtkastWithTempFeatureIds.operasjoner.grenseendringer.endredeFeatures.filter((feature) =>
          isTempFeatureId(feature.id),
        );

      const featuresToBeAddedToSource = geoJsonFeaturesToBeAddedToSource.flatMap(getFeaturesFromGeoJson);

      // Liker ikke at jeg må legge til dette her også, burde sikkert kunne bli fikset med at useKretsgrenser er litt smartere i når den må oppdatere seg
      if (featuresToBeAddedToSource.length > 0) {
        addEditedFeaturesToSource(featuresToBeAddedToSource);
        const coords = getAllFeatureEndPointCoordinates(["archived", "matrikkel"]).filter(
          (coord) => !!coord,
        ) as FeatureIdWithEndpoints[];
        featuresToBeAddedToSource.forEach((feature) => {
          const featureId = feature.getId()?.toString();

          if (featureId != null) {
            if (isFeatureDeadEnd(feature, coords)) {
              addErrorStyles([featureId]);
            } else {
              addDirtyStyles([featureId]);
            }
          }
        });
      }

      setUtkast(updatedUtkast);
    } else if (statusCode.isConflict(response.status)) {
      setError({
        title: "Konflikt ved lagring av utkast",
        description:
          "Det oppstod en konflikt ved lagring av utkastet. Dette kan oppstå om to eller flere personer har jobbet samtidig på det samme utkastet.\n\n Vennligst oppdater siden og forsøk å gjøre føringen på nytt, eventuelt kan du gjøre det i et nytt utkast.",
      });
    } else if (statusCode.isError(response.status)) {
      const wrapper = (await response.json()) as ApiErrorResponse;

      setError({
        title: "Oppdatering av utkast feilet",
        description: wrapper.errorDescription.description,
        errorCode: wrapper.errorCode,
      });
    } else {
      setError({
        title: "Oppdatering av utkast feilet",
        description: "En ukjent feil oppstod ved lagring av utkastet.",
      });
    }

    return statusCode.isSuccessful(response.status);
  };

  const updateUtkastWithHistory = async () => {
    const updatedUtkast = getUpdateUtkastRequestFromHistory();

    if (!updatedUtkast || !utkast) {
      return;
    }

    if (await updateUtkast(utkast.id, updatedUtkast)) {
      toast({ status: "success", title: "Utkastet er lagret" });
    }
  };

  /**
   * Går gjennom utkastets knotete operasjonstruktur for å sjekke om utkastet har lagrede endringer
   * @returns Hvorvidt utkastet har lagrede endringer eller ei
   */
  const utkastHarEndringer = () => {
    if (!utkast?.operasjoner) {
      return false;
    }
    const endredeFeatures = utkast.operasjoner.grenseendringer.endredeFeatures;
    if (Object.keys(endredeFeatures).length > 0) {
      return true;
    }

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
    if (!entity || !utkast) {
      return entity;
    }

    return applyNonFeatureUtkast(entity, utkast, type);
  }, [entity, utkast, type]);
};
