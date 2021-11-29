import { useEffect, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import ToggleableGrense from "../ToggleableGrense";
import { SimpleFylke, SimpleKommune } from "../types";
import { ObjectValue } from "../useEditGrenser";
import { fetchKommuneFeaturesById, fetchKommunerByFylke } from "api/kommuner";
import { geoJsonToSource } from "utils/map/geoJson";

type Props = {
  fylke: SimpleFylke;
  kommuneValues: Record<string, ObjectValue>;
  setKommuneValue: (kommune: string, value: ObjectValue) => void;
  canSelect: boolean;
};

const KommuneList = ({
  fylke,
  kommuneValues,
  setKommuneValue,
  canSelect,
}: Props) => {
  const [kommuner, setKommuner] = useState<SimpleKommune[]>([]);

  useEffect(() => {
    if (!fylke) return;

    const updateKommuner = async () => {
      const fetchedKommuner = await fetchKommunerByFylke(fylke.nummer);

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
      (feature) =>
        feature.getProperties().administrativEnhet.nummer === kommune.nummer
    );

  return (
    <Wrapper>
      {kommuner.map((kommune) => (
        <ToggleableGrense
          key={kommune.nummer}
          grense={kommune}
          objectValue={kommuneValues[kommune.navn]}
          setObjectValue={setKommuneValue}
          title={kommune.navn}
          type="kommune"
          canSelect={canSelect}
          getFeaturesToAdd={getFeaturesToAdd}
          getFeaturesToRemove={getFeaturesToRemove}
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default KommuneList;
