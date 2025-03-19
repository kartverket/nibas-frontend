import { Badge, useDisclosure } from "@kvib/react";
import { useAuthRenewError } from "components/Authentication/AuthRenewError";
import EndringsloggModal from "components/Endringslogg/EndringsloggModal";
import { useUnsavedEndringer } from "components/Endringslogg/hooks/useUnsavedEndringer";
import UtkastSlettModal from "components/Modals/UtkastSlettModal";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { styled } from "styled-components";
import { statusCode } from "utils/api";
import HeaderButton, { HeaderSection } from "./HeaderButton";

const HeaderHistoryOperations = () => {
  const { utkast, updateUtkastWithHistory } = useUtkast();
  const { canSave, undo, redo } = useHistory();
  const { isOpen: isEndringsloggOpen, onClose: onEndringsloggClose, onOpen: onEndringsloggOpen } = useDisclosure();
  const { isOpen: isSlettOpen, onClose: onSlettClose, onOpen: onSlettOpen } = useDisclosure();
  const { setAuthRenewError } = useAuthRenewError();
  const { antallEndringer } = useUnsavedEndringer();

  const handleSave = async () => {
    if (utkast && canSave) {
      const responseCode = await updateUtkastWithHistory();
      if (statusCode.isForbidden(responseCode)) {
        setAuthRenewError(true);
      }
    }
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
        label="Lagre"
        icon="save"
        onClick={handleSave}
        isDisabled={!canSave}
        tooltip={{
          text: "Lagre endringene til utkastet",
          shortcut: "save",
        }}
      />
      <HeaderButton
        label="Endringslogg"
        icon="published_with_changes"
        onClick={onEndringsloggOpen}
        tooltip={{
          text: "Se en liste over alle lagrede og ulagrede endringer som er gjort i dette utkastet",
        }}
        alert={antallEndringer > 0 && <AlertIcon count={antallEndringer} />}
      />
      <HeaderButton
        label="Slett utkast"
        icon="delete"
        onClick={onSlettOpen}
        tooltip={{
          text: "Slett utkastet og endringene som er gjort",
        }}
      />
      <EndringsloggModal isOpen={isEndringsloggOpen} onClose={onEndringsloggClose} utkast={utkast} />
      <UtkastSlettModal isOpen={isSlettOpen} onClose={onSlettClose} utkast={utkast} />
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
