import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { ToolbarWrapper } from "./components";
import Button from "components/form/Button";
import { useToolbar, useToolbarActions } from "contexts/ToolbarContext";
import { useUtkast } from "contexts/UtkastContext";
import Feedback from "components/Feedback/Feedback";
import useFeedback from "hooks/useFeedback";

type Props = {
  openCreateUtkast: () => void;
};

const DefaultToolbar = ({ openCreateUtkast }: Props) => {
  const { t } = useTranslation();
  const { canSave, undo, redo } = useToolbarActions();
  const { history } = useToolbar();
  const { utkast, updateUtkastWithHistory, closeUtkast } = useUtkast();
  const { openFeedback, isOpen, closeFeedback, feedbackContent } = useFeedback(
    t(
      "Utkastet ditt har endringer som ikke er lagret. Dersom du lukker utkastet nå, vil disse endringene forkastes. Er du sikker på at du vil fortsette?"
    )
  );

  if (!canSave && !undo && !redo) return null;

  return (
    <div>
      <ToolbarWrapperWithName>
        {utkast && (
          <p>
            {t("Redigerer")}: <strong>{utkast.navn}</strong>
          </p>
        )}
        <Buttons>
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
          {utkast && (
            <CloseUtkastButton
              variant="unstyled"
              onClick={
                history.entries.length > 0 && history.index > 0
                  ? openFeedback
                  : closeUtkast
              }
            >
              {t("action.Lukk Utkast")}
            </CloseUtkastButton>
          )}
        </Buttons>
      </ToolbarWrapperWithName>
      <Feedback
        type="warning"
        title="Advarsel"
        isOpen={isOpen}
        onClose={closeFeedback}
        onContinue={closeUtkast}
        closeText={t("Fortsett redigering")}
        continueText={t("Forkast endringer")}
      >
        {feedbackContent}
      </Feedback>
    </div>
  );
};

const ToolbarWrapperWithName = styled(ToolbarWrapper)`
  display: block;

  p {
    margin-top: 0;
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CloseUtkastButton = styled(Button)`
  padding: 0 16px;
  > span {
    color: ${({ theme }) => theme.colors.blue};
    font-weight: bold;
    text-decoration: underline;
  }
`;

export default DefaultToolbar;
