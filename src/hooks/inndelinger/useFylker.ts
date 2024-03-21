import useNibasApi from "../useNibasApi";

const useFylker = (shouldFetch = true) => {
  const { data: fylker, ...rest } = useNibasApi(shouldFetch ? "/v1/fylker" : null);

  const sortedFylker = fylker?.sort((a, b) => {
    return Number(a.nummer) - Number(b.nummer);
  });

  return {
    fylker: sortedFylker,
    ...rest,
  };
};

export default useFylker;
