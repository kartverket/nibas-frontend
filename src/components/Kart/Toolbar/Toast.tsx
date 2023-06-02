import styled, { keyframes } from "styled-components";
import Icon from "components/Icon";
import Heading from "components/typography/Heading";

type Props = {
  title: string;
  text: string;
  status: Status;
};

// TODO: erstatt dette med en generell toast eller en annen løsning
const Toast = ({ text, status, title }: Props) => {
  return (
    <Wrapper>
      <ToastContent>
        <ToastIcon icon={statusStyles[status].icon} filled />
        <ToastTitle>{title}</ToastTitle>
        <ToastDescription>{text}</ToastDescription>
      </ToastContent>
    </Wrapper>
  );
};

const topOffset = "125px";

const fadeInFadeOutFromTop = keyframes`
  0% {
    opacity: 1;
    top: ${topOffset};
  }
  15% {
    opacity: 1;
    top: ${topOffset};
  }
  70% {
    opacity: 1;
    top: ${topOffset};
  }
  100% {
    opacity: 1;
    top: ${topOffset};
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

const ToastContent = styled.div`
  display: grid;
  grid-template-areas:
    " icon title "
    ". description ";
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
//her må jeg ta inn det som er fra status
//nå er det bare lagt inn det som er for grønn/success
const Wrapper = styled.div`
  top: ${topOffset};
  left: 50%;
  transform: translateX(-50%);
  position: fixed;
  z-index: 10;
  display: flex;
  align-items: center;
  background-color: var(--green_light);
  padding: 24px;
  margin-right: 16px;
  font-size: 16px;
  color: var(--green_dark);
  max-width: 600px;
  box-shadow: 0 20px 44px 10px rgba(122, 210, 150, 0.2);
  gap: 12px;
  opacity: 0;
  animation: ${fadeInFadeOutFromTop} 50000s ease-in-out;
  border: 2px solid var(--green_dark);
  border-radius: 8px;
`;

export default Toast;
