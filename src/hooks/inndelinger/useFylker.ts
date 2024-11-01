import useNibasApi from "../useNibasApi";

const useFylker = (gyldighetsdato: string | undefined, shouldFetch = true) => {
  const { data: fylker, ...rest } = useNibasApi(shouldFetch ? "/v1/fylker" : null, { gyldighetsdato });

  const sortedFylker = fylker?.sort((a, b) => {
    return Number(a.nummer) - Number(b.nummer);
  });

  return {
    fylker: sortedFylker,
    ...rest,
  };
};

export default useFylker;
