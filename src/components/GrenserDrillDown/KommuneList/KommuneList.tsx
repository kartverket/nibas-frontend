import { useState } from "react";
import styled from "styled-components";
import { SimpleFylke, SimpleKommune } from "../types";
import { ObjectValue } from "../useEditGrenser";
import Kommune from "./Kommune";
// import { fetchKommuneById } from "api/kommuner";
// import { geoJsonToSource } from "utils/map/geoJson";
// import { getLayerById } from "utils/map/layers";
// import {
//   addFeaturesToSource,
//   removeFeaturesFromSource,
// } from "utils/map/source";

type Props = {
  fylke: SimpleFylke;
  kommuneValues: Record<string, ObjectValue>;
  setObjectValue: (kommune: string, value: ObjectValue) => void;
};

const KommuneList = ({ /*fylke, */ kommuneValues, setObjectValue }: Props) => {
  const [kommuner /*, setKommuner*/] = useState<SimpleKommune[]>([
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

  return (
    <Wrapper>
      {kommuner.map((kommune) => (
        <Kommune
          key={kommune.id}
          kommune={kommune}
          setObjectValue={setObjectValue}
          objectValue={kommuneValues[kommune.kommunenavn]}
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default KommuneList;
