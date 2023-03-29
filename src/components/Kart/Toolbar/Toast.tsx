import styled, { keyframes } from "styled-components";
import Icon from "components/Icon";

type Props = {
  text: string;
};

// TODO: erstatt dette med en generell toast eller en annen løsning
const Toast = ({ text }: Props) => {
  return (
    <Wrapper>
      <Icon icon="check" />
      <span>{text}</span>
    </Wrapper>
  );
};

const topOffset = "125px";

const fadeInFadeOutFromTop = keyframes`
  0% {
    opacity: 0;
    top: -${topOffset};
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
    opacity: 0;
    top: ${topOffset};
  }
`;

const Wrapper = styled.div`
  top: ${topOffset};
  height: 65px;
  left: 50%;
  transform: translateX(-50%);
  position: fixed;
  z-index: 10;
  display: flex;
  align-items: center;
  background-color: var(--green);
  padding: 16px;
  margin-right: 16px;
  font-size: 16px;
  color: var(--white);
  max-width: 600px;
  box-shadow: 0 8px 6px -6px var(--gray);
  gap: 12px;
  opacity: 0;
  animation: ${fadeInFadeOutFromTop} 6s ease-in-out;
`;

export default Toast;
