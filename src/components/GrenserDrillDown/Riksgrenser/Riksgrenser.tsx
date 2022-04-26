import { useTranslation } from "react-i18next";
import ListItemAccordion from "../ListItemAccordion";

const Riksgrenser = () => {
  const { t } = useTranslation();

  return (
    <ListItemAccordion title={t("inndelinger.Riksgrenser")}>
      <p>Kommer senere!</p>
    </ListItemAccordion>
  );
};

export default Riksgrenser;
