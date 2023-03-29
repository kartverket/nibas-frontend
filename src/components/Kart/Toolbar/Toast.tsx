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

const fadeInFadeOutFromTop = keyframes`
  0% {
    opacity: 0;
    top: -50px;
  }
  15% {
    opacity: 1;
    top: 9%;
  }
  70% {
    opacity: 1;
    top: 9%;
  }
  100% {
    opacity: 0;
    top: 9%;
  }
`;

const Wrapper = styled.div`
  inset: 0;
  top: 9%;
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
  width: 500px;
  box-shadow: 0 8px 6px -6px var(--gray);
  gap: 12px;
  opacity: 0;
  animation: ${fadeInFadeOutFromTop} 6s ease-in-out;
`;

export default Toast;
