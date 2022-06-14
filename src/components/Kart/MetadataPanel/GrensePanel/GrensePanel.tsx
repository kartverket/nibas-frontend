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
  feature: Feature<Geometry>;
};

const GrensePanel = ({ feature }: Props) => {
  let tabs: string[];

  const showReferanser =
    showReferanserByGrenseType[feature.getProperties().type as string];

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
    <Tabs key={feature.getId()} tabTransKeys={tabs}>
      <div>
        <h3>Linje metadata</h3>
        <GrenseMetadataGenerelt feature={feature} />
      </div>
      <div>
        <h3>Detaljer</h3>
        <GrenseMetadataDetaljer feature={feature} />
      </div>
      {showReferanser && (
        <div>
          <h3>Dokumentasjonsreferanser</h3>
          <GrenseMetadataReferanser feature={feature} />
        </div>
      )}
    </Tabs>
  );
};

export default GrensePanel;
