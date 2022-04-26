import { useTranslation } from "react-i18next";
import ListItemAccordion from "../ListItemAccordion";

const Skolekretser = () => {
  const { t } = useTranslation();

  return (
    <ListItemAccordion title={t("inndelinger.Skolekretser")}>
      <p>Kommer senere!</p>
    </ListItemAccordion>
  );
};

export default Skolekretser;
