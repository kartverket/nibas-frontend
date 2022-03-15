import { useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import styled from "styled-components";
import useSWR from "swr";
import KodelistePreview from "../KodelisteSelect/KodelistePreview";
import FylkeList from "./FylkeList";
import KommuneList from "./KommuneList";
import useEditGrenser, { ObjectValue } from "./useEditGrenser";
import Accordion from "components/Accordion";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { SimpleFylke } from "types/api";
import { fetcherWithTokenAndErrorHandling } from "utils/swr";

const GrenserDrillDown = () => {
  function getError() {
    if (errorMessage !== "") {
      return <div>Feil inntraff: {errorMessage}</div>;
    }
  }

  const { tokenHolderFunc } = useAuthenticationFlow();

  const { isOpen: visible, togglePanel } = useSidebarPanel("nibas");

  const [errorMessage, setErrorMessage] = useState<string>("");

  const { data: fylker } = useSWR<SimpleFylke[]>(
    ["/v1/fylker", tokenHolderFunc()?.token, setErrorMessage],
    fetcherWithTokenAndErrorHandling
  );

  const { setObjectValue, editingObject } = useEditGrenser();

  if (!visible) return null;

  return (
    <Panel>
      {getError()}
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
