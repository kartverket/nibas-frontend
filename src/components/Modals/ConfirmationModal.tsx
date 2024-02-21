import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@kvib/react";
import { ConfirmationModalProps } from "contexts/ConfirmationModalContext";

const ConfirmationModal = ({
  title,
  description,
  acceptText,
  onAccept,
  declineText,
  onDecline: onDeny,
}: ConfirmationModalProps) => {
  return (
    <Modal isOpen={true} onClose={onDeny}>
      <ModalOverlay></ModalOverlay>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{description}</ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onDeny}>
            {declineText ?? "Nei"}
          </Button>
          <Button onClick={onAccept}>{acceptText ?? "Ja"}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
