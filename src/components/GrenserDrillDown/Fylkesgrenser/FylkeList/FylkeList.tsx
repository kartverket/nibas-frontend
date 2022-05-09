import styled from "styled-components";
import ApiGrense from "../../ApiGrense";
import { useEditGrenser } from "../../EditGrenserContext";
import useNibasApi from "hooks/useNibasApi";

type Props = {
  onlyDisplayEditing?: boolean;
};

const FylkeList = ({ onlyDisplayEditing = false }: Props) => {
  const { data: fylker, error } = useNibasApi("/v1/fylker");

  const { setObjectValue, values } = useEditGrenser("fylke");

  if (error) return <p>Fikk ikke hentet fylker</p>;

  if (!fylker) return null;

  const fylkeIdsBeingEdited = Object.keys(values) ?? [];
  const filteredFylker = onlyDisplayEditing
    ? fylker.filter((fylke) =>
        fylkeIdsBeingEdited.some((fylkeId) => fylke.id === fylkeId)
      )
    : fylker;

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
