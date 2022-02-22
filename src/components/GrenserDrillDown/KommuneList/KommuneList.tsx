import styled from "styled-components";
import useSWR from "swr";
import { ObjectValue } from "../useEditGrenser";
import Kommune from "./Kommune";
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
        <Kommune
          key={kommune.id}
          kommune={kommune}
          kommuneValue={kommuneValues[kommune.id]}
          setKommuneValue={setKommuneValue}
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default KommuneList;
