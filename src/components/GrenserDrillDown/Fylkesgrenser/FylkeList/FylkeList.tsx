import styled from "styled-components";
import ApiGrense from "../../ApiGrense";
import { useEditGrenser } from "../../EditGrenserContext";
import useNibasApi from "hooks/useNibasApi";
import useOnlyDisplayEditingGrenser from "hooks/useOnlyDisplayEditingGrenser";
import { sortGrenserAlphabetically } from "utils/language/language";

type Props = {
  onlyDisplayEditing?: boolean;
};

const FylkeList = ({ onlyDisplayEditing = false }: Props) => {
  const { data: fylker, error } = useNibasApi("/v1/fylker");

  const { setObjectValue, values } = useEditGrenser("fylke");

  const sortedFylker = sortGrenserAlphabetically(fylker);
  const filteredFylker = useOnlyDisplayEditingGrenser(
    sortedFylker,
    values,
    onlyDisplayEditing
  );

  if (error) return <p>Fikk ikke hentet fylker</p>;

  if (!filteredFylker) return null;

  return (
    <Wrapper>
      {filteredFylker.map((fylke) => (
        <ApiGrense
          key={fylke.id}
          grense={fylke}
          grenseValue={values[fylke.id]}
          setGrenseValue={setObjectValue}
          featuresUrl={`/v1/fylker/${fylke.id}/grenser`}
          type="fylke"
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default FylkeList;
