import styled from "styled-components";
import useSWR from "swr";
import { ObjectValue } from "../useEditGrenser";
import Fylke from "./Fylke";
import { SimpleFylke } from "types/api";
import { fetcher } from "utils/swr";

type Props = {
  fylkeValues: Record<string, ObjectValue>;
  setFylkeValue: (kommune: string, value: ObjectValue) => void;
};

const FylkeList = ({ fylkeValues, setFylkeValue }: Props) => {
  const { data: fylker } = useSWR<SimpleFylke[]>("/v1/fylker", fetcher);

  if (!fylker) return null;

  return (
    <Wrapper>
      {fylker.map((fylke) => (
        <Fylke
          key={fylke.id}
          fylke={fylke}
          fylkeValue={fylkeValues[fylke.id]}
          setFylkeValue={setFylkeValue}
        />
      ))}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-left: 8px;
`;

export default FylkeList;
