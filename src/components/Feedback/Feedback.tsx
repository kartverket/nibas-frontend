import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import styled from "styled-components";
import Button from "components/form/Button";

Modal.setAppElement("#root");

const OverlayStyle = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10;
  animation: Fade 0.5s;
  background: #000a;

  @keyframes Fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalStyle = styled.div`
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 320px;
  border: 1px solid ${({ theme }) => theme.colors.blue};
  background: white;

  overflow-y: scroll;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: Enter 0.5s cubic-bezier(0.75, 0, 0.25, 1.5);
  outline: none;

  @keyframes Enter {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

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
};

const Feedback = ({
  type,
  title,
  children,
  isOpen,
  onClose,
  onContinue,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="_"
      overlayClassName="_"
      contentElement={(props, contentChildren) => (
        <ModalStyle {...props}>{contentChildren}</ModalStyle>
      )}
      overlayElement={(props, overlayChildren) => (
        <OverlayStyle {...props}>{overlayChildren}</OverlayStyle>
      )}
    >
      <Header type={type}>{title}</Header>
      <Content>{children}</Content>
      <Buttons>
        {onContinue ? (
          <>
            <Button variant="tertiary" onClick={onClose}>
              {t("action.Avbryt")}
            </Button>
            <Button onClick={onContinue}>{t("action.Fortsett")}</Button>
          </>
        ) : (
          <Button onClick={onClose}>{t("action.Lukk")}</Button>
        )}
      </Buttons>
    </Modal>
  );
};
export default Feedback;
