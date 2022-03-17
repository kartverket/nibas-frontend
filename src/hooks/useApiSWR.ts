import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import useSWR from "swr";
import { paths } from "types/api-gen";
import { fetcherWithToken } from "utils/swr";

type GetParameters<T extends keyof paths> = paths[T] extends {
  get: {
    parameters: { path: infer U };
  };
}
  ? U extends Record<string, unknown>
    ? U
    : never
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

  if (params) {
    const curlyRegex = /{(\w+)}/i;
    console.log("url", url);
    for (
      let replaceIndex = 0;
      replaceIndex < Object.keys(params).length;
      replaceIndex++
    ) {
      const match = curlyRegex.exec(modifiedUrl);
      console.log("regex match", match);

      if (!match) break;

      modifiedUrl = modifiedUrl.replace(match[0], params[match[1]] as any);
      console.log("New modified url", modifiedUrl);
    }
  }

  return useSWR<ResponseType<Path>>(
    [modifiedUrl, tokenHolderFunc()?.token],
    fetcherWithToken
  );
};

export default useApiSWR;
