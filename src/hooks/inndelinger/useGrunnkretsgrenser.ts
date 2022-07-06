import { useEffect, useMemo } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useSWR from "swr";
import useNibasApi from "../useNibasApi";
import { useEditGrenseValue } from "contexts/EditGrenserContext";
import { LayerId } from "hooks/layers/types";
import useAsyncFeatures from "hooks/useAsyncFeatures";
import { GrunnkretsRef } from "types/api";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import { removeFeaturesFromSourceByIds } from "utils/map/source";
import { fetcherWithToken } from "utils/swr";

const mapGrunnkretserToIds = (grunnkretser?: GrunnkretsRef[]) =>
  grunnkretser?.map((grunnkrets) => grunnkrets.id);

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

const useGrunnkretsgrenser = (kommuneId: string) => {
  const { visible } = useEditGrenseValue("grunnkrets", kommuneId);
  const { tokenHolderFunc } = useAuthenticationFlow();

  const { data: grunnkretserByKommune } = useNibasApi(
    visible ? "/v1/kommuner/{id}/grunnkretser" : null,
    {
      id: kommuneId,
    }
  );

  const { data: grunnkretsgrenserGeoJsons } = useSWR(
    [mapGrunnkretserToIds(grunnkretserByKommune), tokenHolderFunc()?.token],
    grunnkretserByKommuneFetcher
  );

  const allFeatures = useMemo(() => {
    if (!grunnkretsgrenserGeoJsons) return null;

    const features: Feature<Geometry>[] = [];

    grunnkretsgrenserGeoJsons?.forEach((geoJson) => {
      getFeaturesFromGeoJson(geoJson).forEach((feature) => {
        features.push(feature);
      });
    });

    return features;
  }, [grunnkretsgrenserGeoJsons]);

  useEffect(() => {
    allFeatures?.forEach((feature) => {
      feature.setProperties({
        ...feature.getProperties(),
        inndelingerKontekst: {
          id: kommuneId,
          type: "grunnkrets",
        },
      });
    });
  }, [allFeatures, kommuneId]);

  const setLayerToAddTo = useAsyncFeatures(allFeatures);

  const addGrunnkretserToLayer = (layerId: LayerId) => {
    setLayerToAddTo(layerId);
  };

  const removeGrunnkretserFromLayer = (layerId: LayerId) => {
    if (!allFeatures) return;

    removeFeaturesFromSourceByIds(layerId, allFeatures);
  };

  return {
    addGrunnkretserToLayer,
    removeGrunnkretserFromLayer,
  };
};

export default useGrunnkretsgrenser;
