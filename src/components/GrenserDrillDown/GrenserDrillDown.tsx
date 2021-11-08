import Accordion from "components/Accordion";
import { MapInteractable } from "components/Map/MapInteractable";
import { useEffect, useState } from "react";
import styled from "styled-components";
import KommuneList from "./KommuneList";
import { SimpleFylke } from "./types";
import useKommunegrenser from "./useKommunegrenser";

type Props = {
  visible: boolean;
};

const GrenserDrillDown = ({ visible }: Props) => {
  const [fylker, setFylker] = useState<SimpleFylke[]>([]);

  const { selectedKommuner, toggleKommunegrense } = useKommunegrenser();

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

  if (!visible) return null;

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
                <KommuneList
                  fylke={fylke}
                  selectedKommuner={selectedKommuner}
                  toggleKommunegrense={toggleKommunegrense}
                />
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
