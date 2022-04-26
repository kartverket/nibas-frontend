import { useTranslation } from "react-i18next";
import ListItemAccordion from "../ListItemAccordion";
import KodelistePreview from "components/KodelisteSelect/KodelistePreview";

const Svalbardomraadet = () => {
  const { t } = useTranslation();

  return (
    <ListItemAccordion title={t("inndelinger.Svalbardområdet")}>
      {/* Kun for test/displayformål. */}
      <KodelistePreview />
    </ListItemAccordion>
  );
};

export default Svalbardomraadet;
