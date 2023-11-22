import { styled } from "styled-components";
import { useInndelingerKrets } from "contexts/InndelingerKretsContext";
import { KommuneRef } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { Outline } from "style/mixins";
import AlertModal from "components/Modals/AlertModal";
import useAlertModal from "hooks/useAlertModal";
import { useHistory } from "contexts/HistoryContext";
import { Button, IconButton, Spinner } from "@kvib/react";
import { useUtkast } from "contexts/UtkastContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";

type Props = {
  kommune: KommuneRef;
};

const Kommune = ({ kommune }: Props) => {
  const { utkast } = useUtkast();
  const { history, clearHistory } = useHistory();
  const { openOverlayPanel, setFlatedata } = useOverlayPanel();
  const {
    kommuneValues,
    toggleEditKretser,
    toggleKretser,
    lasterData,
    currentKretstype,
  } = useInndelingerKrets(kommune);

  const { modalIsOpen, openModal, closeModal, modalTitle, modalBody } =
    useAlertModal(
      "Du har endringer i utkastet som ikke er lagret",
      "Er du sikker på at du vil avslutte redigering av denne kommunen? Dersom du avslutter redigering nå mister du alle ulagrede endringer.",
    );

  const closeEditing = () => {
    closeModal();
    clearHistory({ hasPreviouslySavedHistory: true });
    toggleEditKretser();
  };

  const onAvsluttRedigeringClick = () => {
    if (history.entries.length > 0) {
      openModal();
    } else {
      toggleEditKretser();
    }
  };

  const toggleFlatedetaljer = () => {
    setFlatedata(kommune);
    openOverlayPanel(currentKretstype);
  };

  return (
    <>
      <KommuneWrapper>
        <VisibilityButton
          variant="ghost"
          onClick={toggleKretser}
          $isVisible={kommuneValues.visible}
          isDisabled={lasterData}
          aria-label={kommuneValues.visible ? "Synlig" : "Usynlig"}
          icon={kommuneValues.visible ? "visibility" : "visibility_off"}
        />
        <Title>{`${kommune.kommunenummer.kodeverdi} ${getNavnInSpraak(
          kommune.navn,
          "nor",
        )}`}</Title>
        {lasterData ? (
          <Spinner size="lg" color="var(--kvib-colors-blue-500)" />
        ) : utkast ? (
          <EditButton variant="tertiary" onClick={onAvsluttRedigeringClick}>
            {kommuneValues.editing ? "Avslutt redigering" : "Rediger"}
          </EditButton>
        ) : (
          <IconButton
            variant="ghost"
            icon="feed"
            aria-label="Vis informasjon om flatene"
            onClick={toggleFlatedetaljer}
          />
        )}
      </KommuneWrapper>
      <AlertModal
        status="warning"
        title={modalTitle}
        description={modalBody}
        isOpen={modalIsOpen}
        onClose={closeModal}
        secondaryAction={{
          text: "Forkast endringer",
          onClick: closeEditing,
        }}
        primaryAction={{
          text: "Fortsett redigering",
          onClick: closeModal,
        }}
      />
    </>
  );
};

const KommuneWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
`;

const EditButton = styled(Button)`
  min-width: unset;
  min-height: unset;
  padding: 0;
`;

const VisibilityButton = styled(IconButton)<{ $isVisible?: boolean }>`
  color: ${({ $isVisible }) =>
    $isVisible
      ? "var(--kvib-colors-chakra-inverse-text)"
      : "var(--kvib-colors-blue-500)"};
  background: ${({ $isVisible }) =>
    $isVisible ? "var(--kvib-colors-blue-500)" : "transparent"};
  border-radius: 50%;
  padding: 8px;

  &:hover {
    color: var(--kvib-colors-blue-500);
    background: var(--kvib-colors-blue-50);
  }

  &:focus-visible {
    ${Outline}
  }
`;

const Title = styled.div`
  margin: 0;
  margin-left: 8px;
  flex: 1;
  padding: 8px 0;
`;

export default Kommune;
