import { useCallback, useEffect } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import { EditingType, ObjectValue } from "../EditGrenserContext";
import Button from "components/Button";
import { GrenseId } from "hooks/layers/types";
import { ReactComponent as InfoIcon } from "icons/info.svg";
import { ReactComponent as VisibilityIcon } from "icons/visibility.svg";
import { ReactComponent as VisibilityOffIcon } from "icons/visibility_off.svg";
import { RotGrense } from "types/api";
import {
  addFeaturesToSource,
  removeFeaturesFromSourceByIds,
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
};

const ToggleableGrense = <T extends RotGrense>({
  grense,
  setObjectValue,
  objectValue = {},
  title,
  type,
  features,
}: Props<T>) => {
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
    if (!features) return;

    if (objectValue.inserted && !objectValue.visible) {
      // hvis laget er satt inn og IKKE synlig lenger, fjern fra layer
      // og sett at det ikke er satt inn
      const layerId = layerIdByGrenseType[type];

      // vi vet ikke hvilket lag features lå i før det fjernes, så vi fjerner fra begge
      removeFeaturesFromSourceByIds("edit", features);
      removeFeaturesFromSourceByIds(layerId, features);

      setInserted(false);
    } else if (!objectValue.inserted && objectValue.visible) {
      // hvis laget IKKE satt inn og skal være synlig, sett inn i layer
      // og sett at det er satt inn
      const layerId = objectValue.editing ? "edit" : layerIdByGrenseType[type];

      addFeaturesToSource(layerId, features);
      setInserted(true);
    }
  }, [features, objectValue, type, setInserted]);

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
