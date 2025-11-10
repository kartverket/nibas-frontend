import { FeatureCollection } from "types/api";
import { fetchUrl } from "utils/api";
import { removeNil } from "utils/list-utils";
import { getUrlWithParameters } from "hooks/useNibasApi";

export const historiskeGrenserFetcher = async (
  kretsIds: string[],
  gyldigTilDate: string,
  kretsType: "stemmekrets" | "grunnkrets",
) => {
  const urlPath =
    kretsType === "stemmekrets"
      ? "/v1/kommuner/{id}/stemmekretsgrenserHistoriske"
      : "/v1/kommuner/{id}/grunnkretsgrenserHistoriske";
  const promises: Promise<FeatureCollection>[] = kretsIds.map(async (kretsId) =>
    fetchUrl([getUrlWithParameters(urlPath, { id: kretsId, gyldigTilDate })]),
  );

  const kretsFeatures = await Promise.all(promises);
  const features = removeNil(kretsFeatures.flatMap((feature) => feature.features));
  return features;
};
