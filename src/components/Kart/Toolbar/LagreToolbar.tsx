import styled from "styled-components";
import { useUtkast } from "contexts/UtkastContext";
import useAlertModal from "hooks/useAlertModal";
import ModeButton from "./ModeButton";
import { Frame } from "./components";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import AlertModal from "components/AlertModal";
import { useState } from "react";
import { EndringsloggModal } from "components/Endringslogg/EndringsloggModal";
import { useToolbar } from "contexts/ToolbarContext";
import ToolbarTooltip from "./ToolbarTooltip";
import { Divider } from "@kvib/react";

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
  const { canSave } = useToolbar();
  const [endringsloggOpen, setEndringsloggOpen] = useState(false);
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
            <span>Navn på utkast</span>
            <UtkastNavn>{utkast.navn}</UtkastNavn>
          </UtkastInfo>
          <Divider orientation="vertical" />
          <ToolbarTooltip text="Åpne en endringslogg med oppsummering av alle endringer i utkastet.">
            <ModeButton
              icon="published_with_changes"
              ariaLabel="Vis endringer"
              onClick={() => setEndringsloggOpen(true)}
            >
              Endringer
            </ModeButton>
          </ToolbarTooltip>
          <ToolbarTooltip
            text="Lagre endringene til utkastet"
            shortcut="CTRL + S"
          >
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
        </>
      ) : (
        <>
          <ToolbarTooltip text="Åpne en endringslogg med oppsummering av alle endringer i utkastet.">
            <ModeButton
              icon="published_with_changes"
              ariaLabel="Vis endringer"
              onClick={() => setEndringsloggOpen(true)}
            >
              Endringer
            </ModeButton>
          </ToolbarTooltip>
          <ToolbarTooltip text="Opprett et nytt utkast" shortcut="CTRL + S">
            <ModeButton
              icon="save"
              ariaLabel="Lagre utkast"
              onClick={handleSave}
              disabled={!canSave}
              isActive={createUtkastOpen}
            >
              Lagre
            </ModeButton>
          </ToolbarTooltip>
        </>
      )}
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
      <EndringsloggModal
        isOpen={endringsloggOpen}
        onClose={() => setEndringsloggOpen(false)}
      />
    </LagreFrame>
  );
};

export default LagreToolbar;
