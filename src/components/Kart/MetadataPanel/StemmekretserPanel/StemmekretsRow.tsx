import { KretsRow } from "../KretsTable";
import Button from "components/form/Button";
import useNibasApi from "hooks/useNibasApi";
import { ReactComponent as CaretDown } from "icons/caretdown.svg";
import { ReactComponent as CaretUp } from "icons/caretup.svg";
import { getNavnInSpraak } from "utils/language/language";

type Props = {
  id: string;
  toggleRow: (id: string) => void;
  isRowOpen: (id: string) => boolean;
};

const StemmekretsRow = ({ id, toggleRow, isRowOpen }: Props) => {
  const { data: stemmekrets } = useNibasApi("/v1/stemmekretser/{id}", {
    id,
  });

  if (!stemmekrets) return null;

  return (
    <KretsRow>
      <td>{getNavnInSpraak(stemmekrets.stemmekretsnavn, "nor")}</td>
      <td>{stemmekrets.stemmekretsnummer}</td>
      <td>{stemmekrets.valgdistriktsnummer}</td>
      <td>{stemmekrets.tellekretsnavn}</td>
      <td>{stemmekrets.tellekretsnummer}</td>
      <td>
        <Button
          variant="unstyled"
          onClick={() => toggleRow(stemmekrets.id)}
          icon={isRowOpen(stemmekrets.id) ? <CaretUp /> : <CaretDown />}
        />
      </td>
    </KretsRow>
  );
};

export default StemmekretsRow;
