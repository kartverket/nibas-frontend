import { useState } from "react";
import { geoJsonToSource } from "utils/map/geoJson";
import { getLayerById } from "utils/map/layers";
import { SimpleFylke, SimpleKommune } from "./types";
import styled from "styled-components";
import { fetchKommuneById } from "api/kommuner";
import {
  addFeaturesToSource,
  removeFeaturesFromSource,
} from "utils/map/source";

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
  const [kommuner, setKommuner] = useState<SimpleKommune[]>([
    {
      kommunenavn: "Ringerike",
      kommunenummer: "3007",
      id: 1,
    },
    {
      kommunenavn: "Hole",
      kommunenummer: "3038",
      id: 2,
    },
  ]);

  // hent liste over kommuner i fylke
  // per nå har vi to hardkodede fylker, så denne er kommentert ut
  // useEffect(() => {
  //   if (!fylke) return;

  //   const fetchKommuner = async () => {
  //     const response = await fetch(
  //       `https://ws.geonorge.no/kommuneinfo/v1/fylker/${fylke.fylkesnummer}`
  //     );
  //     const json = (await response.json()) as Fylke;

  //     setKommuner(json.kommuner);
  //   };

  //   fetchKommuner();
  // }, [fylke]);

  const onChange = async (kommune: SimpleKommune) => {
    if (kommuneVisible(kommune)) {
      const kommuneLayer = getLayerById("kommuner");
      const featuresInLayer = kommuneLayer.getSource().getFeatures();
      const kommuneFeatures = featuresInLayer.filter(
        (feature) =>
          feature.getProperties().administrativEnhet.nummer ===
          kommune.kommunenummer
      );

      removeFeaturesFromSource("kommuner", kommuneFeatures);
    } else {
      const json = await fetchKommuneById(kommune.id);
      const features = geoJsonToSource(json).getFeatures();

      addFeaturesToSource("kommuner", features);
    }

    toggleKommunegrense(kommune.kommunenavn);
  };

  // edit kan se om kommunen er hentet allerede
  // om finnes, hent features og legg til i laget
  // ellers, hent dem og legg til
  // kan ikke være i både kommuner og edit lag på samme tid, må flyttes
  const editKommune = async (kommune: SimpleKommune) => {
    const json = await fetchKommuneById(kommune.id);
    const features = geoJsonToSource(json).getFeatures();

    addFeaturesToSource("edit", features);
    toggleKommunegrense(kommune.kommunenavn);
  };

  const openInfo = (kommune: SimpleKommune) => {
    // b
  };

  const kommuneVisible = (kommune: SimpleKommune) =>
    selectedKommuner[kommune.kommunenavn] ?? false;

  return (
    <Wrapper>
      {kommuner.map((kommune) => (
        <KommuneWrapper key={kommune.kommunenummer}>
          <button onClick={() => onChange(kommune)}>
            {kommuneVisible(kommune) ? "Skjul" : "Vis"}
          </button>
          <input
            type="checkbox"
            checked={kommuneVisible(kommune)}
            onChange={() => editKommune(kommune)}
          />
          <span>{kommune.kommunenavn}</span>
          <button onClick={() => openInfo(kommune)}>Metadata</button>
        </KommuneWrapper>
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

const KommuneWrapper = styled.div`
  display: flex;

  > span {
    flex: 1;
  }
`;

export default KommuneList;
