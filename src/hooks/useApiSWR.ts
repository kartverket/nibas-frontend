import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import useSWR from "swr";
import { paths } from "types/api-gen";
import { fetcherWithToken } from "utils/swr";

type GetPathParameters<T extends keyof paths> = paths[T] extends {
  get: {
    parameters: { path: infer U };
  };
}
  ? U extends Record<string, unknown>
    ? U
    : unknown
  : unknown;

type GetQueryParameters<T extends keyof paths> = paths[T] extends {
  get: {
    parameters: { query: infer U };
  };
}
  ? U extends Record<string, unknown>
    ? U
    : unknown
  : unknown;

type GetParameters<T extends keyof paths> = GetPathParameters<T> &
  GetQueryParameters<T> extends Record<string, unknown>
  ? GetPathParameters<T> & GetQueryParameters<T>
  : never;

// hvis URLen inneholder en get, hent typen som endepunktet skal returnere
type ResponseType<Path extends keyof paths> = paths[Path] extends {
  get: {
    responses: { 200: { content: { "application/json": infer ResType } } };
  };
}
  ? ResType
  : never;

const useApiSWR = <Path extends keyof paths>(
  url: Path,
  params?: GetParameters<Path>
) => {
  const { tokenHolderFunc } = useAuthenticationFlow();

  let modifiedUrl: string = url;

  // gå gjennom alle parametere til Path og bytt de ut i urlen
  if (params) {
    const pathRegex = /{(\w+)}/i;
    const paramKeys = Object.keys(params);
    let pathParams = "";

    for (
      let replaceIndex = 0;
      replaceIndex < paramKeys.length;
      replaceIndex++
    ) {
      const match = pathRegex.exec(modifiedUrl);

      if (match) {
        // hvis match, bytt ut {} med faktisk verdi i url
        modifiedUrl = modifiedUrl.replace(match[0], params[match[1]] as string);
      } else {
        // hvis ikke match, legg på query parameter
        if (pathParams) {
          pathParams = pathParams.concat("&");
        } else {
          pathParams = "?";
        }

        const key = paramKeys[replaceIndex];

        pathParams = pathParams.concat(`${key}=${params[key]}`);
      }
    }

    modifiedUrl = modifiedUrl.concat(pathParams);
  }

  return useSWR<ResponseType<Path>>(
    [modifiedUrl, tokenHolderFunc()?.token],
    fetcherWithToken
  );
};

export default useApiSWR;
