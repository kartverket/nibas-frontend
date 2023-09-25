import { Button } from "@kvib/react";
import { styled } from "styled-components";

type PopupProps = {
  text: string;
  buttonText: string;
  onClick: () => void;
  isDisabled?: boolean;
};

type Props = PopupProps;

const ToolbarPopup = ({ text, buttonText, onClick, isDisabled }: Props) => {
  return (
    <ToolbarPopupBody>
      <ToolbarPopupText>{text}</ToolbarPopupText>
      <Button size="sm" isDisabled={isDisabled} onClick={() => onClick()}>
        {buttonText}
      </Button>
    </ToolbarPopupBody>
  );
};

export default ToolbarPopup;

const ToolbarPopupBody = styled.div`
  display: flex;
  justify-content: space-between;
  width: 450px;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: var(--kvib-colors-chakra-body-bg);
  box-shadow: var(--kvib-shadows-base);
  border: 2px solid transparent;
  transition: border-color 0.1s;
  cursor: pointer;
  font-size: 16px;
`;

const ToolbarPopupText = styled.div`
  font-size: 18px;
`;
