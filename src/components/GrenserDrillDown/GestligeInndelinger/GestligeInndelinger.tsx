import { useTranslation } from "react-i18next";
import ListItemAccordion from "../ListItemAccordion";

const GestligeInndeliger = () => {
  const { t } = useTranslation();

  return (
    <ListItemAccordion title={t("inndelinger.Gestlige inndelinger")}>
      <p>Kommer senere!</p>
    </ListItemAccordion>
  );
};

export default GestligeInndeliger;
