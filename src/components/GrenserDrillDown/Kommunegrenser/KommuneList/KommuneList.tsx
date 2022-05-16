import styled from "styled-components";
import ApiGrense from "components/GrenserDrillDown/ApiGrense";
import { useEditGrenser } from "components/GrenserDrillDown/EditGrenserContext";
import useNibasApi from "hooks/useNibasApi";
import useOnlyDisplayEditingGrenser from "hooks/useOnlyDisplayEditingGrenser";
import { GrenseRef } from "types/api";

type Props = {
  fylke: GrenseRef;
  onlyDisplayEditing?: boolean;
};

const KommuneList = ({ fylke, onlyDisplayEditing = false }: Props) => {
  const { data: kommuner, error } = useNibasApi("/v1/kommuner", {
    fylkeid: fylke.id,
  });

  const { setObjectValue, values } = useEditGrenser("kommune");
  const filteredKommuner = useOnlyDisplayEditingGrenser(
    kommuner,
    values,
    onlyDisplayEditing
  );

  if (error) return <p>Fikk ikke hentet kommuner</p>;

  if (!filteredKommuner) return null;

  return (
    <Wrapper>
      {filteredKommuner.map((kommune) => (
        <ApiGrense
          key={kommune.id}
          grense={kommune}
          grenseValue={values[kommune.id]}
          setGrenseValue={setObjectValue}
          featuresUrl={`/v1/kommuner/${kommune.id}/grenser`}
          type="kommune"
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default KommuneList;
