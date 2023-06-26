import styled from "styled-components";
import CloseButton from "../CloseButton";
import Icon from "../Icon";
import { Modal, ModalContent } from "../Modal";
import { Status, StatusStyle, statusStyles } from "./common";
import { Button } from "@kvib/react";

const borderRadius = "12px";
const border = "2px solid var(--gray_light)";

const ModalElement = styled(ModalContent)`
  width: 635px;
  background: var(--white);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: ${borderRadius};
`;

const StatusIcon = styled(Icon).attrs((props) => ({
  icon: props.icon,
}))<StatusStyle>`
  font-size: 36px;
  color: ${(props) => props.foreground};
`;

const Header = styled.div<StatusStyle>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: ${(props) => props.background};

  border: ${border};
  border-top-left-radius: ${borderRadius};
  border-top-right-radius: ${borderRadius};
  border-bottom: none;
`;

const Close = styled(CloseButton)`
  margin-left: auto;

  > span {
    color: var(--black);

    &:hover {
      background-color: var(--gray_light);
    }
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;

  border: ${border};
  border-bottom-left-radius: ${borderRadius};
  border-bottom-right-radius: ${borderRadius};
  border-top: none;
`;

const Title = styled.h3`
  margin: 0;
`;

const BodyText = styled.p`
  padding: 0 48px;
  margin: 0;
  color: var(--gray_dark);
  white-space: pre-line;
`;

const BodyTextExtra = styled.p`
  margin: 0;
  padding: 0 48px;
  font-style: italic;
  color: var(--gray_dark);
  white-space: pre-line;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

type Action = {
  onClick: () => void;
  text: string;
};

type Props = {
  status: Status;
  title: string;
  description: string;
  errorCode?: string;
  additionalInfo?: string;
  isOpen: boolean;
  onClose: () => void;
  primaryAction?: Action;
  secondaryAction?: Action;
};

const AlertModal = ({
  status,
  title,
  description,
  additionalInfo,
  errorCode,
  isOpen,
  onClose,
  primaryAction,
  secondaryAction,
}: Props) => (
  <Modal isOpen={isOpen} onRequestClose={onClose} modalElement={ModalElement}>
    <Header {...statusStyles[status]}>
      <StatusIcon {...statusStyles[status]} />
      <Title>{title}</Title>
      <Close onClick={onClose} aria-label="Lukk" />
    </Header>
    <Content>
      <BodyText>{description}</BodyText>
      {additionalInfo && <BodyTextExtra>{additionalInfo}</BodyTextExtra>}
      {errorCode && <BodyTextExtra>{`Feilkode ${errorCode}`}</BodyTextExtra>}
      {(primaryAction || secondaryAction) && (
        <Buttons>
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.text}
            </Button>
          )}
          {primaryAction && (
            <Button onClick={primaryAction.onClick}>
              {primaryAction.text}
            </Button>
          )}
        </Buttons>
      )}
    </Content>
  </Modal>
);

export default AlertModal;
