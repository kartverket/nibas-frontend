import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import GrenseMetadataDetaljer from "./GrenseMetadataDetaljer";
import GrenseMetadataGenerelt from "./GrenseMetadataGenerelt";
import GrenseMetadataReferanser from "./GrenseMetadataReferanser";
import Tabs from "components/Tabs";
import Heading from "components/typography/Heading";

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
        <Heading size="xs" tag="h2">
          Linje metadata
        </Heading>
        <GrenseMetadataGenerelt feature={feature} />
      </div>
      <div>
        <Heading size="xs" tag="h2">
          Detaljer
        </Heading>
        <GrenseMetadataDetaljer feature={feature} />
      </div>
      {showReferanser && (
        <div>
          <Heading size="xs" tag="h2">
            Dokumentasjonsreferanser
          </Heading>
          <GrenseMetadataReferanser feature={feature} />
        </div>
      )}
    </Tabs>
  );
};

export default GrensePanel;
