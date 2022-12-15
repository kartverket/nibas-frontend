import { useFlag } from "components/FeatureToggle";
import useNibasApi from "hooks/useNibasApi";
import {
  FramtidigVersjonConflict,
  GrunnkretsRequest,
  StemmekretsRequest,
  UtkastMetadataendringer,
} from "types/api";
import GrunnkretsUtkastConflictModal from ".";
import { metadataendringerKeyByConflictType } from "./constants";
import StemmekretsUtkastConflictModal from "./StemmekretsUtkastConflictModal";

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

  const metadataendringerKey = metadataendringerKeyByConflictType[
    conflictResponse.type
  ] as keyof UtkastMetadataendringer;

  const currentItem =
    utkast?.operasjoner.metadataendringer[metadataendringerKey]?.[
      conflictResponse.id.lokalid.value
    ];

  const isStemmekretsEnabled = useFlag("fremtidige-endringer-stemmekretser");

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

  if (isStemmekretsEnabled && conflictResponse.type === "STEMMEKRETS")
    return (
      <StemmekretsUtkastConflictModal
        conflictResponse={conflictResponse}
        current={currentItem as StemmekretsRequest}
        utkast={utkast}
        onCancel={onCancel}
        onNext={onResolved}
      />
    );

  return null;
};

export default UtkastConflicts;
