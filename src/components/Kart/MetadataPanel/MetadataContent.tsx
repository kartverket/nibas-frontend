import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useMetadataFromFeature, {
  KontekstType,
  ResponseItem,
} from "./useMetadataFromFeature";
import { Fylke } from "types/api";

type Props = {
  feature: Feature<Geometry>;
};

const isFylke = (
  item: ResponseItem,
  kontekstType: KontekstType
): item is Fylke => {
  return kontekstType === "FYLKE";
};

const MetadataContent = ({ feature }: Props) => {
  const { item, kontekstType } = useMetadataFromFeature(feature);

  // console.log(feature.getProperties());

  if (!item || !kontekstType) return null;

  if (isFylke(item, kontekstType)) {
    return (
      <div>
        {Object.keys(item).map((key) => (
          <p key={key}>
            {key} {JSON.stringify(item[key as keyof Fylke])}
          </p>
        ))}
      </div>
    );
  }

  return <div></div>;
};

export default MetadataContent;
