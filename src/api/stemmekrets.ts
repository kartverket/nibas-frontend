import { FeatureCollection } from "types/api";
import { fetcherWithToken } from "utils/api";

export const stemmekretsgrenserFetcher = async (
  stemmekretsIds: string[],
  token: string | undefined
) => {
  const promises: Promise<FeatureCollection>[] = stemmekretsIds.map(
    async (kretsId) =>
      fetcherWithToken(`/v1/stemmekretser/${kretsId}/grenser`, token)
  );

  const settledPromises = await Promise.allSettled(promises);

  const features = settledPromises.reduce((acc, promise) => {
    if (promise.status === "fulfilled") {
      acc.push(promise.value);
    }

    return acc;
  }, [] as FeatureCollection[]);

  const featureIds = features
    .flatMap((feature) => feature.features)
    .map((feature) => feature.id);
  return featureIds;
};
