import { KretsRow } from "../KretsTable";
import Button from "components/form/Button";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { ReactComponent as CaretDown } from "icons/caretdown.svg";
import { ReactComponent as CaretUp } from "icons/caretup.svg";
import { StemmekretsResponse } from "types/api";
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

  const utkastStemmekrets = useUtkastEntity(stemmekrets, "stemmekretser") as
    | StemmekretsResponse
    | undefined;

  if (!utkastStemmekrets) return null;

  return (
    <KretsRow>
      <td>{getNavnInSpraak(utkastStemmekrets.stemmekretsnavn, "nor")}</td>
      <td>{utkastStemmekrets.stemmekretsnummer}</td>
      <td>{utkastStemmekrets.valgdistriktsnummer}</td>
      <td>{utkastStemmekrets.tellekretsnavn}</td>
      <td>{utkastStemmekrets.tellekretsnummer}</td>
      <td>
        <Button
          variant="unstyled"
          onClick={() => toggleRow(utkastStemmekrets.id)}
          icon={
            isRowOpen(utkastStemmekrets.id) ? (
              <CaretUp aria-label="Lukk redigering av stemmekrets" />
            ) : (
              <CaretDown aria-label="Åpne redigering av stemmekrets" />
            )
          }
        />
      </td>
    </KretsRow>
  );
};

export default StemmekretsRow;
