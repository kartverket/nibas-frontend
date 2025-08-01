import { Badge, useDisclosure } from "@kvib/react";
import { useAuthRenewError } from "components/Authentication/AuthRenewError";
import EndringsloggModal from "components/Endringslogg/EndringsloggModal";
import { useUnsavedEndringer } from "components/Endringslogg/hooks/useUnsavedEndringer";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { useState } from "react";
import { styled } from "styled-components";
import { statusCode } from "utils/api";
import HeaderButton, { HeaderSection } from "./HeaderButton";

const HeaderHistoryOperations = () => {
  const { utkast, updateUtkastWithHistory } = useUtkast();
  const { canSave, undo, redo } = useHistory();
  const { isOpen: isEndringsloggOpen, onClose: onEndringsloggClose, onOpen: onEndringsloggOpen } = useDisclosure();
  const { toggleOverlayPanel } = useOverlayPanel();
  const { setAuthRenewError } = useAuthRenewError();
  const { antallEndringer } = useUnsavedEndringer();
  const [showAvvikBtn, setShowAvvikBtn] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).toggleAvvik = () => setShowAvvikBtn(!showAvvikBtn);
  const handleSave = async () => {
    if (utkast && canSave) {
      const responseCode = await updateUtkastWithHistory();
      if (statusCode.isForbidden(responseCode)) {
        setAuthRenewError(true);
      }
    }
  };
  const handleAvvik = () => {
    toggleOverlayPanel("avvik");
  };

  useKeyboardShortcut("save", handleSave, canSave);
  useKeyboardShortcut("undo", undo, !!undo);
  useKeyboardShortcut("redo", redo, !!redo);

  if (!utkast) {
    return null;
  }

  return (
    <HeaderSection>
      <HeaderButton
        isLabelHidden={true}
        label="Angre"
        icon="undo"
        onClick={undo}
        isDisabled={!undo}
        tooltip={{
          text: "Angre på siste handling",
          shortcut: "undo",
        }}
      />
      <HeaderButton
        isLabelHidden={true}
        label="Gjør om"
        icon="redo"
        onClick={redo}
        isDisabled={!redo}
        tooltip={{
          text: "Gjør om siste handling",
          shortcut: "redo",
        }}
      />
      <HeaderButton
        isLabelHidden={true}
        label="Lagre"
        icon="save"
        onClick={handleSave}
        isDisabled={!canSave}
        tooltip={{
          text: "Lagre endringene til utkastet",
          shortcut: "save",
        }}
      />
      {showAvvikBtn && (
        <HeaderButton
          isLabelHidden={true}
          label="Avvik fra matrikkelen"
          icon="warning"
          onClick={handleAvvik}
          tooltip={{
            text: "Se en liste over alle avvik",
          }}
        />
      )}
      <HeaderButton
        isLabelHidden={true}
        label="Endringslogg"
        icon="published_with_changes"
        onClick={onEndringsloggOpen}
        tooltip={{
          text: "Vis alle endringer i utkastet",
        }}
        alert={antallEndringer > 0 && <AlertIcon count={antallEndringer} />}
      />

      {isEndringsloggOpen && (
        <EndringsloggModal isOpen={isEndringsloggOpen} onClose={onEndringsloggClose} utkast={utkast} />
      )}
    </HeaderSection>
  );
};

const AlertIcon = ({ count }: { count: number }) => {
  return <RoundBadge variant={"solid"}>{count}</RoundBadge>;
};

const RoundBadge = styled(Badge)`
  width: 20px;
  height: 20px;
  line-height: 20px;
  border-radius: 50%;
  background-color: var(--kvib-colors-red-400);
`;

export default HeaderHistoryOperations;
