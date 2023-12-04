import { useToolbar } from "contexts/ToolbarContext";
import HeaderButton from "./HeaderButton";
import { styled } from "styled-components";
import { useUtkast } from "contexts/UtkastContext";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";
import { useDisclosure } from "@kvib/react";
import EndringsloggModal from "components/Endringslogg/EndringsloggModal";

const HeaderHistoryOperations = () => {
  const { utkast, updateUtkastWithHistory } = useUtkast();
  const { canSave, undo, redo } = useToolbar();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const handleSave = () => {
    if (utkast && canSave) {
      updateUtkastWithHistory();
    }
  };

  useKeyboardShortcut("save", handleSave, canSave);
  useKeyboardShortcut("undo", undo, !!undo);
  useKeyboardShortcut("redo", redo, !!redo);

  if (!utkast) return null;

  return (
    <Section>
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
        onClick={onOpen}
        tooltip={{
          text: "Se en liste over alle endringer som er gjort i dette utkastet",
        }}
      />
      <EndringsloggModal isOpen={isOpen} onClose={onClose} utkast={utkast} />
    </Section>
  );
};

const Section = styled.section`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export default HeaderHistoryOperations;
