import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import ToggleableGrense from "../ToggleableGrense";
import { ObjectValue } from "../useEditGrenser";
import { fetchFylkeFeaturesById } from "api/fylker";
import { SimpleFylke } from "types/api";
import { geoJsonToSource } from "utils/map/geoJson";

type Props = {
  fylker: SimpleFylke[];
  fylkeValues: Record<string, ObjectValue>;
  setFylkeValue: (kommune: string, value: ObjectValue) => void;
  canSelect: boolean;
};

const FylkeList = ({
  fylker,
  fylkeValues,
  setFylkeValue,
  canSelect,
}: Props) => {
  const getFeaturesToAdd = async (fylke: SimpleFylke) => {
    const json = await fetchFylkeFeaturesById(fylke.id);
    return geoJsonToSource(json).getFeatures();
  };

  const getFeaturesToRemove = (
    fylke: SimpleFylke,
    layerFeatures: Feature<Geometry>[]
  ) =>
    layerFeatures.filter(
      (feature) => feature.getProperties().kontekstId === fylke.id
    );

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
            canSelect={canSelect}
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
