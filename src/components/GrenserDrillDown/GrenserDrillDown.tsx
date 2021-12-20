import { useEffect, useState } from "react";
import styled from "styled-components";
import FylkeList from "./FylkeList";
import KommuneList from "./KommuneList";
import { SimpleFylke } from "./types";
import useEditGrenser, { ObjectValue } from "./useEditGrenser";
import { fetchFylker } from "api/fylker";
import Accordion from "components/Accordion";
import { KartInteractable } from "components/Kart/KartInteractable";

type Props = {
  visible: boolean;
};

const GrenserDrillDown = ({ visible }: Props) => {
  const [fylker, setFylker] = useState<SimpleFylke[]>([]);

  const { getCanSelect, setObjectValue, editingObject } = useEditGrenser();

  useEffect(() => {
    const updateFylker = async () => {
      const fetchedFylker = await fetchFylker();

      setFylker(fetchedFylker);
    };

    updateFylker();
  }, []);

  if (!visible) return null;

  return (
    <Panel>
      <Accordion title="Riksgrenser">
        <p>Kommer senere!</p>
      </Accordion>
      <Accordion title="Fylkesgrenser">
        <AccordionContent>
          <FylkeList
            fylker={fylker}
            fylkeValues={editingObject.fylke ?? {}}
            setFylkeValue={(fylkesnavn: string, value: ObjectValue) =>
              setObjectValue("fylke", fylkesnavn, value)
            }
            canSelect={getCanSelect("fylke")}
          />
        </AccordionContent>
      </Accordion>
      <Accordion title="Kommunegrenser">
        <AccordionContent>
          {fylker.map((fylke) => (
            <Accordion key={fylke.nummer} title={fylke.navn}>
              <KommuneList
                fylke={fylke}
                kommuneValues={editingObject.kommune ?? {}}
                setKommuneValue={(kommunenavn: string, value: ObjectValue) =>
                  setObjectValue("kommune", kommunenavn, value)
                }
                canSelect={getCanSelect("kommune")}
              />
            </Accordion>
          ))}
        </AccordionContent>
      </Accordion>
      <Accordion title="Kretser">
        <p>Kommer senere!</p>
      </Accordion>
      <Accordion title="Etat og sektorinndeling">
        <p>Kommer senere!</p>
      </Accordion>
      <Accordion title="Lovers virke">
        <p>Kommer senere!</p>
      </Accordion>
      <Accordion title="Svalbardområdet">
        <p>Kommer senere!</p>
      </Accordion>
      <Accordion title="Maritime grenser">
        <p>Kommer senere!</p>
      </Accordion>
    </Panel>
  );
};

const Panel = styled(KartInteractable)`
  margin-top: 30px;
  width: 400px;
  padding: 8px 16px;
  overflow: auto;
  max-height: 80%;
  border: 2px solid ${({ theme }) => theme.colors.blue};
`;

const AccordionContent = styled.div`
  margin-left: 16px;
`;

export default GrenserDrillDown;
