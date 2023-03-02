import styled from "styled-components";
import Button from "./form/Button";
import CloseButton from "./form/Button/CloseButton";
import Icon from "./Icon";

const borderRadius = "12px";
const border = "2px solid var(--gray_light)";

const Container = styled.div`
  background: var(--white);
  width: 635px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: ${borderRadius};
`;

const Content = styled.div`
  display: flex;
  align-items: flex-start;
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

const Title = styled.h3`
  margin: 0;
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

type Status = "error" | "warning" | "info" | "success";

type Action = {
  onClick: () => void;
  text: string;
};

type Props = {
  status: Status;
  title: string;
  body?: string;
  onClose: () => void;
  primaryAction?: Action;
  secondaryAction?: Action;
};

// TODO: fix
const statusStyles: Record<Status, StatusStyle> = {
  error: {
    icon: "dangerous",
    background: "var(--pink)",
    foreground: "var(--red_error_message)",
  },
  warning: {
    icon: "emergency_home",
    background: "var(--yellow_light)",
    foreground: "var(--yellow_dark)",
  },
  info: {
    icon: "help",
    background: "var(--blue_light)",
    foreground: "var(--blue_dark)",
  },
  success: {
    icon: "check_box",
    background: "var(--green_light)",
    foreground: "var(--green_dark)",
  },
};

const Alert = ({
  status,
  title,
  body,
  onClose,
  primaryAction,
  secondaryAction,
}: Props) => {
  return (
    <Container>
      <Content>
        <StatusIcon {...statusStyles[status]} />
        <div>
          <Title>{title}</Title>
          {body && <Body>{body}</Body>}
        </div>
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
    </Container>
  );
};

export default Alert;
