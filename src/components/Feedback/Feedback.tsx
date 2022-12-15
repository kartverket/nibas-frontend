import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Button from "components/form/Button";
import Modal, {
  CustomModalWrapper,
  ModalOverlay,
} from "components/Modal/Modal";

const Header = styled.div<{ type: StatusType }>`
  padding: 16px;
  text-align: center;
  color: ${(props) => props.type && StatusColors[props.type].color};
  background: ${(props) => props.type && StatusColors[props.type].background};
`;

const Content = styled.div`
  padding: 24px;
`;

const Buttons = styled.div`
  display: flex;
  align-self: flex-end;
  margin: 16px;
  gap: 16px;

  > button {
    height: 100%;
  }
`;

type StatusType = "positive" | "negative" | "warning" | "info";

const StatusColors: Record<StatusType, { background: string; color: string }> =
  {
    positive: { background: "var(--green)", color: "white" },
    negative: { background: "var(--red_dark)", color: "white" },
    warning: { background: "var(--yellow)", color: "black" },
    info: { background: "var(--blue_hover)", color: "white" },
  };

type Props = {
  type: StatusType;
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  closeText?: string;
  continueText?: string;
};

const Feedback = ({
  type,
  title,
  children,
  isOpen,
  onClose,
  onContinue,
  closeText,
  continueText,
}: Props) => {
  const { t } = useTranslation();

  const closeAndContinue = () => {
    onClose();
    onContinue?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="_"
      overlayClassName="_"
      contentElement={(props, contentChildren) => (
        <CustomModalWrapper {...props}>{contentChildren}</CustomModalWrapper>
      )}
      overlayElement={(props, overlayChildren) => (
        <ModalOverlay {...props}>{overlayChildren}</ModalOverlay>
      )}
    >
      <Header type={type}>{title}</Header>
      <Content>{children}</Content>
      <Buttons>
        {onContinue ? (
          <>
            <Button variant="tertiary" onClick={onClose}>
              {closeText ? closeText : t("action.Avbryt")}
            </Button>
            <Button onClick={closeAndContinue}>
              {continueText ? continueText : t("action.Fortsett")}
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>
            {closeText ? closeText : t("action.Lukk")}
          </Button>
        )}
      </Buttons>
    </Modal>
  );
};
export default Feedback;
