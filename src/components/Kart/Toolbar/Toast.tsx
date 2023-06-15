import styled, { css, keyframes } from "styled-components";
import Icon from "components/Icon";

type Props = {
  title: string;
  text?: string;
  status: Status;
};

// TODO: erstatt dette med en generell toast eller en annen løsning
const Toast = ({ text, status, title }: Props) => {
  return (
    <Wrapper
      foreground={statusStyles[status].foreground}
      background={statusStyles[status].background}
    >
      <ToastContent hasDescription={text ? true : false}>
        <ToastIcon icon={statusStyles[status].icon} filled />
        <ToastTitle>{title}</ToastTitle>
        {text && <ToastDescription>{text}</ToastDescription>}
      </ToastContent>
    </Wrapper>
  );
};

const topOffset = "125px";

const fadeInFadeOutFromTop = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-10%);
  }
  10% {
    opacity: 1;
    transform: none;
 
  }
  80% {
    opacity: 1;
    transform: none;

  }
  100% {
    opacity: 0;
    transform: none;

  }
`;

type Status = "error" | "warning" | "info" | "success";

type StatusStyle = {
  icon: string;
  foreground: string;
  background: string;
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
  success: {
    icon: "check_circle",
    background: "var(--green_light)",
    foreground: "var(--green_dark)",
  },
};

const ToastContent = styled.div<{ hasDescription: boolean }>`
  ${(props) =>
    props.hasDescription
      ? css`
          grid-template-areas:
            "icon title"
            ". description";
        `
      : css`
          grid-template-areas: "icon title";
        `};

  display: grid;

  flex-direction: column;
  grid-gap: 8px;
`;

const ToastIcon = styled(Icon)`
  grid-area: icon;
`;

const ToastTitle = styled.span`
  line-height: 100%;
  grid-area: title;
  font-size: 1.3rem;
  font-weight: 600;
`;

const ToastDescription = styled.span`
  grid-area: description;
`;

const Wrapper = styled.div<{ foreground: string; background: string }>`
  top: ${topOffset};
  left: 50%;
  transform: translateX(-50%);
  position: fixed;
  z-index: 10;
  display: flex;
  align-items: center;
  background-color: ${({ background }) => background};
  padding: 24px;
  margin-right: 16px;
  font-size: 16px;
  color: ${({ foreground }) => foreground};
  max-width: 600px;
  box-shadow: 0 20px 44px 10px rgba(122, 210, 150, 0.2);
  gap: 12px;
  opacity: 0;
  border: 2px solid ${({ foreground }) => foreground};
  border-radius: 8px;
  animation: ${fadeInFadeOutFromTop} 5s ease-in-out;
`;

export default Toast;
