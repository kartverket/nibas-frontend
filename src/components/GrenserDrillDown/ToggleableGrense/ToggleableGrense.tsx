import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import Checkbox from "components/Checkbox";
import Button from "components/form/Button";
import { EditingType, ObjectValue } from "contexts/EditGrenserContext";
import { useEditGrense } from "contexts/EditGrenserContext/useEditGrense";
import { GrenseId } from "hooks/layers/types";
import { ReactComponent as EditIcon } from "icons/edit.svg";
import { ReactComponent as VisibilityIcon } from "icons/visibility.svg";
import { ReactComponent as VisibilityOffIcon } from "icons/visibility_off.svg";
import { GrenseRef } from "types/api";

export const layerIdByGrenseType: Record<EditingType, GrenseId> = {
  fylke: "fylker",
  kommune: "kommuner",
  nasjon: "nasjoner",
  grunnkrets: "grunnkretser",
};

type Props<T extends GrenseRef> = {
  grense: T;
  setObjectValue: (objectKey: string, value: ObjectValue) => void;
  objectValue: ObjectValue | undefined;
  title: string;
  type: EditingType;
  features: Feature<Geometry>[] | null;
};

const ToggleableGrense = <T extends GrenseRef>({
  grense,
  setObjectValue,
  objectValue = {},
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
            <VisibilityIcon aria-label="Synlig" />
          ) : (
            <VisibilityOffIcon aria-label="Usynlig" />
          )
        }
      ></Button>
      <StyledCheckbox
        label={title}
        type="checkbox"
        checked={value.editing ?? false}
        onChange={toggleEditing}
      />
      <Button
        icon={<ColoredInfo />}
        onClick={openInfo}
        variant="unstyled"
      ></Button>
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

const ColoredInfo = styled(EditIcon)`
  color: ${({ theme }) => theme.colors.blue};
`;

export default ToggleableGrense;
