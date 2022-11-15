import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import useFylker from "hooks/inndelinger/useFylker";
import useAddInndelingerKontekst from "hooks/useAddInndelingerKontekst";
import { useEffect, useMemo, useState } from "react";
import useSWRImmutable from "swr/immutable";
import { FeatureCollection } from "types/api";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import { fetcherWithToken } from "utils/swr";

const fylkesgrenserFetcher = async (
  fylkeIds: string[],
  token: string | undefined
) => {
  const promises: Promise<FeatureCollection>[] = fylkeIds.map(async (fylkeId) =>
    fetcherWithToken(`/v1/fylker/${fylkeId}/grenser`, token)
  );

  const settledPromises = await Promise.allSettled(promises);
  const geoJsons = settledPromises.reduce((acc, promise) => {
    if (promise.status === "fulfilled") {
      acc.push(promise.value);
    }

    return acc;
  }, [] as FeatureCollection[]);

  return geoJsons.flatMap((geoJson) => geoJson.features);
};

const useFylkesgrenser = (shouldFetch: boolean) => {
  const [isFetching, setIsFetching] = useState(false);
  const { fylker } = useFylker(shouldFetch);
  const fylkeIds = fylker?.map((fylke) => fylke.id) ?? [];
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { data: geoJsonFeatures } = useSWRImmutable(
    shouldFetch ? [fylkeIds, tokenHolderFunc()?.token] : null,
    fylkesgrenserFetcher
  );

  useEffect(() => {
    if (!shouldFetch) return;

    if (fylker && geoJsonFeatures) {
      setIsFetching(false);
    } else {
      setIsFetching(true);
    }
  }, [fylker, geoJsonFeatures, shouldFetch]);

  const features = useMemo(() => {
    if (!geoJsonFeatures) {
      return null;
    }

    return geoJsonFeatures.flatMap(getFeaturesFromGeoJson);
  }, [geoJsonFeatures]);

  useAddInndelingerKontekst(features, "fylke", "fylker");

  return { fylkesgrenser: features, isFetching };
};

export default useFylkesgrenser;
