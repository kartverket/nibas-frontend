import styled from "styled-components";
import ApiGrense from "../ApiGrense";
import { ObjectValue } from "../useEditGrenser";
import useNibasApi from "hooks/useNibasApi";

type Props = {
  fylkeValues: Record<string, ObjectValue>;
  setFylkeValue: (kommune: string, value: ObjectValue) => void;
};

const FylkeList = ({ fylkeValues, setFylkeValue }: Props) => {
  const { data: fylker } = useNibasApi("/v1/fylker");

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
