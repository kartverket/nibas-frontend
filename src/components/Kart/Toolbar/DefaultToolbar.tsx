import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { ToolbarWrapper } from "./components";
import Button from "components/form/Button";
import { useToolbarActions } from "contexts/ToolbarContext";
import { useUtkast } from "contexts/UtkastContext";
import Feedback from "components/Feedback/Feedback";
import useFeedback from "hooks/useFeedback";
import { useRedigeringsmodus } from "hooks/useRedigeringsmodus";
import Icon from "components/Icon";
import UtkastCreatedTab from "./UtkastCreatedTab";

type Props = {
  openCreateUtkast: () => void;
  utkastJustCreated: boolean;
};

const DefaultToolbar = ({ openCreateUtkast, utkastJustCreated }: Props) => {
  const { t } = useTranslation();
  const { canSave, undo, redo } = useToolbarActions();
  const { utkast, updateUtkastWithHistory, closeUtkast } = useUtkast();
  const { redigeringsmodusAktiv } = useRedigeringsmodus();
  const { openFeedback, isOpen, closeFeedback, feedbackContent } = useFeedback(
    t(
      "Utkastet ditt har endringer som ikke er lagret. Dersom du lukker utkastet nå, vil disse endringene forkastes. Er du sikker på at du vil fortsette?"
    )
  );

  if (!redigeringsmodusAktiv) return null;

  return (
    <div>
      <ToolbarWrapperWithName>
        <Buttons>
          <ButtonWithIcon onClick={undo} disabled={!undo} iconleft={true}>
            <Icon icon="undo" />
            {t("action.Undo")}
          </ButtonWithIcon>
          <ButtonWithIcon onClick={redo} disabled={!redo} iconleft={false}>
            {t("action.Redo")}
            <Icon icon="redo" />
          </ButtonWithIcon>
        </Buttons>
        <Seperator />
        <Buttons>
          {utkast && (
            <div>
              <UtkastIcon icon="description" cansave={canSave} />
              {utkast.navn}
            </div>
          )}
          <Button
            variant="secondary"
            onClick={canSave ? openFeedback : closeUtkast}
          >
            {t("action.Lukk utkast")}
          </Button>
          {utkast && (
            <Button onClick={updateUtkastWithHistory} disabled={!canSave}>
              {t("action.Lagre utkast")}
            </Button>
          )}
          {!utkast && (
            <Button onClick={openCreateUtkast} disabled={!canSave}>
              {t("action.Lagre utkast")}
            </Button>
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
      {utkastJustCreated && <UtkastCreatedTab />}
    </div>
  );
};

const ToolbarWrapperWithName = styled(ToolbarWrapper)`
  display: flex;
  flex-direction: coloumn;
  gap: 28px;

  p {
    margin-top: 0;
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  > * {
    align-items: center;
  }

  > div {
    padding-right: 8px;
  }
`;

const Seperator = styled.div`
  border-right: 1px solid var(--gray);
`;

const UtkastIcon = styled(Icon)<{ cansave: boolean }>`
  color: ${({ cansave }) => (cansave ? "var(--red_dark)" : "var(--green)")};
  padding-right: 6px;
`;

const ButtonWithIcon = styled(Button)<{ iconleft: boolean }>`
  display: flex;
  align-items: center;

  > span {
    display: flex;
    align-items: center;

    ${Icon} {
      padding-left: ${({ iconleft }) => (iconleft ? 0 : 8)}px;
      padding-right: ${({ iconleft }) => (iconleft ? 8 : 0)}px;
    }
  }
`;

export default DefaultToolbar;
