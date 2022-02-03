import useSWR from "swr";
import ToggleableFylke from "./ToggleableFylke";
import Accordion from "components/Accordion";
import { SimpleFylke } from "types/api";
import { fetcher } from "utils/swr";

const Fylkesgrenser = () => {
  const { data: fylker } = useSWR<SimpleFylke[]>("/v1/fylker", fetcher);

  return (
    <Accordion title="Fylkesgrenser">
      <div>
        {fylker ? (
          fylker.map((fylke) => (
            <ToggleableFylke key={fylke.id} fylke={fylke} />
          ))
        ) : (
          <p>Henter fylker...</p>
        )}
      </div>
    </Accordion>
  );
};

export default Fylkesgrenser;
