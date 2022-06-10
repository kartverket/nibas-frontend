import styled from "styled-components";
import ApiGrense from "components/GrenserDrillDown/ApiGrense";
import { useEditGrenser } from "contexts/EditGrenserContext/EditGrenserContext";
import useGrunnkretser from "hooks/inndelinger/useGrunnkretser";
import useOnlyDisplayEditingGrenser from "hooks/useOnlyDisplayEditingGrenser";

type Props = {
  onlyDisplayEditing?: boolean;
};

const GrunnkretsList = ({ onlyDisplayEditing = false }: Props) => {
  const { grunnkretser } = useGrunnkretser();
  const { values } = useEditGrenser("grunnkrets");
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

export default GrunnkretsList;
