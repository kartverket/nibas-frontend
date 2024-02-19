import { Portal } from "@kvib/react";
import { createPortal } from "react-dom";
import styled from "styled-components";

const ModalPortal = (props: React.PropsWithChildren) => {
  return createPortal(<ModalContainer id="modal-portal">{props.children}</ModalContainer>, document.body);
};

export default ModalPortal;

const ModalContainer = styled.div`
  position: absolute;
  z-index: 1000000000000;
  top: 0;
  left: 0;
  right: 0;
`;
