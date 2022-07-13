import useNibasApi from "hooks/useNibasApi";
import { getNavnInSpraak } from "utils/language/language";

type Props = {
  id: string;
};

const StemmekretsRow = ({ id }: Props) => {
  const { data: stemmekrets } = useNibasApi("/v1/stemmekretser/{id}", {
    id,
  });

  if (!stemmekrets) return null;

  return (
    <tr>
      <td>{getNavnInSpraak(stemmekrets.stemmekretsnavn, "nor")}</td>
      <td>{stemmekrets.stemmekretsnummer}</td>
      <td>{stemmekrets.valgdistriktsnummer}</td>
      <td>{stemmekrets.tellekretsnavn}</td>
      <td>{stemmekrets.tellekretsnummer}</td>
    </tr>
  );
};

export default StemmekretsRow;
