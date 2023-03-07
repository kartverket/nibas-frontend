import styled from "styled-components";
import Button, { LinkButton } from "components/form/Button";
import { useInndelingerKrets } from "contexts/InndelingerKretsContext";
import { KommuneRef } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { useTranslation } from "react-i18next";
import { Outline } from "style/mixins";

type Props = {
  kommune: KommuneRef;
};

const Kommune = ({ kommune }: Props) => {
  const { t } = useTranslation();
  const { kommuneValues, toggleEditKretser, toggleKretser } =
    useInndelingerKrets(kommune);

  return (
    <KommuneWrapper editing={kommuneValues.editing}>
      <VisibilityButton
        onClick={toggleKretser}
        variant="unstyled"
        visible={kommuneValues.visible}
        {...(kommuneValues.visible ? {icon: 'visibility', iconAriaLabel: 'Synlig'} : {icon: 'visibility_off', iconAriaLabel: 'Usynlig'})}
      />
      <Title>{getNavnInSpraak(kommune.navn, "nor")}</Title>
      <LinkButton onClick={toggleEditKretser}>
        {kommuneValues.editing
          ? t("action.Avslutt redigering")
          : t("action.Rediger")}
      </LinkButton>
    </KommuneWrapper>
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
