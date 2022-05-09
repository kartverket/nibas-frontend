import { useTranslation } from "react-i18next";
import ListItemAccordion from "../ListItemAccordion";
import FylkeList from "./FylkeList";

const Fylkesgrenser = () => {
  const { t } = useTranslation();

  return (
    <ListItemAccordion title={t("inndelinger.Fylkesgrenser")}>
      <FylkeList />
    </ListItemAccordion>
  );
};

export default Fylkesgrenser;
