import Button from "components/form/Button";
import { useToolbar } from "contexts/ToolbarContext";
import { useUtkast } from "contexts/UtkastContext";

type Props = {
  openCreateUtkast: () => void;
};

const DefaultToolbar = ({ openCreateUtkast }: Props) => {
  const { canSave, save, undo, redo } = useToolbar();
  const { utkast } = useUtkast();

  return (
    <div>
      {utkast && (
        <Button onClick={save} disabled={!canSave}>
          Lagre
        </Button>
      )}
      {!utkast && (
        <Button onClick={openCreateUtkast} disabled={!canSave}>
          Lagre som
        </Button>
      )}
      <Button onClick={undo} disabled={!undo}>
        Undo
      </Button>
      <Button onClick={redo} disabled={!redo}>
        Redo
      </Button>
    </div>
  );
};

export default DefaultToolbar;
