import styled from "styled-components";
import Button, { LinkButton } from "components/form/Button";
import Icon from "components/Icon";
import { useInndelingerKrets } from "contexts/InndelingerKretsContext";
import { KommuneRef } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { useTranslation } from "react-i18next";
import { Outline } from "style/mixins";
import AlertModal from "components/AlertModal";
import useAlertModal from "hooks/useAlertModal";
import { useToolbar } from "contexts/ToolbarContext";

type Props = {
  kommune: KommuneRef;
};

const Kommune = ({ kommune }: Props) => {
  const { t } = useTranslation();
  const { kommuneValues, toggleEditKretser, toggleKretser, lasterData } =
    useInndelingerKrets(kommune);

  const { history, clearHistory } = useToolbar();

  const { modalIsOpen, openModal, closeModal, modalTitle, modalBody } =
    useAlertModal(
      t("utkast.ulagrede-endringer"),
      t("utkast.ulagrede-endringer-krets-utdypende")
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

  return (
    <>
      <KommuneWrapper editing={kommuneValues.editing}>
        <VisibilityButton
          onClick={toggleKretser}
          variant="unstyled"
          visible={kommuneValues.visible}
          disabled={lasterData}
          icon={
            kommuneValues.visible ? (
              <Icon icon="visibility" aria-label="Synlig" />
            ) : (
              <Icon icon="visibility_off" aria-label="Usynlig" />
            )
          }
        />
        <Title>{getNavnInSpraak(kommune.navn, "nor")}</Title>
        <LinkButton onClick={onAvsluttRedigeringClick} disabled={lasterData}>
          {kommuneValues.editing
            ? t("action.Avslutt redigering")
            : t("action.Rediger")}
        </LinkButton>
      </KommuneWrapper>
      <AlertModal
        status="warning"
        title={modalTitle}
        body={modalBody}
        isOpen={modalIsOpen}
        onClose={closeModal}
        secondaryAction={{
          text: t("Forkast endringer"),
          onClick: closeEditing,
        }}
        primaryAction={{
          text: t("Fortsett redigering"),
          onClick: closeModal,
        }}
      />
    </>
  );
};

const KommuneWrapper = styled.div<{ editing?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;

  ${LinkButton} {
    ${({ editing }) => editing && "font-weight: bold"};
    color: ${({ editing }) => (editing ? "var(--blue_dark)" : "var(--blue)")};

    &:hover {
      text-decoration: none;
    }

    &:focus-visible {
      ${Outline};
    }
  }
`;

const VisibilityButton = styled(Button)<{ visible?: boolean }>`
  color: ${({ visible }) => (visible ? "var(--white)" : "var(--blue_dark)")};
  background: ${({ visible }) =>
    visible ? "var(--blue_dark)" : "transparent"};

  border-radius: 50%;
  padding: 8px;

  &:hover {
    color: var(--blue_dark);
    background: var(--blue_light);
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
