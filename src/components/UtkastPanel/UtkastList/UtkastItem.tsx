import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { Button } from "@kvib/react";
import UtkastItemActive from "./UtkastItemActive";
import Icon from "components/Icon";
import { UtkastRef } from "types/api";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { resetMapView } from "utils/map";
import useAlertModal from "hooks/useAlertModal";
import { useUtkast } from "contexts/UtkastContext";
import { Outline } from "style/mixins";
import AlertModal from "components/AlertModal";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { getDateInFriendlyString } from "pages/Kart/OverlayPanels/MetadataPanel/utils";

type Props = {
  utkast: UtkastRef;
};

const UtkastItem = ({ utkast }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const utkastId = searchParams.get("utkast");

  const { resetAndClearEditingLayer } = useEditAllGrenser();
  const { closeOverlayPanel } = useOverlayPanel();
  const { modalIsOpen, openModal, closeModal, modalTitle, modalBody } =
    useAlertModal(
      "Du har endringer i utkastet som ikke er lagret",
      "Er du sikker på at du vil gå ut av utkastet? Dersom du lukker utkastet nå mister du alle ulagrede endringer."
    );
  const { canSave } = useToolbar();
  const { closeUtkast } = useUtkast();

  const utkastActive = utkastId === utkast.id;

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

  const openCloseUtkast = () => {
    if (canSave) {
      openModal();
    } else {
      closeUtkast();
    }

    if (utkastActive) {
      return;
    }

    changeUtkast(utkast.id);
  };

  const getColorFromUtkastAction = () =>
    utkastActive ? "var(--kvib-colors-blue-50)" : "transparent";

  return (
    <li>
      <ItemWrapper headerBackground={getColorFromUtkastAction()}>
        <UtkastTekst>
          <UtkastName>{utkast.navn}</UtkastName>
          <UtkastOpprettetDato>
            {`Opprettet: ${getDateInFriendlyString(utkast.opprettetDato)}`}
          </UtkastOpprettetDato>
        </UtkastTekst>
        <UnstyledButton onClick={() => openCloseUtkast()}>
          <ButtonIcon
            icon="edit"
            aria-label={`Aktiver ${utkast.navn}`}
            $isActive={utkastActive}
            $primaryColor="var(--kvib-colors-blue-500)"
          />
        </UnstyledButton>
      </ItemWrapper>
      {utkastActive && <UtkastItemActive utkastId={utkast.id} />}
      <AlertModal
        status="warning"
        title={modalTitle}
        description={modalBody}
        isOpen={modalIsOpen}
        onClose={closeModal}
        secondaryAction={{
          text: "Forkast endringer",
          onClick: () => {
            closeUtkast();
            closeModal();
          },
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
  border-top-width: 2px;
  background-color: var(--kvib-colors-gray-50);
  padding: 24px;

  input,
  select {
    background: white;
  }
`;

const UnstyledButton = styled(Button).attrs(() => ({
  variant: "ghost",
}))`
  padding: 0;

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
  color: ${(props) =>
    props.$isActive
      ? "var(--kvib-colors-chakra-inverse-text)"
      : props.$primaryColor};
  background: ${(props) =>
    props.$isActive ? props.$primaryColor : "transparent"};

  &:hover {
    background: ${(props) => props.$primaryColor};
    color: var(--kvib-colors-chakra-inverse-text);
  }

  &:focus-visible {
    outline: 2px solid var(--kvib-colors-blue-500);
  }
`;

export default UtkastItem;
