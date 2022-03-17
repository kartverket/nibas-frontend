import styled from "styled-components";
import ApiGrense from "../ApiGrense";
import { ObjectValue } from "../useEditGrenser";
import useApiSWR from "hooks/useApiSWR";

type Props = {
  fylkeValues: Record<string, ObjectValue>;
  setFylkeValue: (kommune: string, value: ObjectValue) => void;
};

const FylkeList = ({ fylkeValues, setFylkeValue }: Props) => {
  const { data: fylker } = useApiSWR("/v1/fylker");
  // const { data: fylke } = useApiSWR(`/v1/fylker/{id}`, { id: "5" });
  const { data: fdffsd } = useApiSWR(`/v1/fylker/{id}/historikk/{revision}`, {
    id: "b",
    revision: 5,
  });

  if (!fylker) return null;

  return (
    <Wrapper>
      {fylker.map((fylke) => (
        <ApiGrense
          key={fylke.id}
          grense={fylke}
          grenseValue={fylkeValues[fylke.id]}
          setGrenseValue={setFylkeValue}
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
