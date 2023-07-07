import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@kvib/react";
import { UtkastResponse } from "types/api";
import UtkastModalBody from "./UtkastModalBody";
import UtkastModalFooter from "./UtkastModalFooter";

type Props = {
  utkast: UtkastResponse;
  type: "Publiser" | "Slett" | null;
  onClose: () => void;
};

const UtkastModal = ({ type, onClose, utkast }: Props) => (
  <Modal isOpen={type !== null} onClose={onClose} isCentered size="2xl">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{`${type} utkast`}</ModalHeader>
      <ModalCloseButton />
      <UtkastModalBody type={type} />
      <UtkastModalFooter type={type} utkast={utkast} onClose={onClose} />
    </ModalContent>
  </Modal>
);

export default UtkastModal;
