import { KretsRow } from "../KretsTable";
import Button from "components/form/Button";
import Icon from "components/Icon";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
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

  const utkastStemmekrets = useUtkastEntity(
    stemmekrets,
    "stemmekretsendringer"
  ) as StemmekretsResponse | undefined;

  if (!utkastStemmekrets) return null;

  return (
    <KretsRow onClick={() => toggleRow(utkastStemmekrets.id)}>
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
              <Icon
                icon="expand_less"
                aria-label="Lukk redigering av stemmekrets"
              />
            ) : (
              <Icon
                icon="expand_more"
                aria-label="Åpne redigering av stemmekrets"
              />
            )
          }
        />
      </td>
    </KretsRow>
  );
};

export default StemmekretsRow;
