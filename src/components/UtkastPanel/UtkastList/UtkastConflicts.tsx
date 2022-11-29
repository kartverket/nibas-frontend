import { CustomModalWrapper, ModalOverlay } from "components/Feedback/Feedback";
import useNibasApi from "hooks/useNibasApi";
import { useState } from "react";
import ReactModal from "react-modal";
import styled from "styled-components";
import {
  ConflictResolved,
  ConflictResponse,
  FramtidigVersjonConflict,
  GrunnkretsRequest,
} from "types/api";
import UtkastConflictModal from "./UtkastConflictModal";

type Props = {
  utkastId: string;
  conflictResponse: FramtidigVersjonConflict;
  onCancel: () => void;
  close: () => void;
  onResolved: () => void;
};

const UtkastConflicts = ({
  utkastId,
  conflictResponse,
  onCancel,
  onResolved,
  close,
}: Props) => {
  const [newRequests, setNewRequests] = useState<GrunnkretsRequest[]>([]);
  const [conflictIndex, setConflictIndex] = useState(0);

  const { data: utkast } = useNibasApi("/v1/utkast/{id}", {
    id: utkastId,
  });

  const currentItem =
    utkast?.operasjoner.metadataendringer.grunnkretsendringer[
      conflictResponse.id.lokalid.value
    ];

  // const resolveConflicts = () => {
  //   const resolvedConflict: ConflictResolved = {
  //     lokalid: {
  //       value: utkastId,
  //     }
  //   }
  // }

  console.log("currentConflict", conflictResponse);
  console.log(utkast);
  console.log(currentItem);

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
