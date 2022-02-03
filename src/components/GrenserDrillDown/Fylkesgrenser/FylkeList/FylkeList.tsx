import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import styled from "styled-components";
import useSWR from "swr";
import { useEditGrenser } from "components/GrenserDrillDown/EditGrenserContext";
import ToggleableGrense from "components/GrenserDrillDown/ToggleableGrense";
import { SimpleFylke } from "types/api";
import { geoJsonToSource } from "utils/map/geoJson";
import { fetcher } from "utils/swr";

const FylkeList = () => {
  const { values: fylkeValues, setObjectValue: setFylkeValue } =
    useEditGrenser("fylke");
  const { data: fylker } = useSWR<SimpleFylke[]>("/v1/fylker", fetcher);

  const getFeaturesToAdd = async (fylke: SimpleFylke) => {
    const json = await fetcher<Feature<LineString>>(
      `v1/fylker/${fylke.id}/grenser`
    );

    return geoJsonToSource(json).getFeatures();
  };

  const getFeaturesToRemove = (
    fylke: SimpleFylke,
    layerFeatures: Feature<Geometry>[]
  ) =>
    layerFeatures.filter(
      (feature) => feature.getProperties().kontekstId === fylke.id
    );

  if (!fylker) return null;

  return (
    <Wrapper>
      {fylker.map((fylke) => {
        const navn =
          fylke.navn.find((fylkesNavn) => fylkesNavn.spraak === "nor")?.navn ??
          "";

        return (
          <ToggleableGrense
            key={navn}
            grense={fylke}
            type="fylke"
            title={navn}
            objectValue={fylkeValues[navn]}
            getFeaturesToAdd={getFeaturesToAdd}
            getFeaturesToRemove={getFeaturesToRemove}
            setObjectValue={setFylkeValue}
          />
        );
      })}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default FylkeList;
