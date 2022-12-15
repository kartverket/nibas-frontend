import useFylkesgrenser from "hooks/inndelinger/useFylkesgrenser";
import { useTranslation } from "react-i18next";
import FylkeList from "./FylkeList";
import EditableGrenseAccordion from "../EditableGrenseAccordion";

const Fylkesgrenser = () => {
  const { t } = useTranslation();
  const { fylkesgrenser, isFetching } = useFylkesgrenser();

  return (
    <EditableGrenseAccordion
      features={fylkesgrenser}
      grenseId="fylker"
      grenseType="fylke"
      isFetching={isFetching}
      title={t("inndelinger.Fylkesgrenser")}
    >
      <FylkeList />
    </EditableGrenseAccordion>
  );
};

export default Fylkesgrenser;
