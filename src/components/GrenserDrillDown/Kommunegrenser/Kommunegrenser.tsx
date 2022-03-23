import styled from "styled-components";
import useSWR from "swr";
import ListItemAccordion from "../ListItemAccordion";
import KommuneList from "./KommuneList";
import { UnstyledList } from "components/UnstyledList";
import { SimpleFylke } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { fetcher } from "utils/swr";

const Kommunegrenser = () => {
  const { data: fylker } = useSWR<SimpleFylke[]>("/v1/fylker", fetcher);

  return (
    <ListItemAccordion title="Kommunegrenser">
      <div>
        {fylker ? (
          <List>
            {fylker.map((fylke) => (
              <ListItemAccordion
                key={fylke.id}
                title={getNavnInSpraak(fylke.navn, "nor")}
              >
                <KommuneList fylke={fylke} />
              </ListItemAccordion>
            ))}
          </List>
        ) : (
          <p>Henter fylker...</p>
        )}
      </div>
    </ListItemAccordion>
  );
};

const List = styled(UnstyledList)`
  margin-left: 8px;
`;

export default Kommunegrenser;
