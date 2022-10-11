import { useEffect, useMemo } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import Geometry from "ol/geom/Geometry";
import useSWR from "swr";
import useNibasApi from "../useNibasApi";
import { useEditGrenseValue } from "contexts/EditGrenserContext";
import { Kretstype } from "contexts/InndelingerKretsContext";
import { useUtkastFeature } from "contexts/UtkastContext";
import { LayerId } from "hooks/layers/types";
import useAsyncFeatures from "hooks/useAsyncFeatures";
import { KretsRef } from "types/api";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import { removeFeaturesFromSourceByIds } from "utils/map/source";
import { fetcherWithToken } from "utils/swr";

const mapGrunnkretserToIds = (kretser?: KretsRef[]) =>
  kretser?.map((krets) => krets.id);

// fetch alle kretsgrenser i en kommune
const kretserByKommuneFetcher = async (
  kretsIds: string[],
  token: string | undefined,
  type: Kretstype
) => {
  const typeUrl = type === "grunnkrets" ? "grunnkretser" : "stemmekretser";

  const kretsFeaturesPromises: Promise<string>[] = kretsIds.map(
    async (kretsId) =>
      fetcherWithToken(`/v1/${typeUrl}/${kretsId}/grenser`, token)
  );

  return Promise.all(kretsFeaturesPromises);
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
    [mapGrunnkretserToIds(kretserByKommune), tokenHolderFunc()?.token, type],
    kretserByKommuneFetcher
  );

  const utkastGeoJsons = useUtkastFeature(grenserGeoJsons);

  const allFeatures = useMemo(() => {
    if (!utkastGeoJsons) return null;

    const features: Feature<Geometry>[] =
      utkastGeoJsons?.flatMap((geoJson: GeoJSONFeature) =>
        getFeaturesFromGeoJson(geoJson)
      ) ?? [];

    return features;
  }, [utkastGeoJsons]);

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

    removeFeaturesFromSourceByIds(
      layerId,
      allFeatures.map((feature) => feature.getId()?.toString() ?? "")
    );
  };

  return {
    addKretserToLayer,
    removeKretserFromLayer,
  };
};

export default useKretsgrenser;
