import styled from "styled-components";
import Button from "components/form/Button";
import { useInndelingerKrets } from "contexts/InndelingerKretsContext";
import { ReactComponent as EditIcon } from "icons/edit.svg";
import { ReactComponent as VisibilityIcon } from "icons/visibility.svg";
import { ReactComponent as VisibilityOffIcon } from "icons/visibility_off.svg";
import { KommuneRef } from "types/api";
import { getNavnInSpraak } from "utils/language/language";

type Props = {
  kommune: KommuneRef;
};

const Kommune = ({ kommune }: Props) => {
  const { kommuneValues, openKretserPanel, toggleKretser } =
    useInndelingerKrets(kommune);

  return (
    <KommuneWrapper>
      <Button
        onClick={toggleKretser}
        variant="unstyled"
        icon={
          kommuneValues.visible ? (
            <VisibilityIcon aria-label="Synlig" />
          ) : (
            <VisibilityOffIcon aria-label="Usynlig" />
          )
        }
      />
      <Title>{getNavnInSpraak(kommune.navn, "nor")}</Title>
      <Button
        icon={<EditIcon />}
        variant="unstyled"
        onClick={openKretserPanel}
      />
    </KommuneWrapper>
  );
};

const KommuneWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 8px 0;
`;

const Title = styled.p`
  margin: 0;
  margin-left: 8px;
  flex: 1;
`;

export default Kommune;
