import styled from "styled-components";
import ApiGrense from "components/GrenserDrillDown/ApiGrense";
import useKommuner from "hooks/inndelinger/useKommuner";
import { GrenseRef } from "types/api";
import useKommunegrenser from "hooks/inndelinger/useKommunegrenser";
import { useEffect, useState } from "react";
import ListItemAccordion from "components/GrenserDrillDown/ListItemAccordion";
import { getNavnInSpraak } from "utils/language/language";
import { LinkButton } from "components/form/Button";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";

type Props = {
  fylke: GrenseRef;
};

const KommuneList = ({ fylke }: Props) => {
  const { kommuner, error } = useKommuner(fylke.id);
  const [shouldFetch, setShouldFetch] = useState(false);
  const { kommunegrenser } = useKommunegrenser(fylke.id, shouldFetch);
  console.log(kommunegrenser);
  const { value, toggleEditing } = useEditGrense(
    "kommune",
    fylke.id,
    kommunegrenser
  );

  useEffect(() => {
    if (value.editing) {
      setShouldFetch(true);
    }
  }, [value.editing]);

  const editKommunegrenser = () => {
    toggleEditing();
  };

  if (error) return <p>Fikk ikke hentet kommuner</p>;

  if (!kommuner) return null;

  return (
    <ListItemAccordion
      title={getNavnInSpraak(fylke.navn, "nor")}
      subButton={
        <LinkButton onClick={editKommunegrenser}>
          {value.editing ? "Stopp redigering" : "Rediger kommunegrenser"}
        </LinkButton>
      }
    >
      <Wrapper>
        {kommuner.map((kommune) => (
          <ApiGrense
            key={kommune.id}
            grense={kommune}
            featuresUrl={`/v1/kommuner/${kommune.id}/grenser`}
            type="kommune"
          />
        ))}
      </Wrapper>
    </ListItemAccordion>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default KommuneList;
