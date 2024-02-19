import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Portal,
} from "@kvib/react";

type ConfirmationModalProps = {
  title: string;
  description: string;
  isOpen: boolean;
  onAccept: (value: boolean) => void;
  onDeny: (value: boolean) => void;
};

const ConfirmationModal = ({ title, description, isOpen, onAccept, onDeny }: ConfirmationModalProps) => {
  return (
    <Portal>
      <Modal isOpen={isOpen} onClose={() => onDeny(true)}>
        <ModalOverlay></ModalOverlay>
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalBody>{description}</ModalBody>
          <ModalFooter>
            <Button onClick={() => onAccept(true)}>Ja</Button>
          </ModalFooter>
          <ModalCloseButton>Nei</ModalCloseButton>
        </ModalContent>
      </Modal>
    </Portal>
  );
};

export default ConfirmationModal;
