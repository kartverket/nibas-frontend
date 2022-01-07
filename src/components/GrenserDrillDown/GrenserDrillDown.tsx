import styled from "styled-components";
import KodelistePreview from "../KodelisteSelect/KodelistePreview";
import FylkeList from "./FylkeList";
import KommuneList from "./KommuneList";
import useEditGrenser, { ObjectValue } from "./useEditGrenser";
import Accordion from "components/Accordion";
import {
  SidebarPanel,
  SidebarPanelTitle,
} from "components/Sidebar/SidebarPanel";
import useApi from "hooks/useApi";
import { SimpleFylke } from "types/api";

type Props = {
  visible: boolean;
};

const GrenserDrillDown = ({ visible }: Props) => {
  const { data: fylker, loading } = useApi<SimpleFylke[]>("v1/fylker", []);
  const { setObjectValue, editingObject } = useEditGrenser();

  if (!visible) return null;

  return (
    <Panel>
      <SidebarPanelTitle>Grenser</SidebarPanelTitle>
      <Accordion title="Riksgrenser">
        <p>Kommer senere!</p>
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
              <Accordion
                key={fylke.id}
                title={
                  fylke.navn.find((fylkesNavn) => fylkesNavn.spraak === "nor")
                    ?.navn ?? ""
                }
              >
                <KommuneList
                  fylke={fylke}
                  kommuneValues={editingObject.kommune ?? {}}
                  setKommuneValue={(kommunenavn: string, value: ObjectValue) =>
                    setObjectValue("kommune", kommunenavn, value)
                  }
                />
              </Accordion>
            ))
          ) : (
            <p>Henter fylker...</p>
          )}
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
        {/* Kun for test/displayformål. */}
        <KodelistePreview />
      </Accordion>
      <Accordion title="Maritime grenser">
        <p>Kommer senere!</p>
      </Accordion>
    </Panel>
  );
};

const Panel = styled(SidebarPanel)`
  margin-top: 30px;
`;

const AccordionContent = styled.div`
  margin-left: 16px;
`;

export default GrenserDrillDown;
