import useNibasApi from "hooks/useNibasApi";
import { FramtidigVersjonConflict } from "types/api";
import { getIdFromEntity } from "utils/api";
import UtkastConflictModal from "./UtkastConflictModal";

type Props = {
  utkastId: string;
  conflictResponse: FramtidigVersjonConflict;
  onCancel: () => void;
  close: () => void;
  onResolved: () => void;
};

// komponenten trengs egentlig ikke nå, men beholdes i tilfellet man trenger å håndtere flere konflikter
const UtkastConflicts = ({
  utkastId,
  conflictResponse,
  onCancel,
  onResolved,
}: Props) => {
  const { data: utkast } = useNibasApi("/v1/utkast/{id}", {
    id: utkastId,
  });

  const currentItem =
    utkast?.operasjoner.metadataendringer.grunnkretsendringer[
      getIdFromEntity(conflictResponse)
    ];

  if (!utkast || !currentItem) return null;

  return (
    <UtkastConflictModal
      conflictResponse={conflictResponse}
      current={currentItem}
      utkast={utkast}
      onCancel={onCancel}
      onNext={onResolved}
    />
  );
};

export default UtkastConflicts;
