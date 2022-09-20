import styled from "styled-components";
import { KartInteractable } from "../KartInteractable";
import Button from "components/form/Button";
import { useToolbar } from "contexts/ToolbarContext";

const Toolbar = () => {
  const { canSave, save, undo, redo } = useToolbar();

  return (
    <ToolbarArea>
      <ToolbarWrapper>
        <Button onClick={save} disabled={!canSave}>
          Lagre
        </Button>
        <Button onClick={undo} disabled={!undo}>
          Undo
        </Button>
        <Button onClick={redo} disabled={!redo}>
          Redo
        </Button>
      </ToolbarWrapper>
    </ToolbarArea>
  );
};

const ToolbarArea = styled.div`
  grid-area: toolbar;
`;

const ToolbarWrapper = styled(KartInteractable)`
  margin-left: 30px;
  margin-top: 30px;
  padding: 8px;
  border: 2px solid ${({ theme }) => theme.colors.blue};
`;

export default Toolbar;
