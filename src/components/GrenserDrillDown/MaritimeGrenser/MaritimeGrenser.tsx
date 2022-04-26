import { useTranslation } from "react-i18next";
import ListItemAccordion from "../ListItemAccordion";

const MaritimeGrenser = () => {
  const { t } = useTranslation();

  return (
    <ListItemAccordion title={t("inndelinger.Maritime grenser")}>
      <p>Kommer senere!</p>
    </ListItemAccordion>
  );
};

export default MaritimeGrenser;
