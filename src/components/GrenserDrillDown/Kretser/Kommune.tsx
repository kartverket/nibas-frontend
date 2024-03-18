import { Button, IconButton, Spinner } from "@kvib/react";
import AlertModal from "components/Modals/AlertModal";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useInndelingerKrets } from "contexts/InndelingerKretsContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import useAlertModal from "hooks/useAlertModal";
import { Outline } from "style/mixins";
import { styled } from "styled-components";
import { KommuneResponse } from "types/api";
import { getNavnInSpraak } from "utils/language/language";

type Props = {
  kommune: KommuneResponse;
};

const Kommune = ({ kommune }: Props) => {
  const { utkast } = useUtkast();
  const { history, clearHistory } = useHistory();
  const { openOverlayModal, setFlatedata } = useOverlayPanel();
  const { kommuneValues, toggleEditKretser, toggleKretser, lasterData, currentKretstype, setLasterData } =
    useInndelingerKrets(kommune);

  const { modalIsOpen, openModal, closeModal, modalTitle, modalBody } = useAlertModal(
    "Du har endringer i utkastet som ikke er lagret",
    "Er du sikker på at du vil avslutte redigering av denne kommunen? Dersom du avslutter redigering nå mister du alle ulagrede endringer.",
  );

  const closeEditing = () => {
    closeModal();
    clearHistory();
    toggleEditKretser();
  };

  const onAvsluttRedigeringClick = () => {
    if (history.entries.length > 0) {
      openModal();
    } else {
      setLasterData(true);
      toggleEditKretser();
    }
  };

  const toggleFlatedetaljer = () => {
    setFlatedata(kommune);
    openOverlayModal(currentKretstype);
  };

  return (
    <>
      <KommuneWrapper>
        <VisibilityButton
          variant="ghost"
          onClick={toggleKretser}
          $isVisible={kommuneValues.isVisible}
          isDisabled={lasterData}
          aria-label={kommuneValues.isVisible ? "Synlig" : "Usynlig"}
          icon={kommuneValues.isVisible ? "visibility" : "visibility_off"}
        />
        <Title>{`${kommune.kommunenummer.kodeverdi} ${getNavnInSpraak(kommune.navn, "nor")}`}</Title>
        {lasterData ? (
          <Spinner size="lg" color="var(--kvib-colors-blue-500)" />
        ) : utkast ? (
          <EditButton variant="tertiary" onClick={onAvsluttRedigeringClick}>
            {kommuneValues.isEditing ? "Avslutt redigering" : "Rediger"}
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

const VisibilityButton = styled(IconButton)<{ $isVisible: boolean }>`
  color: ${({ $isVisible }) => ($isVisible ? "var(--kvib-colors-chakra-inverse-text)" : "var(--kvib-colors-blue-500)")};
  background: ${({ $isVisible }) => ($isVisible ? "var(--kvib-colors-blue-500)" : "transparent")};
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
