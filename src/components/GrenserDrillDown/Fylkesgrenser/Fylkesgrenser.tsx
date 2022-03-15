import useSWR from "swr";
import ListItemAccordion from "../ListItemAccordion";
import ToggleableFylke from "./ToggleableFylke";
import { SimpleFylke } from "types/api";
import { fetcher } from "utils/swr";

const Fylkesgrenser = () => {
  const { data: fylker } = useSWR<SimpleFylke[]>("/v1/fylker", fetcher);

  return (
    <ListItemAccordion title="Fylkesgrenser">
      <div>
        {fylker ? (
          fylker.map((fylke) => (
            <ToggleableFylke key={fylke.id} fylke={fylke} />
          ))
        ) : (
          <p>Henter fylker...</p>
        )}
      </div>
    </ListItemAccordion>
  );
};

export default Fylkesgrenser;
