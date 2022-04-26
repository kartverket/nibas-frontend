import { useTranslation } from "react-i18next";
import styled from "styled-components";
import ListItemAccordion from "../ListItemAccordion";
import KommuneList from "./KommuneList";
import { UnstyledList } from "components/UnstyledList";
import useNibasApi from "hooks/useNibasApi";
import { getNavnInSpraak } from "utils/language/language";

const Kommunegrenser = () => {
  const { data: fylker } = useNibasApi("/v1/fylker");
  const { t } = useTranslation();

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
          <p>{t("Henter fylker")}...</p>
        )}
      </div>
    </ListItemAccordion>
  );
};

const List = styled(UnstyledList)`
  margin-left: 8px;
`;

export default Kommunegrenser;
