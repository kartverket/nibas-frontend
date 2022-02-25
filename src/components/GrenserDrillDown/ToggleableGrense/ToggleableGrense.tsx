import { useCallback, useEffect } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import { ObjectValue, EditingType } from "../useEditGrenser";
import Button from "components/Button";
import { GrenseId } from "hooks/layers/types";
import { ReactComponent as InfoIcon } from "icons/info.svg";
import { ReactComponent as VisibilityIcon } from "icons/visibility.svg";
import { ReactComponent as VisibilityOffIcon } from "icons/visibility_off.svg";
import { RotGrense } from "types/api";
import {
  addFeaturesToSource,
  removeFeaturesFromSource,
} from "utils/map/source";

export const layerIdByGrenseType: Record<EditingType, GrenseId> = {
  fylke: "fylker",
  kommune: "kommuner",
};

type Props<T extends RotGrense> = {
  grense: T;
  setObjectValue: (objectKey: string, value: ObjectValue) => void;
  objectValue: ObjectValue | undefined;
  title: string;
  type: EditingType;
  features: Feature<Geometry>[] | null;
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
  useEffect(() => {
    // hvis features skal være synlig, hent features
    if (!objectValue.visible && !objectValue.editing) return;

    if (!features) {
      fetchFeatures();
    }
  }, [objectValue, features, fetchFeatures]);

  const setInserted = useCallback(
    (newInserted: boolean) => {
      setObjectValue(grense.id, {
        ...objectValue,
        inserted: newInserted,
      });
    },
    [grense.id, objectValue, setObjectValue]
  );

  useEffect(() => {
    if (!features || !objectValue.inserted || objectValue.visible) return;

    const layerId = layerIdByGrenseType[type];

    // fjern lag hvis finnes
    removeFeaturesFromSource("edit", features);
    // removeFeaturesFromSource(layerId, features);

    setInserted(false);
  }, [features, objectValue, type, setInserted]);

  useEffect(() => {
    if (!features || objectValue.inserted) return;

    if (!objectValue.visible) return;

    const layerId = objectValue.editing ? "edit" : layerIdByGrenseType[type];

    addFeaturesToSource(layerId, features);

    setInserted(true);
  }, [objectValue, features, type, setInserted]);

  const toggleVisible = async () => {
    setObjectValue(grense.id, {
      ...objectValue,
      visible: !objectValue.visible,
    });
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
      <label>
        <input
          type="checkbox"
          checked={objectValue.editing ?? false}
          onChange={toggleEditing}
        />
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
