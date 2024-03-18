import { styled } from "styled-components";
import Kommune from "./Kommune";
import useKommuner from "hooks/inndelinger/useKommuner";
import { AdministrativEnhetResponse } from "types/api";
import { getIdFromEntity } from "utils/api";

type Props = {
  fylke: AdministrativEnhetResponse;
};

const KommuneList = ({ fylke }: Props) => {
  const { kommuner, error } = useKommuner(getIdFromEntity(fylke));

  if (error) return <p>Fikk ikke hentet kommuner</p>;

  if (!kommuner) return null;

  return (
    <Wrapper>
      {kommuner.map((kommune) => (
        <Kommune key={getIdFromEntity(kommune)} kommune={kommune} />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default KommuneList;
