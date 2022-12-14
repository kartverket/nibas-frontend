import styled from "styled-components";
import Button, { LinkButton } from "components/form/Button";
import Icon from "components/Icon";
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
        icon={
          kommuneValues.visible ? (
            <Icon icon="visibility" aria-label="Synlig" />
          ) : (
            <Icon icon="visibility_off" aria-label="Usynlig" />
          )
        }
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
    color: ${({ editing, theme }) =>
      editing ? theme.colors.blueDark : theme.colors.blue};

    &:hover {
      text-decoration: none;
    }

    &:focus-visible {
      ${Outline};
    }
  }
`;

const VisibilityButton = styled(Button)`
  color: ${({ theme }) => theme.colors.blueDark};
  border-radius: 50%;
  padding: 8px;

  &:hover {
    color: ${({ theme }) => theme.colors.white};
    background: ${({ theme }) => theme.colors.blueDark};
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
