import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import useSWR, { BareFetcher, SWRConfiguration } from "swr";
import { ApiPath } from "types/api";
import { paths } from "types/api-gen";
import { fetcherWithToken } from "utils/api";

// hvis pathen eksponererer et get-kall med path-parametere, returner typen til disse
type GetPathParameters<T extends ApiPath> = paths[T] extends {
    get: {
        parameters: { path: infer U };
    };
}
    ? U extends Record<string, unknown>
        ? U
        : unknown
    : unknown;

// hvis pathen eksponererer et get-kall med query-parametere, returner typen til disse
type GetQueryParameters<T extends ApiPath> = paths[T] extends {
    get: {
        parameters: { query: infer U };
    };
}
    ? U extends Record<string, unknown>
        ? U
        : unknown
    : unknown;

// slå sammen path og query parametere
type GetParameters<T extends ApiPath> = GetPathParameters<T> & GetQueryParameters<T> extends Record<string, unknown>
    ? GetPathParameters<T> & GetQueryParameters<T>
    : never;

// hvis URLen inneholder en get, hent typen som endepunktet skal returnere
type ResponseType<Path extends ApiPath> = paths[Path] extends {
    get: {
        responses: { 200: { content: { "application/json": infer ResType } } };
    };
}
    ? ResType
    : never;

/**
 * Hjelpehook for å gjøre det lettere å kjøre API-kall til nibas APIet
 * @param url Url for data
 * @param params Parametere som skal sendes med requesten, enten path eller query parametere
 * @param swrOptions Options til swr hooken
 * @returns Resultatet fra useSWR(url)
 */
const useNibasApi = <Path extends ApiPath>(
    url: Path | null,
    params?: GetParameters<Path> | null,
    swrOptions?:
        | Partial<
              SWRConfiguration<
                  ResponseType<Path>,
                  // responstypen til options bruker visst any, så da gjør vi det og
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  any,
                  BareFetcher<ResponseType<Path>>
              >
          >
        | undefined,
) => {
    const { tokenHolderFunc } = useAuthenticationFlow();

    let modifiedUrl: string | null = url;

    // gå gjennom alle parametere til Path og bytt de ut i urlen
    if (params && modifiedUrl !== null) {
        const pathRegex = /{(\w+)}/i;
        const paramKeys = Object.keys(params);
        let pathParams = "";

        for (let replaceIndex = 0; replaceIndex < paramKeys.length; replaceIndex++) {
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
                const parameter = params[key];

                // hvis parameteret er undefined, ikke send det med i requesten
                if (parameter) {
                    pathParams = pathParams.concat(`${key}=${parameter}`);
                }
            }
        }

        modifiedUrl = modifiedUrl.concat(pathParams);
    }

    return useSWR<ResponseType<Path>>([modifiedUrl, tokenHolderFunc()?.token], fetcherWithToken, swrOptions);
};

export default useNibasApi;
