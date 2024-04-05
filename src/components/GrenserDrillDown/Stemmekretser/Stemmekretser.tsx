import { styled } from "styled-components";
import KommuneList from "../Kretser/KommuneList";
import ListItemAccordion from "../ListItemAccordion";
import { UnstyledList } from "components/UnstyledList";
import { InndelingerKretsProvider } from "contexts/InndelingerKretsContext";
import useFylker from "hooks/inndelinger/useFylker";
import { getNavnInSpraak } from "utils/language/language";
import { getIdFromEntity } from "utils/api";
import { useAuthentication } from "components/Authentication/AuthenticationHook";

const Stemmekretser = () => {
  const { fylker } = useFylker();
  const { isAuthenticated } = useAuthentication();

  return (
    <ListItemAccordion title="Stemmekretser">
      <InndelingerKretsProvider kretstype="stemmekrets">
        {fylker ? (
          <List>
            {fylker.map((fylke) => (
              <ListItemAccordion
                key={getIdFromEntity(fylke)}
                title={`${fylke.nummer} ${getNavnInSpraak(fylke.navn, "nor")}`}
              >
                <KommuneList fylke={fylke} />
              </ListItemAccordion>
            ))}
          </List>
        ) : (
          <p>{isAuthenticated ? "Henter fylker..." : "Logg inn for å se listen"}</p>
        )}
      </InndelingerKretsProvider>
    </ListItemAccordion>
  );
};

const List = styled(UnstyledList)`
  margin-left: 8px;
`;

export default Stemmekretser;
