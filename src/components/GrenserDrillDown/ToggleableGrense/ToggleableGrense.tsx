import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import Checkbox from "components/Checkbox";
import Button from "components/form/Button";
import Icon from "components/Icon";
import { EditingType } from "contexts/EditGrenserContext";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import { GrenseId } from "hooks/layers/types";
import { GrenseRef } from "types/api";

export const layerIdByGrenseType: Record<EditingType, GrenseId> = {
  fylke: "fylker",
  kommune: "kommuner",
  nasjon: "nasjoner",
  grunnkrets: "grunnkretser",
  stemmekrets: "stemmekretser",
};

type Props<T extends GrenseRef> = {
  grense: T;
  title: string;
  type: EditingType;
  features: Feature<Geometry>[] | null;
};

const ToggleableGrense = <T extends GrenseRef>({
  grense,
  title,
  type,
  features,
}: Props<T>) => {
  const { value, toggleVisible, toggleEditing } = useEditGrense(
    type,
    grense.id,
    features
  );

  const openInfo = () => {
    // todo
  };

  return (
    <Wrapper>
      <Button
        onClick={toggleVisible}
        variant="unstyled"
        icon={
          value.visible ? (
            <Icon icon="visibility" aria-label="Synlig" />
          ) : (
            <Icon icon="visibility_off" aria-label="Usynlig" />
          )
        }
      ></Button>
      <StyledCheckbox
        label={title}
        type="checkbox"
        checked={value.editing ?? false}
        onChange={toggleEditing}
      />
      <Button icon={<ColoredInfo />} onClick={openInfo} variant="unstyled" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 8px 0;

  > label {
    flex: 1;
  }
`;

const StyledCheckbox = styled(Checkbox)`
  margin-bottom: 0;
  margin-left: 4px;
`;

const ColoredInfo = styled(Icon).attrs(() => ({
  icon: "edit",
}))`
  color: ${({ theme }) => theme.colors.blue};
`;

export default ToggleableGrense;
