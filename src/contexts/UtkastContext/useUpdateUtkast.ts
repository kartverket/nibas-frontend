import { useCallback } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { updateUtkast } from "api/utkast";
import { ToolbarHistory } from "contexts/ToolbarContext";
import { historyToUtkastOperations } from "contexts/UtkastContext/utils";
import { UtkastRequest, UtkastResponse } from "types/api";
import { useSWRConfig } from "swr";

const useUpdateUtkast = (history: ToolbarHistory, utkast?: UtkastResponse) => {
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { mutate } = useSWRConfig();

  return useCallback(async () => {
    if (!utkast) return;

    const token = tokenHolderFunc()?.token;

    const operasjoner = historyToUtkastOperations(history, utkast);

    const updatedUtkast: UtkastRequest = {
      endringstype: utkast.endringstype,
      navn: utkast.navn,
      gyldigFra: utkast.gyldigFra,
      operasjoner,
    };

    console.log("New utkast", updatedUtkast);

    return mutate(
      [`/v1/utkast/${utkast.id}`, token],
      updateUtkast(utkast.id, updatedUtkast, tokenHolderFunc()?.token)
    );
  }, [history, tokenHolderFunc, utkast, mutate]);
};

export default useUpdateUtkast;
