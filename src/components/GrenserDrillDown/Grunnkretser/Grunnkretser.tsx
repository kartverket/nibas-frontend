import { useTranslation } from "react-i18next";
import ListItemAccordion from "../ListItemAccordion";

const Grunnkretser = () => {
  const { t } = useTranslation();

  return (
    <ListItemAccordion title={t("inndelinger.Grunnkretser")}>
      <p>Kommer senere!</p>
    </ListItemAccordion>
  );
};

export default Grunnkretser;
