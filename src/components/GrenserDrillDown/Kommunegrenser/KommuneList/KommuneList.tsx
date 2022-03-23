import styled from "styled-components";
import ApiGrense from "components/GrenserDrillDown/ApiGrense";
import { useEditGrenser } from "components/GrenserDrillDown/EditGrenserContext";
import useNibasApi from "hooks/useNibasApi";
import { GrenseRef } from "types/api";

type Props = {
  fylke: GrenseRef;
};

const KommuneList = ({ fylke }: Props) => {
  const { data: kommuner, error } = useNibasApi("/v1/kommuner", {
    fylkeid: fylke.id,
  });

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
