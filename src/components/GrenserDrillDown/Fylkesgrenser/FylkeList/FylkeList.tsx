import { styled } from "styled-components";
import ApiGrense from "../../ApiGrense/ApiGrense";
import useFylker from "hooks/inndelinger/useFylker";
import { getIdFromEntity } from "utils/api";

const FylkeList = () => {
  const { fylker, error } = useFylker();
  if (error) {
    return <p>Logg inn for å se listen</p>;
  }

  if (!fylker) return null;

  return (
    <Wrapper>
      {fylker.map((fylke) => (
        <ApiGrense
          key={getIdFromEntity(fylke)}
          grense={fylke}
          featuresUrl={`/v1/fylker/${getIdFromEntity(fylke)}/grenser`}
          type="fylke"
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 24px;
`;

export default FylkeList;
