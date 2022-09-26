import { useTranslation } from "react-i18next";
import Button from "components/form/Button";
import { useToolbar } from "contexts/ToolbarContext";
import { useUtkast, useUpdateUtkast } from "contexts/UtkastContext";

type Props = {
  openCreateUtkast: () => void;
};

const DefaultToolbar = ({ openCreateUtkast }: Props) => {
  const { t } = useTranslation();
  const { canSave, undo, redo, history } = useToolbar();
  const { utkast } = useUtkast();

  const updateUtkast = useUpdateUtkast(history, utkast);

  return (
    <div>
      {utkast && (
        <Button onClick={updateUtkast} disabled={!canSave}>
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
    </div>
  );
};

export default DefaultToolbar;
