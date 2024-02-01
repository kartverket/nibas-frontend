import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import useAddInndelingerKontekst from "hooks/useAddInndelingerKontekst";
import { useEffect, useMemo, useState } from "react";
import useSWRImmutable from "swr/immutable";
import { FeatureCollection } from "types/api";
import { getIdFromEntity, fetcherWithToken } from "utils/api";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import useKommuner from "./useKommuner";

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
    const { kommuner } = useKommuner(fylkeId, shouldFetch);
    const kommuneIds = kommuner?.map(getIdFromEntity) ?? [];
    const { tokenHolderFunc } = useAuthenticationFlow();
    const { data: geoJsonFeatures } = useSWRImmutable(
        shouldFetch ? [kommuneIds, tokenHolderFunc()?.token] : null,
        kommunegrenserFetcher,
    );

    useEffect(() => {
        if (!shouldFetch) return;

        if (kommuner && geoJsonFeatures) {
            setIsFetching(false);
        } else {
            setIsFetching(true);
        }
    }, [kommuner, geoJsonFeatures, shouldFetch]);

    const features = useMemo(() => {
        if (!geoJsonFeatures) {
            return null;
        }

        return geoJsonFeatures.flatMap(getFeaturesFromGeoJson);
    }, [geoJsonFeatures]);

    useAddInndelingerKontekst(features, "kommune", fylkeId);

    return { kommunegrenser: features, isFetching };
};

export default useKommunegrenser;
