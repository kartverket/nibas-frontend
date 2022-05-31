import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import GrenseMetadataDetaljer from "./GrenseMetadataDetaljer";
import GrenseMetadataGenerelt from "./GrenseMetadataGenerelt";
import GrenseMetadataReferanser from "./GrenseMetadataReferanser";
import Tabs from "components/Tabs";

const showReferanserByGrenseType: Record<string, boolean> = {
  Territorialgrense: true,
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
  console.log(data);
  let tabs: string[];

  const showReferanser =
    showReferanserByGrenseType[data.getProperties().type as string];

  if (showReferanser) {
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
      {showReferanser && (
        <div>
          <h3>Dokumentasjonsreferanser</h3>
          <GrenseMetadataReferanser feature={data} />
        </div>
      )}
    </Tabs>
  );
};

export default GrensePanel;
