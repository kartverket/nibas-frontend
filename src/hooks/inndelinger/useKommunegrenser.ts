import { getRepresentasjonspunktFeatureForAdministrativEnhet } from "components/GrenserDrillDown/ToggleableAdministrativEnhet/ToggleableAdministrativEnhet";
import useAddInndelingerKontekst from "hooks/useAddInndelingerKontekst";
import { useEffect, useMemo, useState } from "react";
import useSWRImmutable from "swr/immutable";
import { FeatureCollection } from "types/api";
import { fetcherWithToken, getIdFromEntity } from "utils/api";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import useKommuner from "./useKommuner";
import { useAuth } from "react-oidc-context";

const kommunegrenserFetcher = async ([kommuneIds, token]: [string[], string | undefined]) => {
  const promises: Promise<FeatureCollection>[] = kommuneIds.map(async (kommuneId) =>
    fetcherWithToken([`/v1/kommuner/${kommuneId}/grenser`, token]),
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

const useKommunegrenser = (fylkeId: string, shouldFetch: boolean) => {
  const [isFetching, setIsFetching] = useState(false);
  const { kommuner: kommunerResponse } = useKommuner(fylkeId, shouldFetch);
  const auth = useAuth();
  const kommuneIds = kommunerResponse?.map(getIdFromEntity) ?? [];
  const { data: geoJsonFeatures } = useSWRImmutable(
    shouldFetch ? [kommuneIds, auth.user?.access_token] : null,
    kommunegrenserFetcher,
  );
  useEffect(() => {
    if (!shouldFetch) return;

    if (kommunerResponse && geoJsonFeatures) {
      setIsFetching(false);
    } else {
      setIsFetching(true);
    }
  }, [geoJsonFeatures, shouldFetch, kommunerResponse]);

  const features = useMemo(() => {
    if (!geoJsonFeatures || !kommunerResponse) {
      return null;
    }

    const representasjonspunktFeatures = kommunerResponse?.map((kommune) =>
      getRepresentasjonspunktFeatureForAdministrativEnhet(kommune),
    );

    return geoJsonFeatures.flatMap(getFeaturesFromGeoJson).concat(representasjonspunktFeatures);
  }, [geoJsonFeatures, kommunerResponse]);

  useAddInndelingerKontekst(features, "kommune", fylkeId);

  return { kommunegrenser: features, isFetching };
};

export default useKommunegrenser;
