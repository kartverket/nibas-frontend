import useSWR, { BareFetcher, SWRConfiguration } from "swr";
import { paths as arbeidslistePaths } from "types/api-gen-arbeidsliste";
import { fetchUrl } from "utils/api";

// Define types for path and query parameters
type GetPathParameters<T extends keyof arbeidslistePaths> = arbeidslistePaths[T] extends {
  get: {
    parameters: { path: infer U };
  };
}
  ? U extends Record<string, unknown>
    ? U
    : unknown
  : unknown;

type GetQueryParameters<T extends keyof arbeidslistePaths> = arbeidslistePaths[T] extends {
  get: {
    parameters: { query?: infer U };
  };
}
  ? U extends Record<string, unknown>
    ? U
    : unknown
  : unknown;

// Combine path and query parameters
type GetParameters<T extends keyof arbeidslistePaths> =
  GetPathParameters<T> & GetQueryParameters<T> extends Record<string, unknown>
    ? GetPathParameters<T> & GetQueryParameters<T>
    : never;

// Get response type for a given path
type ResponseType<Path extends keyof arbeidslistePaths> = arbeidslistePaths[Path] extends {
  get: {
    responses: { 200: { content: { "application/json": infer ResType } } };
  };
}
  ? ResType
  : never;

export const getArbeidslisteUrlForPath = (path: string): string => {
  const baseUrl = document.location.origin ?? "http://localhost:3000";

  // Prepend proxy path for arbeidsliste API
  const proxyBasePath = "/v1/proxy/arbeidsliste";
  if (!path.startsWith(proxyBasePath)) {
    path = `${proxyBasePath}${path}`;
  }

  if (path.startsWith("http")) {
    return path;
  }

  if (path.startsWith("/")) {
    return baseUrl + path;
  }
  return `${baseUrl}/${path}`;
};
// Helper function to construct URLs with parameters
export const getArbeidslisteUrlWithParameters = <Path extends keyof arbeidslistePaths>(
  url: Path | null,
  params: GetParameters<Path>,
) => {
  if (params == null || url == null) {
    return url;
  }

  let modifiedUrl = url.toString();

  const pathRegex = /{(\w+)}/i;
  const paramKeys = Object.keys(params);
  let pathParams = "";

  for (let replaceIndex = 0; replaceIndex < paramKeys.length; replaceIndex++) {
    const match = pathRegex.exec(modifiedUrl);

    if (match) {
      // Replace path parameters
      modifiedUrl = modifiedUrl.replace(match[0], params[match[1]] as string);
    } else {
      // Add query parameters
      if (pathParams) {
        pathParams = pathParams.concat("&");
      } else {
        pathParams = "?";
      }

      const key = paramKeys[replaceIndex];
      const parameter = params[key];

      if (parameter != null) {
        pathParams = pathParams.concat(`${key}=${parameter}`);
      }
    }
  }

  return modifiedUrl.concat(pathParams);
};

// TODO: TS-2536
// Main hook for fetching data from arbeidsliste API
const useArbeidslisteApi = <Path extends keyof arbeidslistePaths>(
  url: Path | null,
  params?: GetParameters<Path> | null,
  swrOptions?:
    | Partial<
        SWRConfiguration<
          ResponseType<Path>,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          any,
          BareFetcher<ResponseType<Path>>
        >
      >
    | undefined,
) => {
  const urlWithOptionalParams = params ? getArbeidslisteUrlWithParameters(url, params) : url;

  return useSWR<ResponseType<Path>>([urlWithOptionalParams], fetchUrl, swrOptions);
};

export default useArbeidslisteApi;
