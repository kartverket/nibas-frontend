import styled from "styled-components";
import ApiGrense from "../../ApiGrense";
import { useEditGrenser } from "../../EditGrenserContext";
import useNibasApi from "hooks/useNibasApi";

const FylkeList = () => {
  const { data: fylker, error } = useNibasApi("/v1/fylker");

  const { setObjectValue, values } = useEditGrenser("fylke");

  if (error) return <p>Fikk ikke hentet fylker</p>;

  if (!fylker) return null;

  return (
    <Wrapper>
      {fylker.map((fylke) => (
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
