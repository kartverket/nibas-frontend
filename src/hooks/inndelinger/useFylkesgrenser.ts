import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useFylkerResponse } from "hooks/inndelinger/useFylker";
import useAddInndelingerKontekst from "hooks/useAddInndelingerKontekst";
import { useEffect, useMemo, useState } from "react";
import useSWRImmutable from "swr/immutable";
import { FeatureCollection, FylkeResponse } from "types/api";
import { getIdFromEntity, fetcherWithToken } from "utils/api";
import { getFeatureFromGeoJson, getFeaturesFromGeoJson } from "utils/map/geoJson";
import { useEditGrenseValue } from "contexts/EditGrenserContext/useEditGrense";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import { getRepresentasjonspunktId } from "utils/map/source";

const fylkesgrenserFetcher = async ([fylkeIds, token]: [string[], string | undefined]) => {
  const promises: Promise<FeatureCollection>[] = fylkeIds.map(async (fylkeId) =>
    fetcherWithToken([`/v1/fylker/${fylkeId}/grenser`, token]),
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

const getRepresentasjonspunktFeatureForFylke = (fylke: FylkeResponse): GeoJSONFeature => {
  return getFeatureFromGeoJson({
    ...fylke.representasjonspunkt,
    id: getRepresentasjonspunktId(fylke.id.lokalid.value),
    properties: {
      ...fylke.representasjonspunkt.properties,
      name: fylke.administrativenhetnavn[0].navn,
      number: fylke.fylkesnummer.kodeverdi,
    },
  });
};

const useFylkesgrenser = () => {
  const { kretsStatus } = useEditGrenseValue("fylke", "fylker");
  const shouldFetch = kretsStatus.editing || kretsStatus.visible;
  const [isFetching, setIsFetching] = useState(false);
  const { fylker } = useFylkerResponse(shouldFetch);
  const fylkeIds = fylker?.map(getIdFromEntity) ?? [];
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { data: geoJsonFeatures } = useSWRImmutable(
    shouldFetch ? [fylkeIds, tokenHolderFunc()?.token] : null,
    fylkesgrenserFetcher,
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
    if (!geoJsonFeatures || !fylker) {
      return null;
    }

    const representasjonspunktFeatures = fylker?.map((fylke) => getRepresentasjonspunktFeatureForFylke(fylke));

    return geoJsonFeatures.flatMap(getFeaturesFromGeoJson).concat(representasjonspunktFeatures);
  }, [fylker, geoJsonFeatures]);

  useAddInndelingerKontekst(features, "fylke", "fylker");

  return { fylkesgrenser: features, isFetching };
};

export default useFylkesgrenser;
