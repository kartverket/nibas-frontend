import Accordion from "components/Accordion";
import { MapInteractable } from "components/Map/MapInteractable";
import { GeometryVectorSource } from "hooks/sources/types";
import VectorLayer from "ol/layer/Vector";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { geoJsonToSource } from "utils/map/geoJson";
import { getLayerById } from "utils/map/layers";

type SimpleFylke = {
  fylkesnavn: string;
  fylkesnummer: string;
};

type SimpleKommune = {
  kommunenavn: string;
  kommunenummer: string;
};

type Fylke = {
  avgrensningsboks: unknown;
  crs: unknown;
  fylkesnavn: string;
  fylkesnummer: string;
  kommuner: SimpleKommune[];
};

const Kommuneliste = ({ fylke }: { fylke: SimpleFylke }) => {
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

  const onChange = async () => {
    // hent geojson fra db basert på kommune
  };

  return (
    <div style={{ marginLeft: 8 }}>
      {kommuner.map((kommune) => (
        <div key={kommune.kommunenummer}>
          <input
            type="checkbox"
            defaultChecked={false}
            onChange={() => onChange()}
          />
          <span>{kommune.kommunenavn}</span>
        </div>
      ))}
    </div>
  );
};

const GrenserDrillDown = () => {
  const [fylker, setFylker] = useState<SimpleFylke[]>([]);

  useEffect(() => {
    const fetchFylker = async () => {
      const response = await fetch(
        "https://ws.geonorge.no/kommuneinfo/v1/fylker"
      );
      const json = await response.json();

      setFylker(json);
    };

    fetchFylker();
  }, []);

  return (
    <Wrapper>
      <Panel>
        <Accordion title="Riksgrenser">
          <p>lol</p>
        </Accordion>
        <Accordion title="Fylkesgrenser">
          <div style={{ marginLeft: 8 }}>
            {fylker.map((fylke) => (
              <div key={fylke.fylkesnummer}>
                <span>{fylke.fylkesnavn}</span>
              </div>
            ))}
          </div>
        </Accordion>
        <Accordion title="Kommunegrenser">
          <div style={{ marginLeft: 8 }}>
            {fylker.map((fylke) => (
              <Accordion key={fylke.fylkesnummer} title={fylke.fylkesnavn}>
                <Kommuneliste fylke={fylke} />
              </Accordion>
            ))}
          </div>
        </Accordion>
        <Accordion title="Kretser">
          <p>lol</p>
        </Accordion>
        <Accordion title="Etat og sektorinndeling">
          <p>lol</p>
        </Accordion>
        <Accordion title="Lovers virke">
          <p>lol</p>
        </Accordion>
        <Accordion title="Svalbardområdet">
          <p>lol</p>
        </Accordion>
        <Accordion title="Maritime grenser">
          <p>lol</p>
        </Accordion>
      </Panel>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 100%;
`;

const Panel = styled(MapInteractable)`
  margin-top: 30px;
  margin-left: 8px;
  /* height: 80%; */
  width: 300px;
  padding: 30px 15px;
  overflow: auto;
  max-height: 80%;
`;

export default GrenserDrillDown;
