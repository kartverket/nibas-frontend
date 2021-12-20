import styled from "styled-components";
import FylkeList from "./FylkeList";
import KommuneList from "./KommuneList";
import { SimpleFylke } from "./types";
import useEditGrenser, { ObjectValue } from "./useEditGrenser";
import Accordion from "components/Accordion";
import { MapInteractable } from "components/Map/MapInteractable";
import { SidebarPanelTitle } from "components/PageLayout/PageLayout";
import useApi from "hooks/useApi";

type Props = {
  visible: boolean;
};

const GrenserDrillDown = ({ visible }: Props) => {
  const { data: fylker, loading } = useApi<SimpleFylke[]>(
    "v1/administrativ-enhet?type=FYLKE",
    []
  );
  const { getCanSelect, setObjectValue, editingObject } = useEditGrenser();

  if (!visible) return null;

  return (
    <Panel>
      <SidebarPanelTitle>Grenser</SidebarPanelTitle>
      <Accordion title="Riksgrenser">
        <p>lol</p>
      </Accordion>
      <Accordion title="Fylkesgrenser">
        <AccordionContent>
          {!loading && fylker ? (
            <FylkeList
              fylker={fylker}
              fylkeValues={editingObject.fylke ?? {}}
              setFylkeValue={(fylkesnavn: string, value: ObjectValue) =>
                setObjectValue("fylke", fylkesnavn, value)
              }
              canSelect={getCanSelect("fylke")}
            />
          ) : (
            <p>Henter fylker...</p>
          )}
        </AccordionContent>
      </Accordion>
      <Accordion title="Kommunegrenser">
        <AccordionContent>
          {!loading && fylker ? (
            fylker.map((fylke) => (
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
            ))
          ) : (
            <p>Henter fylker...</p>
          )}
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
  );
};

const Panel = styled(MapInteractable)`
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
