import { styled } from "styled-components";
import ApiGrense from "components/GrenserDrillDown/ApiGrense";
import useKommuner from "hooks/inndelinger/useKommuner";
import { GrenseRef } from "types/api";
import useKommunegrenser from "hooks/inndelinger/useKommunegrenser";
import { useEffect, useState } from "react";
import { getNavnInSpraak } from "utils/language/language";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import EditableGrenseAccordion from "components/GrenserDrillDown/EditableGrenseAccordion";
import { getIdFromEntity } from "utils/api";

type Props = {
  fylke: GrenseRef;
};

const KommuneList = ({ fylke }: Props) => {
  const fylkeId = getIdFromEntity(fylke);
  const { kommuner, error } = useKommuner(fylkeId);
  const [shouldFetch, setShouldFetch] = useState(false);
  const { kommunegrenser, isFetching } = useKommunegrenser(
    fylkeId,
    shouldFetch
  );
  const { value } = useEditGrense("kommune", fylkeId, kommunegrenser);

  useEffect(() => {
    if (value.editing || value.visible) {
      setShouldFetch(true);
    }
  }, [value]);

  if (error) return <p>Fikk ikke hentet kommuner</p>;

  if (!kommuner) return null;

  return (
    <EditableGrenseAccordion
      features={kommunegrenser}
      grenseId={fylkeId}
      grenseType="kommune"
      isFetching={isFetching}
      title={getNavnInSpraak(fylke.navn, "nor")}
    >
      <Wrapper>
        {kommuner.map((kommune) => (
          <ApiGrense
            key={getIdFromEntity(kommune)}
            grense={kommune}
            featuresUrl={`/v1/kommuner/${getIdFromEntity(kommune)}/grenser`}
            type="kommune"
          />
        ))}
      </Wrapper>
    </EditableGrenseAccordion>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default KommuneList;
