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
import { removeAllFeatures } from "utils/map/layers";

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

  const { resetEditingObject } = useEditAllGrenser();
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
    resetEditingObject();
    removeAllFeatures();
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

    if (utkastActive) {
      setIsPublishOpen(false);
      setIsDeleteOpen(false);
      return;
    }

    changeUtkast(utkast.id);
  };

  return (
    <ListItem>
      <ItemWrapper active={utkastActive}>
        <UtkastName>{utkast.navn}</UtkastName>
        <UnstyledButton onClick={() => openClosePublish()}>
          <PublishIcon aria-label={`Publiser ${utkast.navn}`} />
        </UnstyledButton>
        <UnstyledButton onClick={() => openCloseDelete()}>
          <DeleteIcon aria-label={`Forkast ${utkast.navn}`} />
        </UnstyledButton>
        <UnstyledButton onClick={() => openCloseUtkast()}>
          <EditIcon
            $active={utkastActive}
            aria-label={`Aktiver ${utkast.navn}`}
          />
        </UnstyledButton>
      </ItemWrapper>
      {isPublishOpen && (
        <UtkastItemExpanded>
          <ButtonsAndGyldigFra>
            <Buttons>
              <CancelButton onClick={() => setIsPublishOpen(false)}>
                {t("action.Avbryt")}
              </CancelButton>
              <Button onClick={publish}>{t("action.Publiser")}</Button>
            </Buttons>
          </ButtonsAndGyldigFra>
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
          <ButtonsAndGyldigFra>
            <Buttons>
              <CancelButton onClick={() => setIsDeleteOpen(false)}>
                {t("action.Avbryt")}
              </CancelButton>
              <Button onClick={deleteUtkast}>{t("action.Forkast")}</Button>
            </Buttons>
          </ButtonsAndGyldigFra>
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
    </ListItem>
  );
};

const ItemWrapper = styled.div<{ active: boolean }>`
  display: flex;
  background: ${({ active }) => (active ? "var(--blue_light)" : "transparent")};
  padding: 0 10px 0 0;
`;

const ListItem = styled.li`
  margin-right: 8px;
  margin-bottom: 8px;
`;

const UtkastName = styled.p`
  flex: 1;
  padding: 4px;
  padding-left: 16px;
`;

export const UtkastItemExpanded = styled.div`
  border-top: 2px solid var(--black);
  background-color: var(--gray_light);
  padding: 32px 16px;
`;

const Buttons = styled.div`
  flex: 1;
  text-align: right;
`;

export const ButtonsAndGyldigFra = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  .button:first-child {
    margin-right: 14px;
  }

  label {
    margin-bottom: 1px;

    input {
      display: block;
      margin-bottom: 0;
      width: 130px;
    }
  }
`;

const CancelButton = styled(Button).attrs(() => ({
  variant: "teriary",
}))`
  background-color: var(--gray_light);
  border: none;
  color: var(--blue);
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

const PublishIcon = styled(Icon).attrs(() => ({
  icon: "done",
}))`
  color: var(--green);
  margin-right: 8px;
  border-radius: 50%;
  padding: 4px;

  &:hover {
    background: var(--green);
    color: var(--white);
  }

  &:focus-visible {
    outline: 2px solid var(--blue_dark);
  }
`;

const DeleteIcon = styled(Icon).attrs(() => ({
  icon: "close",
}))`
  color: var(--red_error_message);
  margin-right: 8px;
  border-radius: 50%;
  padding: 4px;

  &:hover {
    background: var(--red_error_message);
    color: var(--white);
  }
`;

const EditIcon = styled(Icon).attrs(() => ({
  icon: "edit",
}))<{ $active: boolean }>`
  color: ${({ $active }) => ($active ? "var(--white)" : "var(--blue_dark)")};
  margin-right: 8px;
  border-radius: 50%;
  padding: 4px;
  background: ${({ $active }) =>
    $active ? "var(--blue_dark)" : "transparent"};
  &:hover {
    background: var(--blue_dark);
    color: var(--white);
  }
`;

export default UtkastItem;
