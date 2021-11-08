import { useEffect, useState } from "react";
import { GeometryVectorSource } from "hooks/sources/types";
import VectorLayer from "ol/layer/Vector";
import { geoJsonToSource } from "utils/map/geoJson";
import { getLayerById } from "utils/map/layers";
import { Fylke, SimpleFylke, SimpleKommune } from "./types";

type Props = {
  fylke: SimpleFylke;
  selectedKommuner: Record<string, boolean>;
  toggleKommunegrense: (kommunenavn: string) => void;
};

const KommuneList = ({
  fylke,
  selectedKommuner,
  toggleKommunegrense,
}: Props) => {
  const [kommuner, setKommuner] = useState<SimpleKommune[]>([]);

  useEffect(() => {
    if (!fylke) return;

    const fetchKommuner = async () => {
      const response = await fetch(
        `https://ws.geonorge.no/kommuneinfo/v1/fylker/${fylke.fylkesnummer}`
      );
      const json = (await response.json()) as Fylke;

      setKommuner(json.kommuner);
    };

    fetchKommuner();
  }, [fylke]);

  const onChange = async (kommune: SimpleKommune) => {
    const { kommunenavn } = kommune;

    if (selectedKommuner[kommunenavn]) {
      // fjern features med property med riktig kommunenavn
    } else {
      const geojsonRequest = await fetch(
        "/v1/feature/administrativeEnheter?type=Kommune&administrativeEnheterNummer=1,2"
      );
      const json = await geojsonRequest.json();
      const kommuneLayer = getLayerById(
        "kommuner"
      ) as VectorLayer<GeometryVectorSource>;
      kommuneLayer.setSource(geoJsonToSource(json));
    }

    toggleKommunegrense(kommune.kommunenavn);
  };

  return (
    <div style={{ marginLeft: 8 }}>
      {kommuner.map((kommune) => (
        <div key={kommune.kommunenummer}>
          <input
            type="checkbox"
            checked={selectedKommuner[kommune.kommunenavn] ?? false}
            onChange={() => onChange(kommune)}
          />
          <span>{kommune.kommunenavn}</span>
        </div>
      ))}
    </div>
  );
};

export default KommuneList;
