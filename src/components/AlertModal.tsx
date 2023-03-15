import styled from "styled-components";
import Button from "./form/Button";
import CloseButton from "./form/Button/CloseButton";
import Icon from "./Icon";
import { Modal, ModalContent } from "./Modal";

const borderRadius = "12px";
const border = "2px solid var(--gray_light)";

const ModalElement = styled(ModalContent)`
  width: 635px;
  background: var(--white);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: ${borderRadius};
`;

const Header = styled.div<StatusStyle>`
  display: flex;
  align-items: center;
  background: ${(props) => props.background};
  padding: 16px 12px;
  border: ${border};
  border-top-left-radius: ${borderRadius};
  border-top-right-radius: ${borderRadius};
  border-bottom: none;
`;

const Content = styled.div<{ hasBody: boolean }>`
  padding: 24px;
`;

type StatusStyle = {
  icon: string;
  foreground: string;
  background: string;
};

const StatusIcon = styled(Icon).attrs((props) => ({
  icon: props.icon,
}))<StatusStyle>`
  font-size: 36px;
  border-radius: 50%;
  padding: 6px;
  color: ${(props) => props.foreground};
`;

const Body = styled.p`
  color: var(--gray_dark);
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px;
  border: ${border};
  border-bottom-left-radius: ${borderRadius};
  border-bottom-right-radius: ${borderRadius};
  border-top: none;
`;

const Close = styled(CloseButton)`
  margin-left: auto;
`;

type Status = "error" | "warning" | "info";

type Action = {
  onClick: () => void;
  text: string;
};

type Props = {
  status: Status;
  title: string;
  body?: string;
  isOpen: boolean;
  onClose: () => void;
  primaryAction?: Action;
  secondaryAction?: Action;
};

const statusStyles: Record<Status, StatusStyle> = {
  error: {
    icon: "dangerous",
    background: "var(--pink)",
    foreground: "var(--red_error_message)",
  },
  warning: {
    icon: "emergency_home",
    background: "var(--yellow_light)",
    foreground: "var(--yellow_darker)",
  },
  info: {
    icon: "help",
    background: "var(--blue_light)",
    foreground: "var(--blue_dark)",
  },
};

const AlertModal = ({
  status,
  title,
  body,
  isOpen,
  onClose,
  primaryAction,
  secondaryAction,
}: Props) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} modalElement={ModalElement}>
      <Header {...statusStyles[status]}>
        <StatusIcon {...statusStyles[status]} />
        <h3>{title}</h3>
        <Close onClick={onClose} />
      </Header>
      <Content hasBody={body !== undefined}>
        {body && <Body>{body}</Body>}
      </Content>
      {(primaryAction || secondaryAction) && (
        <Buttons>
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.text}
            </Button>
          )}
          {primaryAction && (
            <Button variant="primary" onClick={primaryAction.onClick}>
              {primaryAction.text}
            </Button>
          )}
        </Buttons>
      )}
    </Modal>
  );
};

export default AlertModal;
