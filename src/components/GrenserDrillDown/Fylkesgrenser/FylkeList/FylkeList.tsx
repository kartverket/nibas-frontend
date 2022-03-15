import styled from "styled-components";
import useSWR from "swr";
import ApiGrense from "../../ApiGrense";
import { useEditGrenser } from "../../EditGrenserContext";
import { SimpleFylke } from "types/api";
import { fetcher } from "utils/swr";

const FylkeList = () => {
  const { data: fylker } = useSWR<SimpleFylke[]>("/v1/fylker", fetcher);
  const { setObjectValue, values } = useEditGrenser("fylke");

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
