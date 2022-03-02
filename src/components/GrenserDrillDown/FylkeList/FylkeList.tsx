import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import styled from "styled-components";
import useSWR from "swr";
import ApiGrense from "../ApiGrense";
import { ObjectValue } from "../useEditGrenser";
import { SimpleFylke } from "types/api";
import { fetcherWithToken } from "utils/swr";

type Props = {
  fylkeValues: Record<string, ObjectValue>;
  setFylkeValue: (kommune: string, value: ObjectValue) => void;
};

const FylkeList = ({ fylkeValues, setFylkeValue }: Props) => {
  const { tokenHolderFunc } = useAuthenticationFlow();

  const { data: fylker } = useSWR<SimpleFylke[]>(
    ["/v1/fylker", tokenHolderFunc()?.token],
    fetcherWithToken
  );

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
