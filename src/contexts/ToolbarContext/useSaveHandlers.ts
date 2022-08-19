import { useCallback } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useSWRConfig } from "swr";
import { ToolbarDraft } from "./types";
import { updateGrunnkrets } from "api/enheter";
import { updateGrenser } from "api/grenser";
import useEditInteractions from "hooks/interactions/useEditInteractions";

const useSaveHandlers = (draft: ToolbarDraft) => {
  const { mutate } = useSWRConfig();
  const { dirtyFeatureIds, clearHistory, undo, redo } = useEditInteractions();

  const { tokenHolderFunc } = useAuthenticationFlow();
  const token = tokenHolderFunc()?.token;

  const saveGrunnkretser = useCallback(() => {
    const kommuneIds = Object.keys(draft.grunnkrets);

    const promises = kommuneIds.map(async (kommuneId) => {
      const grunnkretserDraft = draft.grunnkrets[kommuneId];

      const grunnkretserPromises = Object.keys(grunnkretserDraft).map(
        async (grunnkretsId) => {
          await updateGrunnkrets(
            grunnkretserDraft[grunnkretsId],
            grunnkretsId,
            token
          );

          return mutate([`/v1/grunnkretser/${grunnkretsId}`, token]);
        }
      );

      await Promise.all(grunnkretserPromises);

      return mutate([`/v1/kommuner/${kommuneId}/grunnkretser`, token]);
    });

    return Promise.all(promises);
  }, [draft.grunnkrets, mutate, token]);

  const saveGrenser = useCallback(() => {
    const features = Object.values(draft.grense);

    if (features.length === 0) return;

    const editedFeatures = features.filter((feature) =>
      dirtyFeatureIds.includes((feature.getId() as string) ?? "")
    );

    clearHistory();

    return updateGrenser(editedFeatures, token);
  }, [clearHistory, dirtyFeatureIds, draft.grense, token]);

  return {
    saveGrenser,
    saveGrunnkretser,
    undo,
    redo,
  };
};

export default useSaveHandlers;
