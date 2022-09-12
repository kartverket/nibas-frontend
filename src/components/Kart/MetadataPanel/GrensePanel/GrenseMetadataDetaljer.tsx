import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import AdministrativGrenseDetaljer from "./GrenseDetaljer/AdministrativGrenseDetaljer";
import StemmekretsgrenseDetaljer from "./GrenseDetaljer/StemmekretsgrenseDetaljer";
import { FeatureProperties } from "types/api";

type Props = {
  feature: Feature<Geometry>;
};

const GrenseMetadataDetaljer = ({ feature }: Props) => {
  const properties = feature.getProperties() as FeatureProperties;

  if (
    properties.type === "Fylkesgrense" ||
    properties.type === "Kommunegrense"
  ) {
    return <AdministrativGrenseDetaljer feature={feature} />;
  }

  if (properties.type === "Stemmekretsgrense") {
    return <StemmekretsgrenseDetaljer feature={feature} />;
  }

  return null;
};

export default GrenseMetadataDetaljer;
