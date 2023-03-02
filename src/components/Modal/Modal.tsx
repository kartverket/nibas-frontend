import { FC, ReactNode } from "react";
import ReactModal, { Props as ModalProps } from "react-modal";
import styled from "styled-components";

if (process.env.NODE_ENV === "test") {
  // In tests we set it as en empty array to not get loads of warnings
  // about forgetting to set app-element for the modal
  ReactModal.setAppElement([] as never);
} else {
  ReactModal.setAppElement("#root");
}

type Props = ModalProps & {
  children: ReactNode;
  modalElement: FC;
};

const Modal = ({ children, modalElement, ...props }: Props) => {
  const ModalElement = modalElement;

  return (
    <ReactModal
      className="_"
      overlayClassName="_"
      contentElement={(contentProps, contentChildren) => (
        <ModalElement {...contentProps}>{contentChildren}</ModalElement>
      )}
      overlayElement={(overlayProps, overlayChildren) => (
        <ModalOverlay {...overlayProps}>{overlayChildren}</ModalOverlay>
      )}
      {...props}
    >
      {children}
    </ReactModal>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10;
  animation: Fade 0.5s;
  background: #000a;

  @keyframes Fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const ModalContent = styled.div`
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: Enter 0.5s cubic-bezier(0.75, 0, 0.25, 1.5);
  outline: none;

  @keyframes Enter {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.5);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

export default Modal;
