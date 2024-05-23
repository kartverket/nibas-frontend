import { Button, Text } from "@kvib/react";
import { styled } from "styled-components";

type Props = {
  text: string;
  subtext?: string;
  onClick?: () => void;
  secondaryOnClick?: () => void;
  secondaryButtonText?: string;
  onClose?: () => void;
  buttonText?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
};

const ToolbarPopup = ({
  text,
  subtext = "",
  buttonText = "",
  onClick,
  onClose,
  secondaryButtonText = "",
  secondaryOnClick,
  isDisabled = false,
  isLoading = false,
}: Props) => {
  return (
    <ToolbarPopupBody>
      <TextRows>
        <Text as="b" fontSize="sm">
          {text}
        </Text>
        {subtext && <Text fontSize="sm">{subtext}</Text>}
      </TextRows>
      {buttonText && (
        <Button size="sm" isDisabled={isDisabled} onClick={onClick} isLoading={isLoading}>
          {buttonText}
        </Button>
      )}
      {secondaryButtonText && secondaryOnClick && (
        <Button size="sm" isDisabled={isDisabled || isLoading} onClick={secondaryOnClick} variant="secondary">
          {secondaryButtonText}
        </Button>
      )}
      {onClose != null && (
        <Button size="sm" variant="tertiary" onClick={onClose}>
          Lukk (Esc)
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
  gap: 16px;
  padding: 12px 20px;
  border-radius: 8px;
  background: var(--kvib-colors-orange-200);
  box-shadow: var(--kvib-shadows-sm);
`;

const TextRows = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 50ch;
`;
