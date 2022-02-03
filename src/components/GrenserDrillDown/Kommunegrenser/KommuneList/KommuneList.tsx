import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import useSWR from "swr";
import { useEditGrenser } from "../../EditGrenserContext";
import ToggleableGrense from "../../ToggleableGrense";
import { fetchKommuneFeaturesById, fetchKommunerByFylke } from "api/kommuner";
import { SimpleKommune } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { geoJsonToSource } from "utils/map/geoJson";

type Props = {
  fylke: SimpleKommune;
};

const KommuneList = ({ fylke }: Props) => {
  const { values: kommuneValues, setObjectValue: setKommuneValue } =
    useEditGrenser("kommune");
  const { data: kommuner } = useSWR(`/v1/kommuner?fylkeid=${fylke.id}`, () =>
    fetchKommunerByFylke(fylke.id)
  );

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

  if (!kommuner) return null;

  return (
    <Wrapper>
      {kommuner.map((kommune) => (
        <ToggleableGrense
          key={getNavnInSpraak(fylke.navn, "nor")}
          grense={kommune}
          objectValue={kommuneValues[getNavnInSpraak(fylke.navn, "nor")]}
          setObjectValue={setKommuneValue}
          title={getNavnInSpraak(fylke.navn, "nor")}
          type="kommune"
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
