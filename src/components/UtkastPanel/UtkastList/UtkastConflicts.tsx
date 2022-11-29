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
};

const UtkastConflicts = ({ utkastId, conflictResponse, onCancel }: Props) => {
  const [newRequests, setNewRequests] = useState<GrunnkretsRequest[]>([]);
  const [conflictIndex, setConflictIndex] = useState(0);

  const { data: utkast } = useNibasApi("/v1/utkast/{id}", {
    id: utkastId,
  });

  const currentItem =
    utkast?.operasjoner.metadataendringer.grunnkretsendringer[
      // currentConflict.id
      "9a3cc5ad-ad88-4c8a-ac48-7944dad035cf"
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
      onNext={() => setConflictIndex(conflictIndex + 1)}
      onCancel={onCancel}
    />
  );
};

export default UtkastConflicts;
