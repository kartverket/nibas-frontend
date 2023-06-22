import { useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { Button } from "@kvib/react";
import { useSWRConfig } from "swr";
import UtkastItemActive from "./UtkastItemActive";
import { deleteUtkast as deleteApiUtkast, publishUtkast } from "api/utkast";
import Icon from "components/Icon";
import useNibasApi from "hooks/useNibasApi";
import {
  ApiErrorResponse,
  ConflictResponseWrapper,
  FramtidigVersjonConflict,
  UtkastRef,
} from "types/api";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { resetMapView } from "utils/map";
import UtkastConflicts from "./UtkastConflictModal/UtkastConflicts";
import useAlertModal from "hooks/useAlertModal";
import { useUtkast } from "contexts/UtkastContext";
import { Outline } from "style/mixins";
import AlertModal from "components/Status/AlertModal";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { statusCode } from "utils/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { getDateInFriendlyString } from "components/Kart/OverlayPanels/MetadataPanel/utils";

type Props = {
  utkast: UtkastRef;
};

const UtkastItem = ({ utkast }: Props) => {
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [publiserer, setPubliserer] = useState(false);
  const [forkaster, setForkaster] = useState(false);
  const [conflictResponse, setConflictResponse] =
    useState<FramtidigVersjonConflict | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const utkastId = searchParams.get("utkast");

  const { resetAndClearEditingLayer } = useEditAllGrenser();
  const { closeOverlayPanel } = useOverlayPanel();
  const { data: fullUtkast } = useNibasApi(
    isPublishOpen || isDeleteOpen ? "/v1/utkast/{id}" : null,
    {
      id: utkast.id,
    }
  );
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { mutate } = useSWRConfig();
  const { modalIsOpen, openModal, closeModal, modalTitle, modalBody } =
    useAlertModal(
      "Du har endringer i utkastet som ikke er lagret",
      "Er du sikker på at du vil gå ut av utkastet? Dersom du lukker utkastet nå mister du alle ulagrede endringer."
    );
  const { canSave } = useToolbar();
  const { closeUtkast } = useUtkast();
  const { setError } = useErrorHandling();

  const utkastActive = utkastId === utkast.id;

  const cleanUpUtkast = () => {
    mutate(["/v1/utkast", tokenHolderFunc()?.token]);

    if (utkastActive) {
      setSearchParams({});
    }
  };

  const publish = async () => {
    if (!fullUtkast) return;
    setPubliserer(true);

    const response = await publishUtkast(
      utkast.id,
      fullUtkast,
      tokenHolderFunc()?.token
    );

    setPubliserer(false);

    if (!response) return;

    if (statusCode.isSuccessful(response.status)) {
      cleanUpUtkast();
    } else if (statusCode.isConflict(response.status)) {
      const wrapper = (await response.json()) as ConflictResponseWrapper;

      if (wrapper.framtidigVersjonConflict) {
        setConflictResponse(wrapper.framtidigVersjonConflict);
      } else {
        setError({
          title: "Utkastet er utdatert",
          description:
            "Du har gjort endringer på en gammel versjon av en krets. Du må gjennomføre endringene på nytt i et nytt utkast.",
        });
      }
    } else if (statusCode.isError(response.status)) {
      const wrapper = (await response.json()) as ApiErrorResponse;
      setError({ ...wrapper.errorDescription, errorCode: wrapper.errorCode });
    }
  };

  const deleteUtkast = async () => {
    if (!fullUtkast) return;
    setForkaster(true);

    const response = await deleteApiUtkast(utkast.id, tokenHolderFunc()?.token);
    setForkaster(false);
    if (statusCode.isSuccessful(response.status)) {
      await mutate(["/v1/utkast", tokenHolderFunc()?.token]);

      if (utkastActive) {
        setSearchParams({});
        resetAndClearEditingLayer();
      }
    } else if (statusCode.isError(response.status)) {
      const wrapper = (await response.json()) as ApiErrorResponse;
      setError({ ...wrapper.errorDescription, errorCode: wrapper.errorCode });
    }
  };

  const changeUtkast = (id?: string) => {
    if (id) {
      setSearchParams({ utkast: id });
    } else {
      setSearchParams({});
    }
    resetAndClearEditingLayer();
    closeOverlayPanel();
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
        openModal();
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
        <UtkastTekst>
          <UtkastName>{utkast.navn}</UtkastName>
          <UtkastOpprettetDato>
            {`Opprettet: ${getDateInFriendlyString(utkast.opprettetDato)}`}
          </UtkastOpprettetDato>
        </UtkastTekst>
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
              Avbryt
            </CancelButton>
            <Button onClick={publish} isLoading={publiserer}>
              Publiser
            </Button>
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
              Avbryt
            </CancelButton>
            <Button
              colorScheme="blue"
              onClick={deleteUtkast}
              isLoading={forkaster}
            >
              Forkast
            </Button>
          </Buttons>
        </UtkastItemExpanded>
      )}
      {utkastActive && !isPublishOpen && !isDeleteOpen && (
        <UtkastItemActive utkastId={utkast.id} />
      )}
      <AlertModal
        status="warning"
        title={modalTitle}
        description={modalBody}
        isOpen={modalIsOpen}
        onClose={closeModal}
        secondaryAction={{
          text: "Forkast endringer",
          onClick: closeUtkast,
        }}
        primaryAction={{
          text: "Fortsett redigering",
          onClick: closeModal,
        }}
      />
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

const UtkastTekst = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const UtkastName = styled.span`
  font-size: 16px;
`;

const UtkastOpprettetDato = styled.span`
  font-size: 12px;
`;

export const UtkastItemExpanded = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  variant: "ghost",
}))`
  && {
    padding: 0;
  }

  &&:hover {
    background: none;
  }
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
