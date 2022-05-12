import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import GrenseMetadataDetaljer from "./GrenseMetadataDetaljer";
import GrenseMetadataGenerelt from "./GrenseMetadataGenerelt";
import Tabs from "components/Tabs";

type Props = {
  data: Feature<Geometry>;
};

const GrenseMetadata = ({ data }: Props) => {
  return (
    <Tabs
      key={data.getId()}
      tabTransKeys={[
        "metadata.Generelt",
        "metadata.Detaljer",
        "metadata.Referanser",
        "metadata.Historikk",
      ]}
    >
      <div>
        <h3>Linje metadata</h3>
        <GrenseMetadataGenerelt feature={data} />
      </div>
      <div>
        <h3>Detaljer</h3>
        <GrenseMetadataDetaljer feature={data} />
      </div>
    </Tabs>
  );
};

export default GrenseMetadata;
