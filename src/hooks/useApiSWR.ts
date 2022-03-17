import useSWR from "swr";
import { paths } from "types/api-gen";
import { fetcher } from "utils/swr";

// type GetParameters<T extends keyof paths> = paths[T] extends {
//   get: { parameters: { path: infer U } };
// }
//   ? keyof U
//   : never;

// hvis URLen inneholder en get, hent typen som endepunktet skal returnere
type ResponseType<Path extends keyof paths> = paths[Path] extends {
  get: {
    responses: { 200: { content: { "application/json": infer ResType } } };
  };
}
  ? ResType
  : never;

const useApiSWR = <Path extends keyof paths>(url: Path) => {
  return useSWR<ResponseType<Path>>(url, fetcher);
};

export default useApiSWR;
