import { useCallback, useMemo, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useSWR from "swr";
import ToggleableGrense from "../ToggleableGrense";
import { ObjectValue } from "../useEditGrenser";
import { SimpleFylke } from "types/api";
import { geoJsonToSource } from "utils/map/geoJson";
import { fetcher } from "utils/swr";

type Props = {
  fylke: SimpleFylke;
  fylkeValue: ObjectValue;
  setFylkeValue: (kommune: string, value: ObjectValue) => void;
};

const Fylke = ({ fylke, fylkeValue, setFylkeValue }: Props) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const { data: geoJson } = useSWR<Feature<Geometry>>(
    shouldFetch ? `v1/fylker/${fylke.id}/grenser` : null,
    fetcher,
    { refreshWhenHidden: false, revalidateOnFocus: false }
  );

  const features = useMemo(() => {
    if (!geoJson) return [];

    return geoJsonToSource(geoJson).getFeatures();
  }, [geoJson]);

  const navn =
    fylke.navn.find((fylkesNavn) => fylkesNavn.spraak === "nor")?.navn ?? "";

  const fetchFeatures = useCallback(() => {
    setShouldFetch(true);
  }, []);

  return (
    <ToggleableGrense
      key={navn}
      grense={fylke}
      type="fylke"
      title={navn}
      objectValue={fylkeValue}
      setObjectValue={setFylkeValue}
      features={features}
      fetchFeatures={fetchFeatures}
    />
  );
};

export default Fylke;
