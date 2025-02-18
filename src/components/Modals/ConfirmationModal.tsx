import {
  Button,
  Modal,
  ModalBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogBackdrop,
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
    <Modal isOpen onClose={onDecline}>
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader>{title}</DialogHeader>
        <DialogCloseTrigger />
        <ModalBody>{description}</ModalBody>
        <ModalFooterWithSpacing>
          <Button variant="ghost" onClick={onDecline}>
            {declineText ?? "Nei"}
          </Button>
          <Button onClick={onAccept}>{acceptText ?? "Ja"}</Button>
        </ModalFooterWithSpacing>
      </DialogContent>
    </Modal>
  );
};

const ModalFooterWithSpacing = styled(DialogFooter)`
  gap: 8px;
`;

export default ConfirmationModal;
