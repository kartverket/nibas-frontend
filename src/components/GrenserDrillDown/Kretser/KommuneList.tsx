import styled from "styled-components";
import Kommune from "./Kommune";
import useKommuner from "hooks/inndelinger/useKommuner";
import { GrenseRef } from "types/api";

type Props = {
  fylke: GrenseRef;
};

const KommuneList = ({ fylke }: Props) => {
  const { kommuner, error } = useKommuner(fylke.id);

  if (error) return <p>Fikk ikke hentet kommuner</p>;

  if (!kommuner) return null;

  return (
    <Wrapper>
      {kommuner.map((kommune) => (
        <Kommune key={kommune.id} kommune={kommune} />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default KommuneList;
