import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import styled from "styled-components";
import useSWR from "swr";
import ApiGrense from "components/GrenserDrillDown/ApiGrense";
import { useEditGrenser } from "components/GrenserDrillDown/EditGrenserContext";

import { SimpleKommune } from "types/api";
import { fetcherWithToken } from "utils/swr";

type Props = {
  fylke: SimpleKommune;
};

const KommuneList = ({ fylke }: Props) => {
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { data: kommuner, error } = useSWR<SimpleKommune[]>(
    [`/v1/kommuner?fylkeid=${fylke.id}`, tokenHolderFunc()?.token],
    fetcherWithToken
  );

  const { setObjectValue, values } = useEditGrenser("kommune");

  if (error) return <p>Fikk ikke hentet kommuner</p>;

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
