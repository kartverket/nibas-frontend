import { BopliktomraadeResponse } from "types/api";
import { NonExhaustiveInndelingtype } from "pages/Kart/OverlayPanels/FlatedataPanel/FlatedataTable";
import { useBopliktomraader } from "./useBopliktomraader";

export type NonExhaustiveInndelingResponse = BopliktomraadeResponse;

const nonExhaustiveInndelingHooks = {
  BOPLIKTOMRAADE: useBopliktomraader,
} satisfies Record<NonExhaustiveInndelingtype, unknown>;

export const useNonExhaustiveInndelinger = (
  inndelingIds: string[],
  gyldighetsdato: string | undefined,
  shouldFetch: boolean = true,
) => {
  const { data: bopliktomraader, isLoading: isLoadingBopliktomraader } = nonExhaustiveInndelingHooks.BOPLIKTOMRAADE(
    inndelingIds,
    gyldighetsdato,
    shouldFetch,
  );

  return {
    data: bopliktomraader,
    isLoading: isLoadingBopliktomraader,
  };
};
