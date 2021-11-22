import { useEffect, useState } from "react";
import styled from "styled-components";
import KommuneList from "./KommuneList";
import { SimpleFylke } from "./types";
import useEditGrenser, { ObjectValue } from "./useEditGrenser";
import Accordion from "components/Accordion";
import { MapInteractable } from "components/Map/MapInteractable";

type Props = {
  visible: boolean;
};

const GrenserDrillDown = ({ visible }: Props) => {
  const [fylker, setFylker] = useState<SimpleFylke[]>([]);

  const { setObjectValue, editingObject } = useEditGrenser();

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
          <AccordionContent>
            {fylker.map((fylke) => (
              <div key={fylke.fylkesnummer}>
                <span>{fylke.fylkesnavn}</span>
              </div>
            ))}
          </AccordionContent>
        </Accordion>
        <Accordion title="Kommunegrenser">
          <AccordionContent>
            {fylker.map((fylke) => (
              <Accordion key={fylke.fylkesnummer} title={fylke.fylkesnavn}>
                <KommuneList
                  fylke={fylke}
                  kommuneValues={editingObject.kommune ?? {}}
                  setObjectValue={(kommunenavn: string, value: ObjectValue) =>
                    setObjectValue("kommune", kommunenavn, value)
                  }
                />
              </Accordion>
            ))}
          </AccordionContent>
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
  width: 300px;
  padding: 30px 15px;
  overflow: auto;
  max-height: 80%;
`;

const AccordionContent = styled.div`
  margin-left: 8px;
`;

export default GrenserDrillDown;
