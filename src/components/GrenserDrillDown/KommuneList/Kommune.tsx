import { useCallback, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useSWR from "swr";
import ToggleableGrense from "../ToggleableGrense";
import { ObjectValue } from "../useEditGrenser";
import { SimpleKommune } from "types/api";
import { fetcher } from "utils/swr";

type Props = {
  kommune: SimpleKommune;
  kommuneValue: ObjectValue;
  setKommuneValue: (kommune: string, value: ObjectValue) => void;
};

const Kommune = ({ kommune, kommuneValue, setKommuneValue }: Props) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const { data: features } = useSWR<Feature<Geometry>[]>(
    shouldFetch ? `v1/fylker/${kommune.id}/grenser` : null,
    fetcher
  );

  const fetchFeatures = useCallback(() => {
    setShouldFetch(true);
  }, []);

  const navn =
    kommune.navn.find((kommuneNavn) => kommuneNavn.spraak === "nor")?.navn ??
    "";

  return (
    <ToggleableGrense
      key={navn}
      grense={kommune}
      objectValue={kommuneValue}
      setObjectValue={setKommuneValue}
      title={navn}
      type="kommune"
      features={features}
      fetchFeatures={fetchFeatures}
    />
  );
};

export default Kommune;
