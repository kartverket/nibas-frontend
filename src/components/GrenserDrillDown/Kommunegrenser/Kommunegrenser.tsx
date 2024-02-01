import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { styled } from "styled-components";
import ListItemAccordion from "../ListItemAccordion";
import KommuneList from "./KommuneList";
import { UnstyledList } from "components/UnstyledList";
import useFylker from "hooks/inndelinger/useFylker";
import { getIdFromEntity } from "utils/api";

const Kommunegrenser = () => {
  const { fylker } = useFylker();
  const { isAuthenticatedFunc } = useAuthenticationFlow();

  return (
    <ListItemAccordion title="Kommuner">
      <div>
        {fylker ? (
          <List>
            {fylker.map((fylke) => (
              <KommuneList key={getIdFromEntity(fylke)} fylke={fylke} />
            ))}
          </List>
        ) : (
          <p>{isAuthenticatedFunc() ? "Henter fylker..." : "Logg inn for å se listen"}</p>
        )}
      </div>
    </ListItemAccordion>
  );
};

const List = styled(UnstyledList)`
  margin-left: 8px;
`;

export default Kommunegrenser;
