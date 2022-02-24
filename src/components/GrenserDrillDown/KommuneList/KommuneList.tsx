import styled from "styled-components";
import useSWR from "swr";
import ApiGrense from "../ApiGrense";
import { ObjectValue } from "../useEditGrenser";
import { fetchKommunerByFylke } from "api/kommuner";
import { SimpleKommune } from "types/api";

type Props = {
  fylke: SimpleKommune;
  kommuneValues: Record<string, ObjectValue>;
  setKommuneValue: (kommune: string, value: ObjectValue) => void;
};

const KommuneList = ({ fylke, kommuneValues, setKommuneValue }: Props) => {
  const { data: kommuner } = useSWR(`/v1/kommuner?fylkeid=${fylke.id}`, () =>
    fetchKommunerByFylke(fylke.id)
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
