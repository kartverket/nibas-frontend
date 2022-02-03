import styled from "styled-components";
import useSWR from "swr";
import ToggleableKommune from "./ToggleableKommune";
import { fetchKommunerByFylke } from "api/kommuner";
import { SimpleKommune } from "types/api";

type Props = {
  fylke: SimpleKommune;
};

const KommuneList = ({ fylke }: Props) => {
  const { data: kommuner } = useSWR(`/v1/kommuner?fylkeid=${fylke.id}`, () =>
    fetchKommunerByFylke(fylke.id)
  );

  if (!kommuner) return null;

  return (
    <Wrapper>
      {kommuner.map((kommune) => (
        <ToggleableKommune key={kommune.id} kommune={kommune} />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default KommuneList;
