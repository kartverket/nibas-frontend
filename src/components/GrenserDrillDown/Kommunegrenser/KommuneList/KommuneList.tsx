import styled from "styled-components";
import ApiGrense from "components/GrenserDrillDown/ApiGrense";
import { useEditGrenser } from "contexts/EditGrenserContext";
import useKommuner from "hooks/inndelinger/useKommuner";
import useOnlyDisplayEditingGrenser from "hooks/useOnlyDisplayEditingGrenser";
import { GrenseRef } from "types/api";
import useKommunegrenser from "hooks/inndelinger/useKommunegrenser";
import { useState } from "react";
import ListItemAccordion from "components/GrenserDrillDown/ListItemAccordion";
import { getNavnInSpraak } from "utils/language/language";
import { LinkButton } from "components/form/Button";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";

type Props = {
  fylke: GrenseRef;
  onlyDisplayEditing?: boolean;
};

const KommuneList = ({ fylke, onlyDisplayEditing = false }: Props) => {
  const { kommuner, error } = useKommuner(fylke.id);
  const [shouldFetch, setShouldFetch] = useState(false);
  const { kommunegrenser } = useKommunegrenser(fylke.id, shouldFetch);
  console.log(kommunegrenser);
  const { value, toggleEditing } = useEditGrense(
    "kommune",
    fylke.id,
    kommunegrenser
  );

  const { values } = useEditGrenser("kommune");
  const filteredKommuner = useOnlyDisplayEditingGrenser(
    kommuner,
    values,
    onlyDisplayEditing
  );

  const editKommunegrenser = () => {
    setShouldFetch(!shouldFetch);
    toggleEditing();
  };

  if (error) return <p>Fikk ikke hentet kommuner</p>;

  if (!filteredKommuner) return null;

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
        {filteredKommuner.map((kommune) => (
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
