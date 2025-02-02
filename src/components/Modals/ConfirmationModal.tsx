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
import { styled } from "styled-components";

const ConfirmationModal = ({
  title,
  description,
  acceptText,
  onAccept,
  declineText,
  onDecline,
}: ConfirmationModalProps) => {
  return (
    <Modal isOpen onClose={onDecline} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{description}</ModalBody>
        <ModalFooterWithSpacing>
          <Button variant="ghost" onClick={onDecline}>
            {declineText ?? "Nei"}
          </Button>
          <Button onClick={onAccept}>{acceptText ?? "Ja"}</Button>
        </ModalFooterWithSpacing>
      </ModalContent>
    </Modal>
  );
};

const ModalFooterWithSpacing = styled(ModalFooter)`
  gap: 8px;
`;

export default ConfirmationModal;
