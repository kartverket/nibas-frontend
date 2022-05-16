import styled from "styled-components";
import ApiGrense from "components/GrenserDrillDown/ApiGrense";
import { useEditGrenser } from "components/GrenserDrillDown/EditGrenserContext";
import useNibasApi from "hooks/useNibasApi";
import useOnlyDisplayEditingGrenser from "hooks/useOnlyDisplayEditingGrenser";

type Props = {
  onlyDisplayEditing?: boolean;
};

const GrunnkretserList = ({ onlyDisplayEditing = false }: Props) => {
  const { data: grunnkretser } = useNibasApi("/v1/grunnkretser");
  const { values, setObjectValue } = useEditGrenser("grunnkrets");
  const filteredGrunnkretser = useOnlyDisplayEditingGrenser(
    grunnkretser,
    values,
    onlyDisplayEditing
  );

  if (!filteredGrunnkretser) return null;

  return (
    <Wrapper>
      {filteredGrunnkretser.map((grunnkrets) => (
        <ApiGrense
          key={grunnkrets.id}
          grense={grunnkrets}
          grenseValue={values[grunnkrets.id]}
          setGrenseValue={setObjectValue}
          type="grunnkrets"
          featuresUrl={`/v1/grunnkretser/${grunnkrets.id}/grenser`}
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default GrunnkretserList;
