import { KretsRow } from "../KretsTable";
import Icon from "components/Icon";
import { useUtkastEntity } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { StemmekretsRef, StemmekretsResponse } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { ToggleableKretsButton } from "../Panel";
import FutureChangesButton from "../FutureChangesButton";
import { getIdFromEntity } from "utils/api";

type Props = {
  stemmekretsRef: StemmekretsRef;
  toggleRow: (id: string) => void;
  isRowOpen: (id: string) => boolean;
  toggleFutureChangesRow: (id: string) => void;
  isFutureChangesOpen: boolean;
};

const StemmekretsRow = ({
  stemmekretsRef,
  toggleRow,
  isRowOpen,
  toggleFutureChangesRow,
  isFutureChangesOpen,
}: Props) => {
  const stemmekretsId = getIdFromEntity(stemmekretsRef);
  const { data: stemmekrets } = useNibasApi("/v1/stemmekretser/{id}", {
    id: stemmekretsId,
  });

  const utkastStemmekrets = useUtkastEntity(
    stemmekrets,
    "stemmekretsendringer"
  ) as StemmekretsResponse | undefined;

  if (!utkastStemmekrets) return null;

  const name = getNavnInSpraak(utkastStemmekrets.stemmekretsnavn, "nor");

  const shouldShowFutureChangesButton =
    stemmekretsRef.antallFramtidigeVersjoner > 0;

  return (
    <KretsRow isActive={isRowOpen(stemmekretsId)}>
      <td>{utkastStemmekrets.stemmekretsnummer}</td>
      <td>{name}</td>
      <td>{utkastStemmekrets.tellekretsnavn}</td>
      <td>{utkastStemmekrets.tellekretsnummer}</td>
      <td>{utkastStemmekrets.valgdistriktsnummer}</td>
      <td>
        {shouldShowFutureChangesButton && (
          <FutureChangesButton
            isOpen={isFutureChangesOpen}
            krets={stemmekretsRef}
            toggleRow={toggleFutureChangesRow}
          />
        )}
      </td>
      <td>
        <ToggleableKretsButton
          isOpen={isRowOpen(stemmekretsId)}
          onClick={() => toggleRow(stemmekretsId)}
          icon={
            isRowOpen(stemmekretsId) ? (
              <Icon icon="settings" aria-label={`Lukk redigering av ${name}`} />
            ) : (
              <Icon icon="settings" aria-label={`Åpne redigering av ${name}`} />
            )
          }
        />
      </td>
    </KretsRow>
  );
};

export default StemmekretsRow;
