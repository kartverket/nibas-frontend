import { useEffect, useMemo } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useSWR from "swr";
import useNibasApi from "../useNibasApi";
import { useEditGrenseValue } from "contexts/EditGrenserContext";
import { LayerId } from "hooks/layers/types";
import useAsyncFeatures from "hooks/useAsyncFeatures";
import { GrunnkretsRef, KretsRef } from "types/api";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import { removeFeaturesFromSourceByIds } from "utils/map/source";
import { fetcherWithToken } from "utils/swr";
import { Kretstype } from "contexts/InndelingerKretsContext";

const mapGrunnkretserToIds = (kretser?: KretsRef[]) =>
  kretser?.map((krets) => krets.id);

// fetch alle grunnkretsgrenser i en kommune
const grunnkretserByKommuneFetcher = async (
  grunnkretsIds: string[],
  token: string | undefined
) => {
  const grunnkretsFeaturesPromises: Promise<string>[] = grunnkretsIds.map(
    async (grunnkretsId) =>
      fetcherWithToken(`/v1/grunnkretser/${grunnkretsId}/grenser`, token)
  );

  return Promise.all(grunnkretsFeaturesPromises);
};

const getKretserByKommuneUrl = (type: Kretstype) => {
  if (type === "grunnkrets") {
    return "/v1/kommuner/{id}/grunnkretser";
  }

  // her må det være stemmekrets
  return "/v1/kommuner/{id}/stemmekretser";
};

const useKretsgrenser = (kommuneId: string, type: Kretstype) => {
  const { visible } = useEditGrenseValue(type, kommuneId);
  const { tokenHolderFunc } = useAuthenticationFlow();

  const { data: kretserByKommune } = useNibasApi(
    visible ? getKretserByKommuneUrl(type) : null,
    {
      id: kommuneId,
    }
  );

  const { data: grenserGeoJsons } = useSWR(
    [mapGrunnkretserToIds(kretserByKommune), tokenHolderFunc()?.token],
    grunnkretserByKommuneFetcher
  );

  const allFeatures = useMemo(() => {
    if (!grenserGeoJsons) return null;

    const features: Feature<Geometry>[] = [];

    grenserGeoJsons?.forEach((geoJson) => {
      getFeaturesFromGeoJson(geoJson).forEach((feature) => {
        features.push(feature);
      });
    });

    return features;
  }, [grenserGeoJsons]);

  useEffect(() => {
    allFeatures?.forEach((feature) => {
      feature.setProperties({
        ...feature.getProperties(),
        inndelingerKontekst: {
          id: kommuneId,
          type,
        },
      });
    });
  }, [allFeatures, kommuneId, type]);

  const setLayerToAddTo = useAsyncFeatures(allFeatures);

  const addKretserToLayer = (layerId: LayerId) => {
    setLayerToAddTo(layerId);
  };

  const removeKretserFromLayer = (layerId: LayerId) => {
    if (!allFeatures) return;

    removeFeaturesFromSourceByIds(layerId, allFeatures);
  };

  return {
    addKretserToLayer,
    removeKretserFromLayer,
  };
};

export default useKretsgrenser;
