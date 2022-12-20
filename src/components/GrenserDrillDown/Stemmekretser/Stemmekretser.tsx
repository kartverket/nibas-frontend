import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import KommuneList from "../Kretser/KommuneList";
import ListItemAccordion from "../ListItemAccordion";
import { UnstyledList } from "components/UnstyledList";
import { InndelingerKretsProvider } from "contexts/InndelingerKretsContext";
import useFylker from "hooks/inndelinger/useFylker";
import { getNavnInSpraak } from "utils/language/language";
import { getIdFromEntity } from "utils/api";

const Stemmekretser = () => {
  const { fylker } = useFylker();
  const { t } = useTranslation();
  const { isAuthenticatedFunc } = useAuthenticationFlow();

  return (
    <ListItemAccordion title={t("inndelinger.Stemmekretser")}>
      <InndelingerKretsProvider kretstype="stemmekrets">
        {fylker ? (
          <List>
            {fylker.map((fylke) => (
              <ListItemAccordion
                key={getIdFromEntity(fylke)}
                title={getNavnInSpraak(fylke.navn, "nor")}
              >
                <KommuneList fylke={fylke} />
              </ListItemAccordion>
            ))}
          </List>
        ) : (
          <p>
            {isAuthenticatedFunc()
              ? t("Henter fylker")
              : t("Logg inn for å se listen")}
          </p>
        )}
      </InndelingerKretsProvider>
    </ListItemAccordion>
  );
};

const List = styled(UnstyledList)`
  margin-left: 8px;
`;

export default Stemmekretser;
