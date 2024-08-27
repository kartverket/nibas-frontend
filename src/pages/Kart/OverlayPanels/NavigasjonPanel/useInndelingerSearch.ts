import { useAuthentication } from "components/Authentication/AuthenticationHook";
import useToastUnique from "hooks/toast/useToastUnique";
import { InndelingSearchResponse } from "types/api";
import { getUrlForPath, statusCode } from "utils/api";
import { getUrlWithParameters } from "hooks/useNibasApi";

export const useInndelingerSearch = () => {
  const auth = useAuthentication();
  const { toastUnique: searchErrorToast } = useToastUnique({
    status: "error",
    title: "Søket feilet",
    description: "Hvis feilen vedvarer, vennligst kontakt Kartverket",
  });

  const searchInndelinger = async (
    searchString: string,
    limit: number,
    gyldighetsdato: string | undefined,
  ): Promise<InndelingSearchResponse[] | null> => {
    const response = await fetch(
      getUrlForPath(
        getUrlWithParameters("/v1/inndelinger/", {
          gyldighetsdato,
          searchString: encodeURIComponent(searchString),
          limit: limit,
        }) as string,
      ),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
      },
    );

    if (statusCode.isSuccessful(response.status)) {
      return response.json();
    } else if (statusCode.isError(response.status)) {
      searchErrorToast();
    }

    return null;
  };

  return searchInndelinger;
};
