import { useTranslation } from "react-i18next";
import styled from "styled-components";
import KommuneList from "../Kretser/KommuneList";
import ListItemAccordion from "../ListItemAccordion";
import { UnstyledList } from "components/UnstyledList";
import { InndelingerKretsProvider } from "contexts/InndelingerKretsContext";
import useFylker from "hooks/inndelinger/useFylker";
import { getNavnInSpraak } from "utils/language/language";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";

const Grunnkretser = () => {
  const { fylker } = useFylker();
  const { t } = useTranslation();
  const { isAuthenticatedFunc } = useAuthenticationFlow();


  return (
    <ListItemAccordion title={t("inndelinger.Grunnkretser")}>
      <InndelingerKretsProvider kretstype="grunnkrets">
        { fylker ? (
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
          <p>{ isAuthenticatedFunc() ? (
            t("Henter fylker")
          ) : ( 
            t("Logg inn for å se listen")
          )
          }</p>
        )
        } 
      </InndelingerKretsProvider>
    </ListItemAccordion>
  );
};

const List = styled(UnstyledList)`
  margin-left: 8px;
`;

export default Grunnkretser;
