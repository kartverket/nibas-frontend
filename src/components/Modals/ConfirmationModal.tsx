import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@kvib/react";
import { ConfirmationModalProps } from "contexts/ConfirmationModalContext";

const ConfirmationModal = ({ title, description, isOpen, onAccept, onDeny }: ConfirmationModalProps) => {
  const { onClose } = useDisclosure();
  return (
    <Modal isOpen={isOpen} onClose={onDeny ? onDeny : onClose}>
      <ModalOverlay></ModalOverlay>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>{description}</ModalBody>
        <ModalFooter>
          <Button onClick={onAccept}>Ja</Button>
        </ModalFooter>
        <ModalCloseButton>Nei</ModalCloseButton>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
