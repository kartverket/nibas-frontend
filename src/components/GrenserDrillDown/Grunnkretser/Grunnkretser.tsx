import { useTranslation } from "react-i18next";
import ListItemAccordion from "../ListItemAccordion";
import GrunnkretsList from "./GrunnkretsList";

const Grunnkretser = () => {
  const { t } = useTranslation();

  return (
    <ListItemAccordion title={t("inndelinger.Grunnkretser")}>
      <GrunnkretsList />
    </ListItemAccordion>
  );
};

export default Grunnkretser;
