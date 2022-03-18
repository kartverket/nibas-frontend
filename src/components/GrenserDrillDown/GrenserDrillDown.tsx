import styled from "styled-components";
import KodelistePreview from "../KodelisteSelect/KodelistePreview";
import FylkeList from "./FylkeList";
import KommuneList from "./KommuneList";
import useEditGrenser, { ObjectValue } from "./useEditGrenser";
import Accordion from "components/Accordion";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import useNibasApi from "hooks/useNibasApi";

const GrenserDrillDown = () => {
  const { isOpen: visible, togglePanel } = useSidebarPanel("nibas");

  const { data: fylker } = useNibasApi("/v1/fylker");

  const { setObjectValue, editingObject } = useEditGrenser();

  if (!visible) return null;

  return (
    <Panel>
      <SidebarPanelTitle closePanel={togglePanel} title="Grenser" />
      <Accordion title="Riksgrenser">
        <p>Kommer senere!</p>
      </Accordion>
      <Accordion title="Fylkesgrenser">
        <AccordionContent>
          <FylkeList
            fylkeValues={editingObject.fylke ?? {}}
            setFylkeValue={(fylkesnavn: string, value: ObjectValue) =>
              setObjectValue("fylke", fylkesnavn, value)
            }
          />
        </AccordionContent>
      </Accordion>
      <Accordion title="Kommunegrenser">
        <AccordionContent>
          {fylker ? (
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
