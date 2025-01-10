import { styled } from "styled-components";
import {
  Alert,
  AlertIcon,
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  AlertProps,
  ModalHeader,
} from "@kvib/react";
import { useState } from "react";

const AlertHeader = styled(Alert)`
  display: flex;
  align-items: center;
  padding: 24px;
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  margin-bottom: 12px;
  font-size: 20px;
`;

const Title = styled(ModalHeader)`
  padding: 0;
  flex: unset;
`;

const Body = styled(ModalBody)`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const BodyText = styled.p`
  padding: 0 48px;
  margin: 0;
  color: var(--kvib-colors-gray-600);
  white-space: pre-line;
`;

const BodyTextExtra = styled.p`
  margin: 0;
  padding: 0 48px;
  font-style: italic;
  color: var(--kvib-colors-gray-600);
  white-space: pre-line;
`;

type Action = {
  onClick: () => void;
  text: string;
};

type Props = {
  status: AlertProps["status"];
  title: string;
  description: string;
  errorCode?: string;
  additionalInfo?: string;
  isOpen: boolean;
  onClose: () => void;
  primaryAction?: Action;
  secondaryAction?: Action;
};

const AlertModal = ({
  title,
  description,
  additionalInfo = "",
  errorCode = "",
  isOpen,
  onClose,
  primaryAction,
  secondaryAction,
  status,
}: Props) => {
  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [secondaryLoading, setSecondaryLoading] = useState(false);

  const handlePrimaryAction = () => {
    setPrimaryLoading(true);
    primaryAction?.onClick();
    setPrimaryLoading(false);
  };

  const handleSecondaryAction = () => {
    setSecondaryLoading(true);
    secondaryAction?.onClick();
    setSecondaryLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <AlertHeader status={status}>
          <AlertIcon />
          <Title>{title}</Title>
        </AlertHeader>
        <ModalCloseButton aria-label="Lukk" />
        <Body>
          <BodyText>{description}</BodyText>
          {additionalInfo && <BodyTextExtra>{additionalInfo}</BodyTextExtra>}
          {errorCode && (
            <BodyTextExtra>Kontakt Kartverket og oppgi feilkoden {errorCode} dersom feilen vedvarer.</BodyTextExtra>
          )}
        </Body>
        {(primaryAction || secondaryAction) && (
          <ModalFooter>
            <ButtonGroup>
              {secondaryAction && (
                <Button
                  variant="tertiary"
                  onClick={handleSecondaryAction}
                  isLoading={secondaryLoading}
                  isDisabled={primaryAction && primaryLoading}
                >
                  {secondaryAction.text}
                </Button>
              )}
              {primaryAction && (
                <Button
                  onClick={handlePrimaryAction}
                  isLoading={primaryLoading}
                  isDisabled={secondaryAction && secondaryLoading}
                >
                  {primaryAction.text}
                </Button>
              )}
            </ButtonGroup>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AlertModal;
