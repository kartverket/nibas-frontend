import useSWR from "swr";
import KommuneList from "./KommuneList";
import Accordion from "components/Accordion";
import { SimpleFylke } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { fetcher } from "utils/swr";

const Kommunegrenser = () => {
  const { data: fylker } = useSWR<SimpleFylke[]>("/v1/fylker", fetcher);

  return (
    <Accordion title="Kommunegrenser">
      <div>
        {fylker ? (
          fylker.map((fylke) => (
            <Accordion
              key={fylke.id}
              title={getNavnInSpraak(fylke.navn, "nor")}
            >
              <KommuneList fylke={fylke} />
            </Accordion>
          ))
        ) : (
          <p>Henter fylker...</p>
        )}
      </div>
    </Accordion>
  );
};

export default Kommunegrenser;
