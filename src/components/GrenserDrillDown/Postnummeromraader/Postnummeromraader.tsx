import { useTranslation } from "react-i18next";
import ListItemAccordion from "../ListItemAccordion";

const Postnummeromraader = () => {
  const { t } = useTranslation();

  return (
    <ListItemAccordion title={t("inndelinger.Postnummerområder")}>
      <p>Kommer senere!</p>
    </ListItemAccordion>
  );
};

export default Postnummeromraader;
