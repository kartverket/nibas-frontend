import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { LinkButton } from "components/form/Button";
import Loader from "components/Loader";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import useFylker from "hooks/inndelinger/useFylker";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import useSWRImmutable from "swr/immutable";
import { FeatureCollection } from "types/api";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import { fetcherWithToken } from "utils/swr";
import ListItemAccordion from "../ListItemAccordion";
import FylkeList from "./FylkeList";

const fylkesgrenserFetcher = async (
  fylkeIds: string[],
  token: string | undefined
) => {
  const promises: Promise<FeatureCollection>[] = fylkeIds.map(async (fylkeId) =>
    fetcherWithToken(`/v1/fylker/${fylkeId}/grenser`, token)
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

const useFylkesgrenser = (shouldFetch: boolean) => {
  const [isFetching, setIsFetching] = useState(false);
  const { fylker } = useFylker(shouldFetch);
  const fylkeIds = fylker?.map((fylke) => fylke.id) ?? [];
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { data: geoJsonFeatures } = useSWRImmutable(
    shouldFetch ? [fylkeIds, tokenHolderFunc()?.token] : null,
    fylkesgrenserFetcher
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
    if (!geoJsonFeatures) {
      return null;
    }

    return geoJsonFeatures.flatMap(getFeaturesFromGeoJson);
  }, [geoJsonFeatures]);

  return { fylkesgrenser: features, isFetching };
};

const Fylkesgrenser = () => {
  const { t } = useTranslation();
  const [shouldFetch, setShouldFetch] = useState(false);
  const { fylkesgrenser, isFetching } = useFylkesgrenser(shouldFetch);
  const x = useEditGrense("fylke", "fylke", fylkesgrenser);
  console.log(fylkesgrenser);

  const editFylkesgrenser = () => {
    setShouldFetch(!shouldFetch);
    x.toggleEditing();
  };

  return (
    <ListItemAccordion
      title={
        <TitleWithEditButton>
          {t("inndelinger.Fylkesgrenser")}
          <LinkButton onClick={editFylkesgrenser}>
            Rediger fylkesgrenser
          </LinkButton>
          {isFetching && <Loader />}
        </TitleWithEditButton>
      }
    >
      <FylkeList />
    </ListItemAccordion>
  );
};

const TitleWithEditButton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export default Fylkesgrenser;
