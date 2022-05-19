import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import GrenseMetadataDetaljer from "./GrenseMetadataDetaljer";
import GrenseMetadataGenerelt from "./GrenseMetadataGenerelt";
import Tabs from "components/Tabs";

const showReferanserByGrenseType: Record<string, boolean> = {
  TerritorialGrense: true,
  Fylkesgrense: true,
  Kommunegrense: true,
  AvtaltAvgrensningslinje: true,
  Riksgrense: true,
  Grunnlinje: true,
};

type Props = {
  data: Feature<Geometry>;
};

const GrensePanel = ({ data }: Props) => {
  let tabs: string[];

  if (showReferanserByGrenseType[data.getProperties().type as string]) {
    tabs = [
      "metadata.Generelt",
      "metadata.Detaljer",
      "metadata.Referanser",
      "metadata.Historikk",
    ];
  } else {
    tabs = ["metadata.Generelt", "metadata.Detaljer", "metadata.Historikk"];
  }

  return (
    <Tabs key={data.getId()} tabTransKeys={tabs}>
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

export default GrensePanel;
