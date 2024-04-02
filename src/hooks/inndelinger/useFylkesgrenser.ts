import { getRepresentasjonspunktFeatureForAdministrativEnhet } from "components/GrenserDrillDown/ToggleableAdministrativEnhet/ToggleableAdministrativEnhet";
import { useEditGrenseValue } from "contexts/EditGrenserContext/useEditGrense";
import useFylker from "hooks/inndelinger/useFylker";
import useAddInndelingerKontekst from "hooks/useAddInndelingerKontekst";
import { useEffect, useMemo, useState } from "react";
import useSWRImmutable from "swr/immutable";
import { FeatureCollection } from "types/api";
import { fetcherWithToken, getIdFromEntity } from "utils/api";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import { useAuthentication } from "components/Authentication/AuthenticationHook";

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

const useFylkesgrenser = () => {
  const { kretsStatus } = useEditGrenseValue("fylke", "fylker");
  const shouldFetch = kretsStatus.isVisible || kretsStatus.isEditing;
  const [isFetching, setIsFetching] = useState(false);
  const { fylker } = useFylker(shouldFetch);
  const fylkeIds = fylker?.map(getIdFromEntity) ?? [];
  const { token } = useAuthentication();
  const { data: geoJsonFeatures } = useSWRImmutable(shouldFetch ? [fylkeIds, token] : null, fylkesgrenserFetcher);

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

    const representasjonspunktFeatures = fylker?.map((fylke) =>
      getRepresentasjonspunktFeatureForAdministrativEnhet(fylke),
    );

    return geoJsonFeatures.flatMap(getFeaturesFromGeoJson).concat(representasjonspunktFeatures);
  }, [fylker, geoJsonFeatures]);

  useAddInndelingerKontekst(features, "fylke", "fylker");

  return { fylkesgrenser: features, isFetching };
};

export default useFylkesgrenser;
