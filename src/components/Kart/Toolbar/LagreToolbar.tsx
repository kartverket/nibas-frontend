import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useToolbarActions } from "contexts/ToolbarContext";
import { useUtkast } from "contexts/UtkastContext";
import useAlertModal from "hooks/useAlertModal";
import ModeButton from "./ModeButton";
import { Frame } from "./components";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import AlertModal from "components/AlertModal";
import { useState } from "react";
import { EndringsloggModal } from "components/Endringslogg/EndringsloggModal";
import FeatureToggle from "../../FeatureToggle";
import { DividerVertical } from "components/Divider";

const LagreFrame = styled(Frame)`
  justify-content: center;
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

type Props = {
  createUtkastOpen: boolean;
  setCreateUtkastOpen: (createUtkastOpen: boolean) => void;
};

const LagreToolbar = ({ createUtkastOpen, setCreateUtkastOpen }: Props) => {
  const { t } = useTranslation();
  const { canSave } = useToolbarActions();
  const [endringsloggOpen, setEndringsloggOpen] = useState(false);
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
          <FeatureToggle feature="UTKAST_ENDRINGSLOGG">
            <ModeButton
              icon="published_with_changes"
              ariaLabel="Vis endringer"
              onClick={() => setEndringsloggOpen(true)}
            >
              {t("action.VisEndringer")}
            </ModeButton>
          </FeatureToggle>
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
        <>
          <FeatureToggle feature="UTKAST_ENDRINGSLOGG">
            <ModeButton
              icon="published_with_changes"
              ariaLabel="Vis endringer"
              onClick={() => setEndringsloggOpen(true)}
            >
              {t("action.VisEndringer")}
            </ModeButton>
          </FeatureToggle>
          <ModeButton
            icon="save"
            ariaLabel="Lagre utkast"
            onClick={handleSave}
            disabled={!canSave}
            isActive={createUtkastOpen}
          >
            {t("action.Lagre")}
          </ModeButton>
        </>
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
      <FeatureToggle feature="UTKAST_ENDRINGSLOGG">
        <EndringsloggModal
          isOpen={endringsloggOpen}
          onClose={() => setEndringsloggOpen(false)}
        />
      </FeatureToggle>
    </LagreFrame>
  );
};

export default LagreToolbar;
