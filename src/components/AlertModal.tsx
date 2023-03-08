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

const Content = styled.div<{ hasBody: boolean }>`
  display: flex;
  align-items: ${(props) => (props.hasBody ? "flex-start" : "center")};
  gap: 24px;
  padding: 24px;
  border: ${border};
  border-top-left-radius: ${borderRadius};
  border-top-right-radius: ${borderRadius};
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
  background: ${(props) => props.background};
`;

const Text = styled.div`
  width: 100%;
`;

const Title = styled.h3<{ hasBody: boolean }>`
  margin: ${(props) => (props.hasBody ? "6px 0 0" : "0")};
`;

const Body = styled.p`
  color: var(--gray_dark);
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 18px;
  background: var(--gray_light);
  border: ${border};
  border-bottom-left-radius: ${borderRadius};
  border-bottom-right-radius: ${borderRadius};
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
      <Content hasBody={body !== undefined}>
        <StatusIcon {...statusStyles[status]} />
        <Text>
          <Title hasBody={body !== undefined}>{title}</Title>
          {body && <Body>{body}</Body>}
        </Text>
        <CloseButton onClick={onClose} />
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
