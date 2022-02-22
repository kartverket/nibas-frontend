import { useEffect } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import { ObjectValue, EditingType } from "../useEditGrenser";
import Button from "components/Button";
import { LayerId } from "hooks/layers/types";
import { ReactComponent as InfoIcon } from "icons/info.svg";
import { ReactComponent as VisibilityIcon } from "icons/visibility.svg";
import { ReactComponent as VisibilityOffIcon } from "icons/visibility_off.svg";
import { RotGrense } from "types/api";
import {
  addFeaturesToSource,
  removeFeaturesFromSource,
} from "utils/map/source";

const layerIdByGrenseType: Record<EditingType, LayerId> = {
  fylke: "fylker",
  kommune: "kommuner",
};

type Props<T extends RotGrense> = {
  grense: T;
  setObjectValue: (objectKey: string, value: ObjectValue) => void;
  objectValue: ObjectValue | undefined;
  title: string;
  type: EditingType;
  features: Feature<Geometry>[] | undefined;
  fetchFeatures: () => void;
};

const ToggleableGrense = <T extends RotGrense>({
  grense,
  setObjectValue,
  objectValue = {},
  title,
  type,
  features,
  fetchFeatures,
}: Props<T>) => {
  const { visible = false, editing = false } = objectValue;

  useEffect(() => {
    // hvis features skal være synlig, hent features
    if (!visible && !editing) return;

    if (!features || features.length === 0) {
      fetchFeatures();
    }
  }, [visible, editing, features, fetchFeatures]);

  useEffect(() => {
    if (!features) return;

    const layerId = layerIdByGrenseType[type];

    if (!visible) {
      // fjern lag hvis finnes
      removeFeaturesFromSource("edit", features);
      removeFeaturesFromSource(layerId, features);

      return;
    }

    if (editing) {
      // legg til i editing lag
      addFeaturesToSource("edit", features);
    } else {
      // legg til i layerId lag
      addFeaturesToSource(layerId, features);
    }
  }, [visible, editing, features, type]);

  const toggleVisible = async () => {
    setObjectValue(grense.id, {
      ...objectValue,
      visible: !objectValue?.visible,
    });
  };

  const toggleEditing = async () => {
    const newObjectValue = { ...objectValue };

    newObjectValue.editing = !newObjectValue.editing;

    if (visible && !editing) {
      newObjectValue.editing = true;
    } else if (!visible && editing) {
      newObjectValue.editing = false;
    } else {
      newObjectValue.visible = !newObjectValue.visible;
    }

    setObjectValue(grense.id, newObjectValue);
  };

  const openInfo = () => {
    // todo
  };

  return (
    <Wrapper>
      <Button onClick={toggleVisible} variant="icon">
        {visible ? (
          <VisibilityIcon aria-label="Synlig" />
        ) : (
          <VisibilityOffIcon aria-label="Usynlig" />
        )}
      </Button>
      <label>
        <input type="checkbox" checked={editing} onChange={toggleEditing} />
        {title}
      </label>
      <Button variant="icon" onClick={openInfo}>
        <ColoredInfo />
      </Button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  > label {
    flex: 1;
  }
`;

const ColoredInfo = styled(InfoIcon)`
  color: ${({ theme }) => theme.colors.blue};
`;

export default ToggleableGrense;
