import styled from "styled-components";
import Button, { LinkButton } from "components/form/Button";
import Icon from "components/Icon";
import { useInndelingerKrets } from "contexts/InndelingerKretsContext";
import { KommuneRef } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { useTranslation } from "react-i18next";

type Props = {
  kommune: KommuneRef;
};

const Kommune = ({ kommune }: Props) => {
  const { t } = useTranslation();
  const { kommuneValues, toggleEditKretser, toggleKretser } =
    useInndelingerKrets(kommune);

  return (
    <KommuneWrapper>
      <Button
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
      <Title editing={kommuneValues.editing} onClick={toggleKretser}>
        {getNavnInSpraak(kommune.navn, "nor")}
      </Title>
      <LinkButton onClick={toggleEditKretser}>
        {kommuneValues.editing
          ? t("action.Avslutt redigering")
          : t("action.Rediger")}
      </LinkButton>
    </KommuneWrapper>
  );
};

const KommuneWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Title = styled(Button).attrs(() => ({
  variant: "unstyled",
}))<{ editing?: boolean }>`
  margin: 0;
  margin-left: 8px;
  flex: 1;
  padding: 8px 0;

  ${({ editing }) => editing && "font-weight: bold"};
`;

export default Kommune;
