import Feedback from "components/Feedback/Feedback";
import { useToolbarActions } from "contexts/ToolbarContext";
import { useUtkast } from "contexts/UtkastContext";
import useFeedback from "hooks/useFeedback";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import ModeButton from "./ModeButton";
import { Frame } from "./Toolbar";

const LagreFrame = styled(Frame)`
  flex-direction: row;
  justify-content: center;
  width: 100%;
`;

const UtkastInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  color: var(--gray);
  font-size: 12px;
`;

const UtkastNavn = styled.h4`
  margin: 0;
  color: var(--black);
  font-size: 14px;
  font-weight: normal;
`;

const DividerVertical = styled.hr`
  width: 1px;
  height: 50px;
  border: 1px solid var(--gray_light);
  margin: 0 4px;
`;

type Props = {
  createUtkastOpen: boolean;
  setCreateUtkastOpen: (createUtkastOpen: boolean) => void;
};

const LagreToolbar = ({ createUtkastOpen, setCreateUtkastOpen }: Props) => {
  const { t } = useTranslation();

  const { utkast, updateUtkastWithHistory, closeUtkast } = useUtkast();
  const { openFeedback, isOpen, closeFeedback, feedbackContent } = useFeedback(
    t(
      "Utkastet ditt har endringer som ikke er lagret. Dersom du lukker utkastet nå, vil disse endringene forkastes. Er du sikker på at du vil fortsette?"
    )
  );
  const { canSave } = useToolbarActions();

  return (
    <LagreFrame>
      {utkast ? (
        <>
          <UtkastInfo>
            <span>{t("utkast.Navn på utkast")}</span>
            <UtkastNavn>{utkast.navn}</UtkastNavn>
          </UtkastInfo>
          <DividerVertical />

          <ModeButton
            icon="save"
            ariaLabel="Lagre utkast"
            onClick={updateUtkastWithHistory}
            disabled={!canSave}
          >
            {t("action.Lagre")}
          </ModeButton>

          <ModeButton
            icon="close"
            ariaLabel="Lukk utkast"
            onClick={canSave ? openFeedback : closeUtkast}
          >
            {t("action.Lukk")}
          </ModeButton>
        </>
      ) : (
        <ModeButton
          icon="save"
          ariaLabel="Lagre utkast"
          onClick={() => setCreateUtkastOpen(!createUtkastOpen)}
          disabled={!canSave}
          isActive={createUtkastOpen}
        >
          {t("action.Lagre")}
        </ModeButton>
      )}

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
    </LagreFrame>
  );
};

export default LagreToolbar;
