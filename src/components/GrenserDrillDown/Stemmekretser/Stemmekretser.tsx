import { useTranslation } from "react-i18next";
import ListItemAccordion from "../ListItemAccordion";

const Stemmekretser = () => {
  const { t } = useTranslation();

  return (
    <ListItemAccordion title={t("inndelinger.Stemmekretser")}>
      <p>Kommer senere!</p>
    </ListItemAccordion>
  );
};

export default Stemmekretser;
