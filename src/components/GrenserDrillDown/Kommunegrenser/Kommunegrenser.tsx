import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import ListItemAccordion from "../ListItemAccordion";
import KommuneList from "./KommuneList";
import { UnstyledList } from "components/UnstyledList";
import useFylker from "hooks/inndelinger/useFylker";
import { getNavnInSpraak } from "utils/language/language";

const Kommunegrenser = () => {
  const { fylker } = useFylker();
  const { t } = useTranslation();
  const { isAuthenticatedFunc } = useAuthenticationFlow();

  return (
    <ListItemAccordion title={t("inndelinger.Kommunegrenser")}>
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
          <p>
            {isAuthenticatedFunc()
              ? t("Henter fylker")
              : t("Logg inn for å se listen")}
          </p>
        )}
      </div>
    </ListItemAccordion>
  );
};

const List = styled(UnstyledList)`
  margin-left: 8px;
`;

export default Kommunegrenser;
