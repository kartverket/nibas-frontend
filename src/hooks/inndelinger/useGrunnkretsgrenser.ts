import { useEffect } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import useSWR from "swr";
import useNibasApi from "../useNibasApi";
import { useEditGrenseValue } from "contexts/EditGrenserContext/EditGrenserContext";
import { GrunnkretsRef } from "types/api";
import { sortGrenserAlphabetically } from "utils/language/language";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import {
  addFeaturesToSource,
  removeFeaturesFromSourceByIds,
} from "utils/map/source";
import { fetcherWithToken } from "utils/swr";

const mapGrunnkretserToIds = (grunnkretser?: GrunnkretsRef[]) =>
  grunnkretser?.map((grunnkrets) => grunnkrets.id);

const grunnkretserByKommuneFetcher = async (
  key: string, // må has med for SWR key caching
  grunnkretsIds: string[],
  token: string | undefined
) => {
  const grunnkretsFeaturesPromises = grunnkretsIds.map(async (grunnkretsId) => {
    const grenseUrl = `/v1/grunnkretser/${grunnkretsId}/grenser`;
    const grenser = await fetcherWithToken(grenseUrl, token);

    return grenser;
  });

  return Promise.all(grunnkretsFeaturesPromises);
};

const useGrunnkretsgrenser = (kommuneId: string) => {
  const { visible } = useEditGrenseValue("grunnkrets", kommuneId);
  const { tokenHolderFunc } = useAuthenticationFlow();

  // denne blir unødvendig når vi kan hende grunnkretser med kommuneId i stedet
  const { data: kommune } = useNibasApi(visible ? "/v1/kommuner/{id}" : null, {
    id: kommuneId,
  });

  const { data: grunnkretserByKommune } = useNibasApi(
    kommune ? "/v1/grunnkretser" : null,
    {
      kommunenummer: kommune?.kommunenummer.id,
    }
  );

  const { data: grunnkretsgrenserGeoJsons } = useSWR(
    [
      `grunnkretserByKommune/${kommuneId}`,
      mapGrunnkretserToIds(grunnkretserByKommune),
      tokenHolderFunc()?.token,
    ],
    grunnkretserByKommuneFetcher
  );

  useEffect(() => {
    if (!grunnkretsgrenserGeoJsons) return;

    const featuresFromGeoJson = grunnkretsgrenserGeoJsons.map(
      getFeaturesFromGeoJson
    );
    featuresFromGeoJson.forEach((features) => {
      addFeaturesToSource("grunnkretser", features);
    });

    return () => {
      featuresFromGeoJson.forEach((features) => {
        removeFeaturesFromSourceByIds("grunnkretser", features);
      });
    };
  }, [grunnkretsgrenserGeoJsons]);

  return {
    grunnkretser: sortGrenserAlphabetically(grunnkretserByKommune),
  };
};

export default useGrunnkretsgrenser;
