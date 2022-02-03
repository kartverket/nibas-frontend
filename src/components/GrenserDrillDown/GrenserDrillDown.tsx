import styled from "styled-components";
import useSWR from "swr";
import KodelistePreview from "../KodelisteSelect/KodelistePreview";
import { EditGrenserProvider } from "./EditGrenserContext";
import FylkeList from "./FylkeList";
import KommuneList from "./KommuneList";
import Accordion from "components/Accordion";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { SimpleFylke } from "types/api";
import { fetcher } from "utils/swr";

const GrenserDrillDown = () => {
  const { isOpen, togglePanel } = useSidebarPanel("nibas");
  const { data: fylker } = useSWR<SimpleFylke[]>("/v1/fylker", fetcher);

  return (
    <EditGrenserProvider isOpen={isOpen}>
      <Panel>
        <SidebarPanelTitle closePanel={togglePanel} title="Grenser" />
        <Accordion title="Riksgrenser">
          <p>Kommer senere!</p>
        </Accordion>
        <Accordion title="Fylkesgrenser">
          <AccordionContent>
            <FylkeList />
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
                  <KommuneList fylke={fylke} />
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
    </EditGrenserProvider>
  );
};

const Panel = styled(SidebarPanel)`
  margin-top: 30px;
`;

const AccordionContent = styled.div`
  margin-left: 16px;
`;

export default GrenserDrillDown;
