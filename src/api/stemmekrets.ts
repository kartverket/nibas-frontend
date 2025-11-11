import { FeatureCollection } from "types/api";
import { fetchUrl } from "utils/api";
import { removeNil } from "utils/list-utils";
import { getUrlWithParameters } from "hooks/useNibasApi";

export const stemmekretsgrenserFetcher = async (stemmekretsIds: string[], gyldighetsdato: string | undefined) => {
  const promises: Promise<FeatureCollection>[] = stemmekretsIds.map(async (kretsId) =>
    fetchUrl([getUrlWithParameters("/v1/stemmekretser/{id}/grenser", { id: kretsId, gyldighetsdato })]),
  );

  const stemmekretsFeatures = await Promise.all(promises);

  const featureIds = removeNil(stemmekretsFeatures.flatMap((feature) => feature.features).map((feature) => feature.id));
  return featureIds;
};
