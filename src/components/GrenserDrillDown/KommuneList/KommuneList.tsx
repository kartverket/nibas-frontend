import { useEffect, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import ToggleableGrense from "../ToggleableGrense";
import { ObjectValue } from "../useEditGrenser";
import { fetchKommuneFeaturesById, fetchKommunerByFylke } from "api/kommuner";
import { SimpleKommune } from "types/api";
import { geoJsonToSource } from "utils/map/geoJson";

type Props = {
  fylke: SimpleKommune;
  kommuneValues: Record<string, ObjectValue>;
  setKommuneValue: (kommune: string, value: ObjectValue) => void;
};

const KommuneList = ({ fylke, kommuneValues, setKommuneValue }: Props) => {
  const [kommuner, setKommuner] = useState<SimpleKommune[]>([]);

  useEffect(() => {
    if (!fylke) return;

    const updateKommuner = async () => {
      const fetchedKommuner = await fetchKommunerByFylke(fylke.id);

      setKommuner(fetchedKommuner);
    };

    updateKommuner();
  }, [fylke]);

  const getFeaturesToAdd = async (kommune: SimpleKommune) => {
    const json = await fetchKommuneFeaturesById(kommune.id);
    return geoJsonToSource(json).getFeatures();
  };

  const getFeaturesToRemove = (
    kommune: SimpleKommune,
    layerFeatures: Feature<Geometry>[]
  ) =>
    layerFeatures.filter(
      (feature) => feature.getProperties().kontekstId === kommune.id
    );

  return (
    <Wrapper>
      {kommuner.map((kommune) => {
        const navn =
          kommune.navn.find((kommuneNavn) => kommuneNavn.spraak === "nor")
            ?.navn ?? "";

        return (
          <ToggleableGrense
            key={navn}
            grense={kommune}
            objectValue={kommuneValues[navn]}
            setObjectValue={setKommuneValue}
            title={navn}
            type="kommune"
            getFeaturesToAdd={getFeaturesToAdd}
            getFeaturesToRemove={getFeaturesToRemove}
          />
        );
      })}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default KommuneList;
