import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useToolbarActions } from "contexts/ToolbarContext";
import { useUtkast } from "contexts/UtkastContext";
import useAlertModal from "hooks/useAlertModal";
import ModeButton from "./ModeButton";
import { Frame } from "./components";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import AlertModal from "components/AlertModal";

const LagreFrame = styled(Frame)`
  flex-direction: row;
  justify-content: center;
  width: 100%;
`;

const UtkastInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  color: var(--gray);
  font-size: 12px;
`;

const UtkastNavn = styled.h4`
  margin: 0;
  color: var(--black);
  font-size: 14px;
  font-weight: normal;
`;

const DividerVertical = styled.hr`
  width: 1px;
  height: 50px;
  border: 1px solid var(--gray_light);
  margin: 0 4px;
`;

type Props = {
  createUtkastOpen: boolean;
  setCreateUtkastOpen: (createUtkastOpen: boolean) => void;
};

const LagreToolbar = ({ createUtkastOpen, setCreateUtkastOpen }: Props) => {
  const { t } = useTranslation();
  const { canSave } = useToolbarActions();
  const { utkast, updateUtkastWithHistory, closeUtkast } = useUtkast();
  const { modalIsOpen, openModal, closeModal, modalTitle, modalBody } =
    useAlertModal(
      t("utkast.ulagrede-endringer"),
      t("utkast.ulagrede-endringer-utdypende")
    );

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    if (utkast) {
      updateUtkastWithHistory();
    } else {
      setCreateUtkastOpen(!createUtkastOpen);
    }
  };

  useKeyboardShortcut("close", closeUtkast);
  useKeyboardShortcut("save", handleSave);

  return (
    <LagreFrame>
      {utkast ? (
        <>
          <UtkastInfo>
            <span>{t("utkast.Navn på utkast")}</span>
            <UtkastNavn>{utkast.navn}</UtkastNavn>
          </UtkastInfo>
          <DividerVertical />
          <ModeButton
            icon="save"
            ariaLabel="Lagre utkast"
            onClick={handleSave}
            disabled={!canSave}
          >
            {t("action.Lagre")}
          </ModeButton>
          <ModeButton
            icon="close"
            ariaLabel="Lukk utkast"
            onClick={canSave ? openModal : closeUtkast}
          >
            {t("action.Lukk")}
          </ModeButton>
        </>
      ) : (
        <ModeButton
          icon="save"
          ariaLabel="Lagre utkast"
          onClick={handleSave}
          disabled={!canSave}
          isActive={createUtkastOpen}
        >
          {t("action.Lagre")}
        </ModeButton>
      )}
      <AlertModal
        status="warning"
        title={modalTitle}
        body={modalBody}
        isOpen={modalIsOpen}
        onClose={closeModal}
        secondaryAction={{
          text: t("Forkast endringer"),
          onClick: closeUtkast,
        }}
        primaryAction={{
          text: t("Fortsett redigering"),
          onClick: closeModal,
        }}
      />
    </LagreFrame>
  );
};

export default LagreToolbar;
