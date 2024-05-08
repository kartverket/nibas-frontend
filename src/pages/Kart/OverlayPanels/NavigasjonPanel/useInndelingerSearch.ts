import { useAuthentication } from "components/Authentication/AuthenticationHook";
import useToastUnique from "hooks/toast/useToastUnique";
import { InndelingSearchResponse } from "types/api";
import { getUrlForPath, statusCode } from "utils/api";

export const useInndelingerSearch = () => {
  const auth = useAuthentication();
  const { toastUnique: searchErrorToast } = useToastUnique({
    status: "error",
    title: "Søket feilet",
    description: "Vennligst prøv igjen. Ta kontakt med Kartverket om feilen vedvarer.",
  });

  const searchInndelinger = async (searchString: string, limit: number): Promise<InndelingSearchResponse[] | null> => {
    const response = await fetch(
      getUrlForPath(
        `v1/inndelinger/?searchString=${encodeURIComponent(searchString)}&limit=${encodeURIComponent(limit)}`,
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
