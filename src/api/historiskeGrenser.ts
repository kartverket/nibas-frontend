import { getUrlWithParameters } from "hooks/useNibasApi";
import { HistoriskeGrenserInndelingtype } from "pages/Kart/interactions/useHistoriskeGrenser";
import { FeatureCollection } from "types/api";
import { fetchUrl } from "utils/api";
import { removeNil } from "utils/list-utils";

export const historiskeGrenserFetcher = async (
  kretsIds: string[],
  gyldigTilDate: string,
  inndelingType: HistoriskeGrenserInndelingtype,
) => {
  const urlPath =
    inndelingType === "STEMMEKRETS"
      ? "/v1/kommuner/{id}/stemmekretsgrenserHistoriske"
      : "/v1/kommuner/{id}/grunnkretsgrenserHistoriske";
  const promises: Promise<FeatureCollection>[] = kretsIds.map(async (kretsId) =>
    fetchUrl([getUrlWithParameters(urlPath, { id: kretsId, gyldigTilDate })]),
  );

  const inndelingFeatures = await Promise.all(promises);
  const features = removeNil(inndelingFeatures.flatMap((feature) => feature.features));
  return features;
};
