import { LinkButton } from "components/form/Button";
import Loader from "components/Loader";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import useFylkesgrenser from "hooks/inndelinger/useFylkesgrenser";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import ListItemAccordion from "../ListItemAccordion";
import FylkeList from "./FylkeList";

const Fylkesgrenser = () => {
  const { t } = useTranslation();
  const [shouldFetch, setShouldFetch] = useState(false);
  const { fylkesgrenser, isFetching } = useFylkesgrenser(shouldFetch);
  const { value, toggleEditing } = useEditGrense(
    "fylke",
    "fylke",
    fylkesgrenser
  );
  console.log(fylkesgrenser);

  useEffect(() => {
    if (value.editing) {
      setShouldFetch(true);
    }
  }, [value.editing]);

  const editFylkesgrenser = () => {
    toggleEditing();
  };

  return (
    <ListItemAccordion
      subButton={
        <LinkButton onClick={editFylkesgrenser}>
          {value.editing ? "Stopp redigering" : "Rediger fylkesgrenser"}
        </LinkButton>
      }
      title={
        <TitleWithEditButton>
          {t("inndelinger.Fylkesgrenser")}

          {isFetching && <Loader />}
        </TitleWithEditButton>
      }
    >
      <FylkeList />
    </ListItemAccordion>
  );
};

const TitleWithEditButton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export default Fylkesgrenser;
