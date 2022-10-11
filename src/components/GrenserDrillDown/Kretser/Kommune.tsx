import styled from "styled-components";
import Button from "components/form/Button";
import Icon from "components/Icon";
import { useInndelingerKrets } from "contexts/InndelingerKretsContext";
import { KommuneRef } from "types/api";
import { getNavnInSpraak } from "utils/language/language";

type Props = {
  kommune: KommuneRef;
};

const Kommune = ({ kommune }: Props) => {
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
      <Title editing={kommuneValues.editing}>
        {getNavnInSpraak(kommune.navn, "nor")}
      </Title>
      <EditButton
        editing={kommuneValues.editing}
        icon={<Icon icon="edit" />}
        variant="unstyled"
        onClick={toggleEditKretser}
      />
    </KommuneWrapper>
  );
};

const KommuneWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 8px 0;
`;

const Title = styled.p<{ editing?: boolean }>`
  margin: 0;
  margin-left: 8px;
  flex: 1;

  ${({ editing }) => editing && "font-weight: bold"};
`;

const EditButton = styled(Button)<{ editing?: boolean }>`
  ${({ editing, theme }) =>
    editing &&
    `
    background-color: ${theme.colors.blue};
    color: white;
  `};
`;

export default Kommune;
