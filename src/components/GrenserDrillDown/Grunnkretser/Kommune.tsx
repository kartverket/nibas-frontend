import styled from "styled-components";
import Button from "components/form/Button";
import { useEditGrenser } from "contexts/EditGrenserContext";
import { useMetadataPanel } from "contexts/MetadataPanelContext";
import useGrunnkretsgrenser from "hooks/inndelinger/useGrunnkretsgrenser";
import { LayerId } from "hooks/layers/types";
import { ReactComponent as EditIcon } from "icons/edit.svg";
import { ReactComponent as VisibilityIcon } from "icons/visibility.svg";
import { ReactComponent as VisibilityOffIcon } from "icons/visibility_off.svg";
import { KommuneRef } from "types/api";
import { getNavnInSpraak } from "utils/language/language";

type Props = {
  kommune: KommuneRef;
};

const Kommune = ({ kommune }: Props) => {
  const { values, setObjectValue } = useEditGrenser("grunnkrets");
  const { openPanel, closePanel } = useMetadataPanel();
  const { addGrunnkretserToLayer, removeGrunnkretserFromLayer } =
    useGrunnkretsgrenser(kommune.id);

  const kommuneValues = values[kommune.id] ?? {};

  const openGrunnkretserPanel = () => {
    setObjectValue(kommune.id, {
      visible: true,
      editing: true,
    });
    openPanel({ content: "grunnkretser", kommune });

    // hvis ikke endret fra før, endre nå
    if (!kommuneValues.editing) {
      if (kommuneValues.visible) {
        removeGrunnkretserFromLayer("grunnkretser");
      }

      addGrunnkretserToLayer("edit");
    }
  };

  const toggleGrunnkretser = () => {
    const newVisible = !kommuneValues.visible;
    setObjectValue(kommune.id, {
      visible: newVisible,
      editing: false,
    });

    const layerId: LayerId = kommuneValues.editing ? "edit" : "grunnkretser";

    if (newVisible) {
      addGrunnkretserToLayer("grunnkretser");
    } else {
      // hvis ikke lenger skal være synlig
      removeGrunnkretserFromLayer(layerId);
      closePanel();
    }
  };

  return (
    <KommuneWrapper>
      <Button
        onClick={toggleGrunnkretser}
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
        onClick={openGrunnkretserPanel}
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
