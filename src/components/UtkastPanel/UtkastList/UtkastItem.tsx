import { useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { useSWRConfig } from "swr";
import UtkastItemActive from "./UtkastItemActive";
import { deleteUtkast as deleteApiUtkast, publishUtkast } from "api/utkast";
import Button from "components/form/Button";
import Icon from "components/Icon";
import useNibasApi from "hooks/useNibasApi";
import {
  ConflictResponseWrapper,
  FramtidigVersjonConflict,
  UtkastRef,
} from "types/api";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { useOverlayPanels } from "contexts/OverlayPanelsContext";
import { resetMapView } from "utils/map";
import UtkastConflicts from "./UtkastConflictModal/UtkastConflicts";
import useFeedback from "hooks/useFeedback";
import { useToolbarActions } from "contexts/ToolbarContext";
import { useUtkast } from "contexts/UtkastContext";
import Feedback from "components/Feedback/Feedback";
import { Outline } from "style/mixins";

type Props = {
  utkast: UtkastRef;
};

const UtkastItem = ({ utkast }: Props) => {
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [conflictResponse, setConflictResponse] =
    useState<FramtidigVersjonConflict | null>(null);

  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const utkastId = searchParams.get("utkast");

  const { resetAndClearEditingLayer } = useEditAllGrenser();
  const { closePanels } = useOverlayPanels();
  const { data: fullUtkast } = useNibasApi(
    isPublishOpen || isDeleteOpen ? "/v1/utkast/{id}" : null,
    {
      id: utkast.id,
    }
  );
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { mutate } = useSWRConfig();
  const { openFeedback, isOpen, closeFeedback, feedbackContent } = useFeedback(
    t(
      "Utkastet ditt har endringer som ikke er lagret. Dersom du lukker utkastet nå, vil disse endringene forkastes. Er du sikker på at du vil fortsette?"
    )
  );
  const { canSave } = useToolbarActions();
  const { closeUtkast } = useUtkast();

  const utkastActive = utkastId === utkast.id;

  const cleanUpUtkast = () => {
    mutate(["/v1/utkast", tokenHolderFunc()?.token]);

    if (utkastActive) {
      setSearchParams({});
    }
  };

  const publish = async () => {
    if (!fullUtkast) return;

    const response = await publishUtkast(
      utkast.id,
      fullUtkast,
      tokenHolderFunc()?.token
    );

    if (!response) return;

    if (response.status === 200) {
      cleanUpUtkast();
    } else if (response.status === 409) {
      const wrapper = (await response.json()) as ConflictResponseWrapper;

      if (!wrapper.framtidigVersjonConflict) return;

      setConflictResponse(wrapper.framtidigVersjonConflict);
    }
  };

  const deleteUtkast = async () => {
    if (!fullUtkast) return;

    await deleteApiUtkast(utkast.id, tokenHolderFunc()?.token);

    await mutate(["/v1/utkast", tokenHolderFunc()?.token]);

    if (utkastActive) {
      setSearchParams({});
    }
  };

  const changeUtkast = (id?: string) => {
    if (id) {
      setSearchParams({ utkast: id });
    } else {
      setSearchParams({});
    }
    resetAndClearEditingLayer();
    closePanels();
    resetMapView();
  };

  const openClosePublish = () => {
    if (isPublishOpen) {
      setIsPublishOpen(false);
      return;
    }
    setIsPublishOpen(true);
    setIsDeleteOpen(false);
  };

  const openCloseDelete = () => {
    if (isDeleteOpen) {
      setIsDeleteOpen(false);
      return;
    }
    setIsPublishOpen(false);
    setIsDeleteOpen(true);
  };

  const openCloseUtkast = () => {
    if (!isPublishOpen && !isDeleteOpen) {
      if (canSave) {
        openFeedback();
      } else {
        closeUtkast();
      }
    }

    setIsPublishOpen(false);
    setIsDeleteOpen(false);

    if (utkastActive) {
      return;
    }

    changeUtkast(utkast.id);
  };

  const getColorFromUtkastAction = () =>
    isPublishOpen
      ? "var(--green_light)"
      : isDeleteOpen
      ? "var(--pink)"
      : utkastActive
      ? "var(--blue_light)"
      : "transparent";

  return (
    <li>
      <ItemWrapper headerBackground={getColorFromUtkastAction()}>
        <UtkastName>{utkast.navn}</UtkastName>
        <UnstyledButton onClick={() => openClosePublish()}>
          <ButtonIcon
            icon="done"
            aria-label={`Publiser ${utkast.navn}`}
            $isActive={isPublishOpen}
            $primaryColor="var(--green)"
          />
        </UnstyledButton>
        <UnstyledButton onClick={() => openCloseDelete()}>
          <ButtonIcon
            icon="close"
            aria-label={`Forkast ${utkast.navn}`}
            $isActive={isDeleteOpen}
            $primaryColor="var(--red_error_message)"
          />
        </UnstyledButton>
        <UnstyledButton onClick={() => openCloseUtkast()}>
          <ButtonIcon
            icon="edit"
            aria-label={`Aktiver ${utkast.navn}`}
            $isActive={utkastActive}
            $primaryColor="var(--blue_dark)"
          />
        </UnstyledButton>
      </ItemWrapper>
      {isPublishOpen && (
        <UtkastItemExpanded>
          <Buttons>
            <CancelButton onClick={() => setIsPublishOpen(false)}>
              {t("action.Avbryt")}
            </CancelButton>
            <Button onClick={publish}>{t("action.Publiser")}</Button>
          </Buttons>
          {conflictResponse && (
            <UtkastConflicts
              utkastId={utkast.id}
              conflictResponse={conflictResponse}
              onCancel={() => setConflictResponse(null)}
              close={() => setConflictResponse(null)}
              onResolved={cleanUpUtkast}
            />
          )}
        </UtkastItemExpanded>
      )}
      {isDeleteOpen && (
        <UtkastItemExpanded>
          <Buttons>
            <CancelButton onClick={() => setIsDeleteOpen(false)}>
              {t("action.Avbryt")}
            </CancelButton>
            <Button onClick={deleteUtkast}>{t("action.Forkast")}</Button>
          </Buttons>
        </UtkastItemExpanded>
      )}
      {utkastActive && !isPublishOpen && !isDeleteOpen && (
        <UtkastItemActive utkastId={utkast.id} />
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
    </li>
  );
};

const ItemWrapper = styled.div<{ headerBackground: string }>`
  display: flex;
  background: ${(props) => props.headerBackground};
  padding: 20px 24px;
  gap: 8px;
  align-items: center;
`;

const UtkastName = styled.span`
  flex: 1;
`;

export const UtkastItemExpanded = styled.div`
  border-top: 2px solid var(--black);
  background-color: var(--gray_light);
  padding: 24px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const CancelButton = styled(Button).attrs(() => ({
  variant: "tertiary",
}))`
  background: transparent;
`;

const UnstyledButton = styled(Button).attrs(() => ({
  variant: "unstyled",
}))`
  &:focus-visible {
    ${Icon} {
      ${Outline}
    }
  }
`;

const ButtonIcon = styled(Icon)<{ $isActive: boolean; $primaryColor: string }>`
  border-radius: 50%;
  padding: 4px;
  color: ${(props) => (props.$isActive ? "var(--white)" : props.$primaryColor)};
  background: ${(props) =>
    props.$isActive ? props.$primaryColor : "transparent"};

  &:hover {
    background: ${(props) => props.$primaryColor};
    color: var(--white);
  }

  &:focus-visible {
    outline: 2px solid var(--blue_dark);
  }
`;

export default UtkastItem;
