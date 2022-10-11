import { useTranslation } from "react-i18next";
import { ToolbarWrapper } from "./components";
import Button from "components/form/Button";
import { useToolbarActions } from "contexts/ToolbarContext";
import { useUtkast } from "contexts/UtkastContext";

type Props = {
  openCreateUtkast: () => void;
};

const DefaultToolbar = ({ openCreateUtkast }: Props) => {
  const { t } = useTranslation();
  const { canSave, undo, redo } = useToolbarActions();
  const { utkast, updateUtkastWithHistory } = useUtkast();

  if (!canSave && !undo && !redo) return null;

  return (
    <ToolbarWrapper>
      {utkast && (
        <Button onClick={updateUtkastWithHistory} disabled={!canSave}>
          {t("action.Lagre")}
        </Button>
      )}
      {!utkast && (
        <Button onClick={openCreateUtkast} disabled={!canSave}>
          {t("action.Lagre som")}
        </Button>
      )}
      <Button onClick={undo} disabled={!undo}>
        {t("action.Undo")}
      </Button>
      <Button onClick={redo} disabled={!redo}>
        {t("action.Redo")}
      </Button>
    </ToolbarWrapper>
  );
};

export default DefaultToolbar;
