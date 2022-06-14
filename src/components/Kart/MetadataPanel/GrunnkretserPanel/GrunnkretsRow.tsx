import useNibasApi from "hooks/useNibasApi";
import { GrunnkretsRef } from "types/api";

type Props = {
  grunnkrets: GrunnkretsRef;
};

const GrunnkretsRow = ({ grunnkrets }: Props) => {
  const { data: fullGrunnkrets } = useNibasApi("/v1/grunnkretser/{id}", {
    id: grunnkrets.id,
  });

  return (
    <tr key={grunnkrets.id}>
      <td>{fullGrunnkrets?.navn ?? "---"}</td>
      <td>{fullGrunnkrets?.grunnkretsnummer ?? "---"}</td>
    </tr>
  );
};

export default GrunnkretsRow;
