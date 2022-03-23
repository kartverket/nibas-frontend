import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import styled from "styled-components";
import useSWR from "swr";
import ApiGrense from "../../ApiGrense";
import { useEditGrenser } from "../../EditGrenserContext";
import { SimpleFylke } from "types/api";
import { fetcherWithToken } from "utils/swr";

const FylkeList = () => {
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { data: fylker, error } = useSWR<SimpleFylke[]>(
    ["/v1/fylker", tokenHolderFunc()?.token],
    fetcherWithToken
  );

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
