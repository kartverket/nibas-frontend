import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import AdministrativGrenseDetaljer from "./GrenseDetaljer/AdministrativGrenseDetaljer";
import { FeatureProperties } from "types/api";

type Props = {
  feature: Feature<Geometry>;
};

const GrenseMetadataDetaljer = ({ feature }: Props) => {
  const properties = feature.getProperties() as FeatureProperties;
  console.log(properties);

  if (
    properties.type === "Fylkesgrense" ||
    properties.type === "Kommunegrense"
  ) {
    return <AdministrativGrenseDetaljer feature={feature} />;
  }

  return null;
};

export default GrenseMetadataDetaljer;
