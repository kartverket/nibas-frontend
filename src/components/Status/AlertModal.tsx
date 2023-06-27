import styled from "styled-components";
import Icon from "../Icon";
import { Status, StatusStyle, statusStyles } from "./common";
import {
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

const StatusIcon = styled(Icon).attrs((props) => ({
  icon: props.icon,
}))<StatusStyle>`
  font-size: 36px;
  color: ${(props) => props.foreground};
`;

const Header = styled(ModalHeader)<StatusStyle>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: ${(props) => props.background};
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  margin-bottom: 12px;
`;

const Body = styled(ModalBody)`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const BodyText = styled.p`
  padding: 0 48px;
  margin: 0;
  color: var(--gray_dark);
  white-space: pre-line;
`;

const BodyTextExtra = styled.p`
  margin: 0;
  padding: 0 48px;
  font-style: italic;
  color: var(--gray_dark);
  white-space: pre-line;
`;

type Action = {
  onClick: () => void;
  text: string;
};

type Props = {
  status: Status;
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
  status,
  title,
  description,
  additionalInfo,
  errorCode,
  isOpen,
  onClose,
  primaryAction,
  secondaryAction,
}: Props) => (
  <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
    <ModalOverlay />
    <ModalContent>
      <Header {...statusStyles[status]}>
        <StatusIcon {...statusStyles[status]} />
        {title}
      </Header>
      <ModalCloseButton aria-label="Lukk" />
      <Body>
        <BodyText>{description}</BodyText>
        {additionalInfo && <BodyTextExtra>{additionalInfo}</BodyTextExtra>}
        {errorCode && <BodyTextExtra>{`Feilkode ${errorCode}`}</BodyTextExtra>}
      </Body>
      {(primaryAction || secondaryAction) && (
        <ModalFooter>
          <ButtonGroup>
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.text}
              </Button>
            )}
            {primaryAction && (
              <Button onClick={primaryAction.onClick}>
                {primaryAction.text}
              </Button>
            )}
          </ButtonGroup>
        </ModalFooter>
      )}
    </ModalContent>
  </Modal>
);

export default AlertModal;
