import { styled } from "styled-components";
import ToggleableAdministrativEnhet from "components/GrenserDrillDown/ToggleableAdministrativEnhet/ToggleableAdministrativEnhet";
import useKommuner from "hooks/inndelinger/useKommuner";
import useKommunegrenser from "hooks/inndelinger/useKommunegrenser";
import { useEffect, useState } from "react";
import { getNavnInSpraak } from "utils/language/language";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import EditableGrenseAccordion from "components/GrenserDrillDown/EditableGrenseAccordion";
import { getIdFromEntity } from "utils/api";
import { FylkeResponse } from "types/api";

type Props = {
  fylke: FylkeResponse;
};

const KommuneList = ({ fylke }: Props) => {
  const fylkeId = getIdFromEntity(fylke);
  const { kommuner, error } = useKommuner(fylkeId);
  const [shouldFetch, setShouldFetch] = useState(false);
  const { kommunegrenser, isFetching } = useKommunegrenser(fylkeId, shouldFetch);
  const { kretsStatus } = useEditGrense("kommune", fylkeId, kommunegrenser);

  useEffect(() => {
    if (kretsStatus.isVisible || kretsStatus.isEditing) {
      setShouldFetch(true);
    }
  }, [kretsStatus]);

  if (error != null) return <p>Fikk ikke hentet kommuner</p>;

  if (!kommuner) return null;

  return (
    <EditableGrenseAccordion
      features={kommunegrenser}
      grenseId={fylkeId}
      grenseType="kommune"
      isFetching={isFetching}
      title={`${fylke.nummer} ${getNavnInSpraak(fylke.navn, "nor")}`}
    >
      <Wrapper>
        {kommuner.map((kommune) => (
          <ToggleableAdministrativEnhet
            key={getIdFromEntity(kommune)}
            administrativEnhet={kommune}
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
