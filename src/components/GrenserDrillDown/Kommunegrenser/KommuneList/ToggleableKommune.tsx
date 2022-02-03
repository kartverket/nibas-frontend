import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { useEditGrenser } from "../../EditGrenserContext";
import ToggleableGrense from "../../ToggleableGrense";
import { fetchKommuneFeaturesById } from "api/kommuner";
import { SimpleKommune } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { geoJsonToSource } from "utils/map/geoJson";

type Props = {
  kommune: SimpleKommune;
};

const ToggleableKommune = ({ kommune }: Props) => {
  const { values: kommuneValues, setObjectValue: setKommuneValue } =
    useEditGrenser("kommune");

  const navn = getNavnInSpraak(kommune.navn, "nor");

  const getFeaturesToAdd = async () => {
    const json = await fetchKommuneFeaturesById(kommune.id);
    return geoJsonToSource(json).getFeatures();
  };

  const getFeaturesToRemove = (layerFeatures: Feature<Geometry>[]) =>
    layerFeatures.filter(
      (feature) => feature.getProperties().kontekstId === kommune.id
    );

  return (
    <ToggleableGrense
      grense={kommune}
      objectValue={kommuneValues[navn]}
      setObjectValue={setKommuneValue}
      title={navn}
      type="kommune"
      getFeaturesToAdd={getFeaturesToAdd}
      getFeaturesToRemove={getFeaturesToRemove}
    />
  );
};

export default ToggleableKommune;
