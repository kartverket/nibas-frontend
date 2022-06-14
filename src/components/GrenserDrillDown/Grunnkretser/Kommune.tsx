import styled from "styled-components";
import Button from "components/form/Button";
import { useEditGrenser } from "contexts/EditGrenserContext";
import { useMetadataPanel } from "contexts/MetadataPanelContext";
import useGrunnkretsgrenser from "hooks/inndelinger/useGrunnkretsgrenser";
import { ReactComponent as VisibilityIcon } from "icons/visibility.svg";
import { ReactComponent as VisibilityOffIcon } from "icons/visibility_off.svg";
import { KommuneRef } from "types/api";
import { getNavnInSpraak } from "utils/language/language";

type Props = {
  kommune: KommuneRef;
};

const Kommune = ({ kommune }: Props) => {
  const { values, setObjectValue } = useEditGrenser("grunnkrets");
  const { openPanel } = useMetadataPanel();
  useGrunnkretsgrenser(kommune.id);

  const openGrunnkretserPanel = () => {
    setObjectValue(kommune.id, {
      ...values[kommune.id],
      visible: true,
    });
    openPanel({ content: "grunnkretser", data: kommune.id });
  };

  return (
    <KommuneWrapper>
      <Button
        onClick={() => openGrunnkretserPanel()}
        variant="unstyled"
        icon={
          values[kommune.id]?.visible ? (
            <VisibilityIcon aria-label="Synlig" />
          ) : (
            <VisibilityOffIcon aria-label="Usynlig" />
          )
        }
      ></Button>
      <Title>{getNavnInSpraak(kommune.navn, "nor")}</Title>
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
