import { Button, Text } from "@kvib/react";
import { styled } from "styled-components";

type Props = {
  text: string;
  subtext?: string;
  onClick?: () => void;
  buttonText?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
};

const ToolbarPopup = ({
  text,
  subtext,
  buttonText,
  onClick,
  isDisabled,
  isLoading,
}: Props) => {
  return (
    <ToolbarPopupBody>
      <TextRows>
        <Text as="b" fontSize="md">
          {text}
        </Text>
        {subtext && <Text fontSize="sm">{subtext}</Text>}
      </TextRows>
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
  padding: 12px 20px;
  border-radius: 8px;
  background: var(--kvib-colors-chakra-body-bg);
  box-shadow: var(--kvib-shadows-base);
`;

const TextRows = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 50ch;
`;
