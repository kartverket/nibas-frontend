import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { ToolbarWrapper } from "./components";
import Button from "components/form/Button";
import { useToolbarActions } from "contexts/ToolbarContext";
import { useUtkast } from "contexts/UtkastContext";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useMetadataPanel } from "contexts/MetadataPanelContext";
import { resetMapView } from "utils/map";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import Feedback from "components/Feedback/Feedback";

type Props = {
  openCreateUtkast: () => void;
};

const DefaultToolbar = ({ openCreateUtkast }: Props) => {
  const { t } = useTranslation();
  const { canSave, undo, redo } = useToolbarActions();
  const { utkast, updateUtkastWithHistory } = useUtkast();
  const { resetEditingObject } = useEditAllGrenser();
  const { closePanel } = useMetadataPanel();
  const [searchParams, setSearchParams] = useSearchParams();
  const [warningFeedback, setWarningFeedback] = useState("");

  if (!canSave && !undo && !redo) return null;

  const closeUtkast = () => {
    setWarningFeedback("");
    setSearchParams({});
    resetEditingObject();
    closePanel();
    resetMapView();
  };

  const promptWarning = () => {
    setWarningFeedback(
      t(
        "Utkastet er ikke publisert enda. Vil du fullføre det senere, eller publisere med en gang?"
      )
    );
  };

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
            <CloseUtkastButton variant="unstyled" onClick={promptWarning}>
              <span>{"Lukk utkast"}</span>
            </CloseUtkastButton>
          )}
        </Buttons>
      </ToolbarWrapperWithName>
      <Feedback
        type="warning"
        title="Advarsel"
        isOpen={warningFeedback !== ""}
        onClose={() => setWarningFeedback("")}
        onContinue={() => closeUtkast()}
      >
        {warningFeedback}
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
