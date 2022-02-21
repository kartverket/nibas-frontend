import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import styled from "styled-components";
import useSWR from "swr";
import ToggleableGrense from "../ToggleableGrense";
import { ObjectValue } from "../useEditGrenser";
import { SimpleFylke } from "types/api";
import { geoJsonToSource } from "utils/map/geoJson";
import { fetcher } from "utils/swr";

type Props = {
  fylkeValues: Record<string, ObjectValue>;
  setFylkeValue: (kommune: string, value: ObjectValue) => void;
};

const FylkeList = ({ fylkeValues, setFylkeValue }: Props) => {
  const { data: fylker } = useSWR<SimpleFylke[]>("/v1/fylker", fetcher);

  const getFeaturesToAdd = async (fylke: SimpleFylke) => {
    // const json = await fetchFylkeFeaturesById(fylke.id);
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
