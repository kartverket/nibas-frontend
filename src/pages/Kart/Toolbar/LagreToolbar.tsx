import styled from "styled-components";
import { useUtkast } from "contexts/UtkastContext";
import useAlertModal from "hooks/useAlertModal";
import ModeButton from "./ModeButton";
import { Frame } from "./components";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import AlertModal from "components/AlertModal";
import { useToolbar } from "contexts/ToolbarContext";
import ToolbarTooltip from "./ToolbarTooltip";
import { Divider } from "@kvib/react";

const LagreFrame = styled(Frame)`
  justify-content: center;
`;

const LagreToolbar = () => {
  const { canSave } = useToolbar();
  const { utkast, updateUtkastWithHistory, closeUtkast } = useUtkast();
  const { modalIsOpen, openModal, closeModal, modalTitle, modalBody } =
    useAlertModal(
      "Du har endringer i utkastet som ikke er lagret",
      "Er du sikker på at du vil gå ut av utkastet? Dersom du lukker utkastet nå mister du alle ulagrede endringer."
    );

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    if (utkast) {
      updateUtkastWithHistory();
    } else {
      // TODO: håndter dette bedre med ny utkastflyt
    }
  };

  useKeyboardShortcut("close", closeUtkast);
  useKeyboardShortcut("save", handleSave);

  return (
    <LagreFrame>
      <ToolbarTooltip text="Lagre endringene til utkastet" shortcut="CTRL + S">
        <ModeButton
          icon="save"
          ariaLabel="Lagre utkast"
          onClick={handleSave}
          disabled={!canSave}
        >
          Lagre
        </ModeButton>
      </ToolbarTooltip>
      <ToolbarTooltip
        text="Avslutt redigering av utkastet."
        shortcut="CTRL + L"
      >
        <ModeButton
          icon="close"
          ariaLabel="Lukk utkast"
          onClick={canSave ? openModal : closeUtkast}
        >
          Lukk
        </ModeButton>
      </ToolbarTooltip>

      <AlertModal
        status="warning"
        title={modalTitle}
        description={modalBody}
        isOpen={modalIsOpen}
        onClose={closeModal}
        secondaryAction={{
          text: "Forkast endringer",
          onClick: closeUtkast,
        }}
        primaryAction={{
          text: "Fortsett redigering",
          onClick: closeModal,
        }}
      />
    </LagreFrame>
  );
};

export default LagreToolbar;
