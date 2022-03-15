import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import styled from "styled-components";
import useSWR from "swr";
import ApiGrense from "../ApiGrense";
import { ObjectValue } from "../useEditGrenser";
import { SimpleKommune } from "types/api";
import { fetcherWithToken } from "utils/swr";

type Props = {
  fylke: SimpleKommune;
  kommuneValues: Record<string, ObjectValue>;
  setKommuneValue: (kommune: string, value: ObjectValue) => void;
};

const KommuneList = ({ fylke, kommuneValues, setKommuneValue }: Props) => {
  const { tokenHolderFunc } = useAuthenticationFlow();

  const { data: kommuner } = useSWR<SimpleKommune[]>(
    [`/v1/kommuner?fylkeid=${fylke.id}`, tokenHolderFunc()?.token],
    fetcherWithToken
  );

  if (!kommuner) return null;

  return (
    <Wrapper>
      {kommuner.map((kommune) => (
        <ApiGrense
          key={kommune.id}
          grense={kommune}
          grenseValue={kommuneValues[kommune.id]}
          setGrenseValue={setKommuneValue}
          featuresUrl={`/v1/kommuner/${kommune.id}/grenser`}
          type="kommune"
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default KommuneList;
