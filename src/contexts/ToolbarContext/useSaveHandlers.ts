import { useCallback } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useSWRConfig } from "swr";
import { GrenseEntry, GrunnkretsEntry, HistoryEntry } from "./types";
import { updateGrunnkrets } from "api/enheter";
import { updateGrenser } from "api/grenser";
import { History } from "hooks/useHistory";
import { getLayerById } from "utils/map/layers";
import { GrunnkretsRequest } from "types/api";

const getSaveGrunnkretserObject = (history: History<HistoryEntry>) => {
  return history.entries
    .slice(0, history.index)
    .filter((entry) => entry.type === "grunnkrets")
    .reduce((acc, entry) => {
      // overskriv gamle ids med de nyere endringene
      const grunnkretsEntry = entry as GrunnkretsEntry;
      grunnkretsEntry.changes.forEach((change) => {
        if (!change.to) return acc;

        acc = {
          ...acc,
          [grunnkretsEntry.kommuneId]: {
            ...(acc[grunnkretsEntry.kommuneId] ?? {}),
            [change.id]: change.to,
          },
        };
      });

      return acc;
    }, {} as Record<string, Record<string, GrunnkretsRequest>>);
};

const getSaveGrenserObject = (history: History<HistoryEntry>) => {
  return history.entries
    .slice(0, history.index)
    .filter((entry) => entry.type === "grense")
    .reduce((acc, entry) => {
      const grenseEntry = entry as GrenseEntry;
      grenseEntry.changes.forEach((change) => {
        if (!change.to) return acc;

        acc = {
          ...acc,
          [change.id]: change.to,
        };
      });

      return acc;
    }, {} as Record<string, number[][]>);
};

const useSaveHandlers = (history: History<HistoryEntry>) => {
  const { mutate } = useSWRConfig();

  const { tokenHolderFunc } = useAuthenticationFlow();
  const token = tokenHolderFunc()?.token;

  const saveGrunnkretser = useCallback(() => {
    const grunnkretsByIdByKommuneId = getSaveGrunnkretserObject(history);
    const kommuneIds = Object.keys(grunnkretsByIdByKommuneId);

    const promises = kommuneIds.map(async (kommuneId) => {
      const grunnkretserBykommuneId = grunnkretsByIdByKommuneId[kommuneId];
      const innerPromises = Object.keys(grunnkretserBykommuneId).map(
        async (grunnkretsId) => {
          await updateGrunnkrets(
            grunnkretserBykommuneId[grunnkretsId],
            grunnkretsId,
            token
          );
          return mutate([`/v1/grunnkretser/${grunnkretsId}`, token]);
        }
      );

      await Promise.all(innerPromises);

      return mutate([`/v1/kommuner/${kommuneId}/grunnkretser`, token]);
    });

    return Promise.all(promises);
  }, [history, mutate, token]);

  const saveGrenser = useCallback(() => {
    const featureIds = Object.keys(getSaveGrenserObject(history));
    const editedFeatures = getLayerById("edit")
      .getSource()
      .getFeatures()
      .filter((feature) =>
        featureIds.includes((feature.getId() as string) ?? "")
      );

    if (editedFeatures.length === 0) return;

    return updateGrenser(editedFeatures, token);
  }, [history, token]);

  return {
    saveGrenser,
    saveGrunnkretser,
  };
};

export default useSaveHandlers;
