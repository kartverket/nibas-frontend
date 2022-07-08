import { useTranslation } from "react-i18next";
import styled from "styled-components";
import ListItemAccordion from "../ListItemAccordion";
import KommuneList from "./KommuneList";
import { UnstyledList } from "components/UnstyledList";
import { InndelingerKretsProvider } from "contexts/InndelingerKretsContext";
import useFylker from "hooks/inndelinger/useFylker";
import { getNavnInSpraak } from "utils/language/language";

const Grunnkretser = () => {
  const { fylker } = useFylker();
  const { t } = useTranslation();

  return (
    <ListItemAccordion title={t("inndelinger.Grunnkretser")}>
      <InndelingerKretsProvider kretstype="grunnkrets">
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
          <p>{t("Henter fylker")}...</p>
        )}
      </InndelingerKretsProvider>
    </ListItemAccordion>
  );
};

const List = styled(UnstyledList)`
  margin-left: 8px;
`;

export default Grunnkretser;
