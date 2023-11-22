import { Button } from "@kvib/react";
import { styled } from "styled-components";

type Props = {
  text: string;
  onClick?: () => void;
  buttonText?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
};

const ToolbarPopup = ({
  text,
  buttonText,
  onClick,
  isDisabled,
  isLoading,
}: Props) => {
  return (
    <ToolbarPopupBody>
      <span>{text}</span>
      {buttonText && (
        <Button
          size="sm"
          isDisabled={isDisabled}
          onClick={onClick}
          isLoading={isLoading}
        >
          {buttonText}
        </Button>
      )}
    </ToolbarPopupBody>
  );
};

export default ToolbarPopup;

const ToolbarPopupBody = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  font-size: 1.1rem;
  font-weight: var(--kvib-fontWeights-semibold);
  padding: 12px 20px;
  border-radius: 8px;
  background: var(--kvib-colors-chakra-body-bg);
  box-shadow: var(--kvib-shadows-base);
`;
