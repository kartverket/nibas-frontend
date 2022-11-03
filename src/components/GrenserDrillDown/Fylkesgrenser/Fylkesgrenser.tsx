import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import useFylkesgrenser from "hooks/inndelinger/useFylkesgrenser";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FylkeList from "./FylkeList";
import EditableGrenseAccordion from "../EditableGrenseAccordion";

const Fylkesgrenser = () => {
  const { t } = useTranslation();
  const [shouldFetch, setShouldFetch] = useState(false);
  const { fylkesgrenser, isFetching } = useFylkesgrenser(shouldFetch);
  const grenseId = "fylker";
  const { value } = useEditGrense("fylke", grenseId, fylkesgrenser);

  useEffect(() => {
    if (value.editing || value.visible) {
      setShouldFetch(true);
    }
  }, [value]);

  return (
    <EditableGrenseAccordion
      features={fylkesgrenser}
      grenseId={grenseId}
      grenseType="fylke"
      isFetching={isFetching}
      title={t("inndelinger.Fylkesgrenser")}
    >
      <FylkeList />
    </EditableGrenseAccordion>
  );
};

export default Fylkesgrenser;
