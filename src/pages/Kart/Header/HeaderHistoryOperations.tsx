import { useToolbar } from "contexts/ToolbarContext";
import HeaderButton from "./HeaderButton";
import styled from "styled-components";
import { useUtkast } from "contexts/UtkastContext";
import { useKeyboardShortcut } from "hooks/keyboard-shortcuts/keyboard-shortcuts-hook";

const HeaderHistoryOperations = () => {
  const { utkast, updateUtkastWithHistory } = useUtkast();
  const { canSave } = useToolbar();

  const handleSave = () => {
    if (utkast && canSave) {
      updateUtkastWithHistory();
    }
  };

  useKeyboardShortcut("save", handleSave);

  if (!utkast) return null;

  return (
    <Section>
      <HeaderButton
        label="Angre"
        icon="undo"
        onClick={() => console.log("TODO")}
      />
      <HeaderButton
        label="Gjør om"
        icon="redo"
        onClick={() => console.log("TODO")}
      />
      <HeaderButton
        label="Lagre"
        icon="save"
        onClick={handleSave}
        isDisabled={!canSave}
      />
      <HeaderButton
        label="Endringslogg"
        icon="published_with_changes"
        onClick={() => console.log("TODO")}
      />
    </Section>
  );
};

const Section = styled.section`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export default HeaderHistoryOperations;
