import { useEffect, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import { EditingType, ObjectValue } from "../EditGrenserContext";
import Checkbox from "components/Checkbox";
import Button from "components/form/Button";
import { GrenseId, LayerId } from "hooks/layers/types";
import { ReactComponent as EditIcon } from "icons/edit.svg";
import { ReactComponent as VisibilityIcon } from "icons/visibility.svg";
import { ReactComponent as VisibilityOffIcon } from "icons/visibility_off.svg";
import { GrenseRef } from "types/api";
import {
  addFeaturesToSource,
  removeFeaturesFromSourceByIds,
} from "utils/map/source";

export const layerIdByGrenseType: Record<EditingType, GrenseId> = {
  fylke: "fylker",
  kommune: "kommuner",
  nasjon: "nasjoner",
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
  const [layerToAddTo, setLayerToAddTo] = useState<LayerId | null>(null);

  // sett features inn i layer når features har blitt hentet
  useEffect(() => {
    if (!layerToAddTo || !features) return;

    addFeaturesToSource(layerToAddTo, features);
    setLayerToAddTo(null);
  }, [layerToAddTo, features]);

  const toggleVisible = () => {
    const newObjectValue = {
      ...objectValue,
      visible: !objectValue.visible,
    };

    setObjectValue(grense.id, newObjectValue);

    const layerId = layerIdByGrenseType[type];

    if (!newObjectValue.visible) {
      if (!features) return;
      // hvis var synlig blir det nå usynlig, fjern fra begge lag

      if (newObjectValue?.editing) {
        removeFeaturesFromSourceByIds("edit", features);
      } else {
        removeFeaturesFromSourceByIds(layerId, features);
      }
    } else if (newObjectValue?.editing) {
      // hvis editing skal features legges tilbake til edit-laget
      setLayerToAddTo("edit");
    } else {
      setLayerToAddTo(layerId);
    }
  };

  const toggleEditing = async () => {
    const newObjectValue = { ...objectValue };

    newObjectValue.editing = !newObjectValue.editing;

    if (objectValue.visible && !objectValue.editing) {
      newObjectValue.visible = true;
    } else if (!objectValue.visible && objectValue.editing) {
      newObjectValue.visible = false;
    } else {
      newObjectValue.visible = !newObjectValue.visible;
    }

    setObjectValue(grense.id, newObjectValue);

    if (newObjectValue.visible) {
      // legg til i edit fordi dette er etter checkbox click
      setLayerToAddTo("edit");

      // hvis var synlig før editing ble true, fjern fra gamle layer
      if (!objectValue?.visible || !features) return;

      const layerId = layerIdByGrenseType[type];
      removeFeaturesFromSourceByIds(layerId, features);
    } else if (!newObjectValue.editing) {
      if (!features) return;

      removeFeaturesFromSourceByIds("edit", features);
    }
  };

  const openInfo = () => {
    // todo
  };

  return (
    <Wrapper>
      <Button onClick={toggleVisible} variant="icon">
        {objectValue.visible ? (
          <VisibilityIcon aria-label="Synlig" />
        ) : (
          <VisibilityOffIcon aria-label="Usynlig" />
        )}
      </Button>
      <StyledCheckbox
        label={title}
        type="checkbox"
        checked={objectValue.editing ?? false}
        onChange={toggleEditing}
      />
      <Button variant="icon" onClick={openInfo}>
        <ColoredInfo />
      </Button>
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
