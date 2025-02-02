import { Button, Text, Icon, MaterialSymbol } from "@kvib/react";
import { styled } from "styled-components";

type Props = {
  text: string;
  subtext?: string;
  icon: MaterialSymbol;
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
  icon,
  secondaryButtonText = "",
  secondaryOnClick,
  isDisabled = false,
  isLoading = false,
}: Props) => {
  return (
    <ToolbarPopupBody>
      <Icon icon={icon} color="var(--kvib-colors-blue-500" />
      <TextRows style={{ marginLeft: "8px", marginRight: onClose != null ? "28px" : "0" }}>
        <Text as="b" fontSize="sm">
          {text}
        </Text>
        {subtext && <Text fontSize="sm">{subtext}</Text>}
      </TextRows>
      {buttonText && (
        <Button size="sm" variant="tertiary" isDisabled={isDisabled} onClick={onClick} isLoading={isLoading}>
          {buttonText}
        </Button>
      )}
      {secondaryButtonText && secondaryOnClick && (
        <Button size="sm" isDisabled={isDisabled || isLoading} onClick={secondaryOnClick} variant="tertiary">
          {secondaryButtonText}
        </Button>
      )}
      {onClose != null && (
        <Button size="sm" variant="tertiary" onClick={onClose}>
          Avslutt
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
  gap: 2px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--kvib-colors-blue-50);
  border: 2px solid var(--kvib-colors-blue-500);
  box-shadow: var(--kvib-shadows-sm);
`;

const TextRows = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 50ch;
`;
