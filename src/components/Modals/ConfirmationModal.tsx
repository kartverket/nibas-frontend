import {
  Button,
  Dialog,
  DialogBody,
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
    <Dialog open={true} onOpenChange={onDecline}>
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader>{title}</DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>{description}</DialogBody>
        <ModalFooterWithSpacing>
          <Button variant="ghost" onClick={onDecline}>
            {declineText ?? "Nei"}
          </Button>
          <Button onClick={onAccept}>{acceptText ?? "Ja"}</Button>
        </ModalFooterWithSpacing>
      </DialogContent>
    </Dialog>
  );
};

const ModalFooterWithSpacing = styled(DialogFooter)`
  gap: 8px;
`;

export default ConfirmationModal;
