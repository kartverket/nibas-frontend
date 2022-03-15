import useSWR from "swr";
import ListItemAccordion from "../ListItemAccordion";
import KommuneList from "./KommuneList";
import { SimpleFylke } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { fetcher } from "utils/swr";

const Kommunegrenser = () => {
  const { data: fylker } = useSWR<SimpleFylke[]>("/v1/fylker", fetcher);

  return (
    <ListItemAccordion title="Kommunegrenser">
      <div>
        {fylker ? (
          fylker.map((fylke) => (
            <ListItemAccordion
              key={fylke.id}
              title={getNavnInSpraak(fylke.navn, "nor")}
            >
              <KommuneList fylke={fylke} />
            </ListItemAccordion>
          ))
        ) : (
          <p>Henter fylker...</p>
        )}
      </div>
    </ListItemAccordion>
  );
};

export default Kommunegrenser;
