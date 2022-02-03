import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import { useEditGrenser } from "components/GrenserDrillDown/EditGrenserContext";
import ToggleableGrense from "components/GrenserDrillDown/ToggleableGrense";
import { SimpleFylke } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { geoJsonToSource } from "utils/map/geoJson";
import { fetcher } from "utils/swr";

type Props = {
  fylke: SimpleFylke;
};

const ToggleableFylke = ({ fylke }: Props) => {
  const { values: fylkeValues, setObjectValue: setFylkeValue } =
    useEditGrenser("fylke");

  const navn = getNavnInSpraak(fylke.navn, "nor");

  const getFeaturesToAdd = async () => {
    const json = await fetcher<Feature<LineString>>(
      `v1/fylker/${fylke.id}/grenser`
    );

    return geoJsonToSource(json).getFeatures();
  };

  const getFeaturesToRemove = (layerFeatures: Feature<Geometry>[]) =>
    layerFeatures.filter(
      (feature) => feature.getProperties().kontekstId === fylke.id
    );

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
};

export default ToggleableFylke;
