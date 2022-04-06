import { useTranslation } from "react-i18next";
import ListItemAccordion from "../ListItemAccordion";

const Delomrader = () => {
  const { t } = useTranslation();

  return (
    <ListItemAccordion title={t("inndelinger.Delområder")}>
      <p>Kommer senere!</p>
    </ListItemAccordion>
  );
};

export default Delomrader;
