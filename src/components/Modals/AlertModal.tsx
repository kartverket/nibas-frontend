import {
  Alert,
  AlertIcon,
  AlertProps,
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@kvib/react";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { centerOnCoordinate, parseStringCoordinates } from "pages/Kart/OverlayPanels/NavigasjonPanel/koordinater-utils";
import { useState } from "react";
import { styled } from "styled-components";

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
  const { closeOverlayModal, closeOverlayPanel } = useOverlayPanel();

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

  const handleCoordinatesClick = (coordinates: string) => {
    const coord = parseStringCoordinates(coordinates);
    closeOverlayModal();
    closeOverlayPanel();
    onClose();

    centerOnCoordinate(coord[0], coord[1]);
  };

  const parseCoordinatesInText = (text: string): React.ReactNode => {
    const regex: RegExp = /(\d+(?:\.\d+)?)N\s*(-?\d+(?:\.\d+)?)Ø/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null = null;

    while ((match = regex.exec(text)) !== null) {
      const currMatch = match[0];
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <a
          key={match.index}
          href="#"
          style={{ color: "var(--kvib-colors-blue-500)", textDecoration: "underline" }}
          onClick={() => handleCoordinatesClick(currMatch)}
        >
          {currMatch}
        </a>,
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
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
          <BodyText>{parseCoordinatesInText(description)}</BodyText>
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
