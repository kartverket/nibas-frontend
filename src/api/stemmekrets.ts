import { FeatureCollection } from "types/api";
import { fetcherWithToken } from "utils/api";
import { removeNull } from "utils/list-utils";

export const stemmekretsgrenserFetcher = async (stemmekretsIds: string[], token: string | undefined) => {
  const promises: Promise<FeatureCollection>[] = stemmekretsIds.map(async (kretsId) =>
    fetcherWithToken([`/v1/stemmekretser/${kretsId}/grenser`, token]),
  );

  const stemmekretsFeatures = await Promise.all(promises);

  const featureIds = removeNull(
    stemmekretsFeatures.flatMap((feature) => feature.features).map((feature) => feature.id),
  );
  return featureIds;
};
