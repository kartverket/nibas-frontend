import { FeatureCollection } from "types/api";
import { fetcherWithToken } from "utils/api";
import { removeNil } from "utils/list-utils";
import { getUrlWithParameters } from "hooks/useNibasApi";

export const stemmekretsgrenserFetcher = async (
  stemmekretsIds: string[],
  gyldighetsdato: string | undefined,
  token: string | undefined,
) => {
  const promises: Promise<FeatureCollection>[] = stemmekretsIds.map(async (kretsId) =>
    fetcherWithToken([getUrlWithParameters("/v1/stemmekretser/{id}/grenser", { id: kretsId, gyldighetsdato }), token]),
  );

  const stemmekretsFeatures = await Promise.all(promises);

  const featureIds = removeNil(stemmekretsFeatures.flatMap((feature) => feature.features).map((feature) => feature.id));
  return featureIds;
};
