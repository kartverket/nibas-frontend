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

  const stemmekretsFeatures = await Promise.all(promises);

  const featureIds = stemmekretsFeatures
    .flatMap((feature) => feature.features)
    .map((feature) => feature.id);
  return featureIds;
};
