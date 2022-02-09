import styled from "styled-components";
import useSWR from "swr";
import ToggleableKommune from "./ToggleableKommune";
import { SimpleKommune } from "types/api";
import { fetcher } from "utils/swr";

type Props = {
  fylke: SimpleKommune;
};

const KommuneList = ({ fylke }: Props) => {
  const { data: kommuner } = useSWR<SimpleKommune[]>(
    `/v1/kommuner?fylkeid=${fylke.id}`,
    fetcher
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
