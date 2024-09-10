import useNibasApi from "hooks/useNibasApi";

type UtkastStatus = ("OPPRETTET" | "PUBLISERT" | "FORKASTET")[];

export const useUtkasts = (status?: UtkastStatus, gyldigFra?: string | undefined) => {
  const {
    data: utkasts,
    isLoading,
    mutate,
  } = useNibasApi("/v1/utkast", { utkastStatus: status, gyldigFra: gyldigFra });

  return { data: utkasts, isLoading, mutate };
};
