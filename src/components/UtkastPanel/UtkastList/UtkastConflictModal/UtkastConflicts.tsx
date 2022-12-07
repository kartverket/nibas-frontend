import useNibasApi from "hooks/useNibasApi";
import {
  FramtidigVersjonConflict,
  GrunnkretsRequest,
  UtkastMetadataendringer,
} from "types/api";
import GrunnkretsUtkastConflictModal from ".";
import { metadataendringerKeyByConflictType } from "./constants";

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

  console.log(conflictResponse);

  const metadataendringerKey = metadataendringerKeyByConflictType[
    conflictResponse.type
  ] as keyof UtkastMetadataendringer;

  const currentItem =
    utkast?.operasjoner.metadataendringer[metadataendringerKey]?.[
      conflictResponse.id.lokalid.value
    ];

  console.log(currentItem);

  if (!utkast || !currentItem) return null;

  if (conflictResponse.type === "GRUNNKRETS")
    return (
      <GrunnkretsUtkastConflictModal
        conflictResponse={conflictResponse}
        current={currentItem as GrunnkretsRequest}
        utkast={utkast}
        onCancel={onCancel}
        onNext={onResolved}
      />
    );

  return null;
};

export default UtkastConflicts;
