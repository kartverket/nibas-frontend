import styled from "styled-components";
import useSWR from "swr";
import { fetchKommunerByFylke } from "api/kommuner";
import ApiGrense from "components/GrenserDrillDown/ApiGrense";
import { useEditGrenser } from "components/GrenserDrillDown/EditGrenserContext";
import { SimpleKommune } from "types/api";

type Props = {
  fylke: SimpleKommune;
};

const KommuneList = ({ fylke }: Props) => {
  const { data: kommuner } = useSWR(`/v1/kommuner?fylkeid=${fylke.id}`, () =>
    fetchKommunerByFylke(fylke.id)
  );
  const { setObjectValue, values } = useEditGrenser("kommune");

  if (!kommuner) return null;

  return (
    <Wrapper>
      {kommuner.map((kommune) => (
        <ApiGrense
          key={kommune.id}
          grense={kommune}
          grenseValue={values[kommune.id]}
          setGrenseValue={setObjectValue}
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
