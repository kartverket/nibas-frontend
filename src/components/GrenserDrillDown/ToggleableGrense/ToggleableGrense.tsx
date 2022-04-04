import { useCallback, useEffect } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import { EditingType, ObjectValue } from "../EditGrenserContext";
import Checkbox from "components/Checkbox";
import Button from "components/form/Button";
import { GrenseId } from "hooks/layers/types";
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

    const { inserted, editing, visible } = objectValue;

    if (inserted) {
      if (!visible) {
        // hvis laget er satt inn og IKKE synlig lenger, fjern fra layer
        // og sett at det ikke er satt inn
        const layerId = layerIdByGrenseType[type];

        // vi vet ikke hvilket lag features lå i før det fjernes, så vi fjerner fra begge
        removeFeaturesFromSourceByIds("edit", features);
        removeFeaturesFromSourceByIds(layerId, features);

        setInserted(false);
      } else if (editing) {
        // hvis laget er satt inn, synlig, og redigerbart, gikk det fra å bare være synlig til redigerbart
        // fjern fra gamle laget og legg til i edit
        const layerId = layerIdByGrenseType[type];

        removeFeaturesFromSourceByIds(layerId, features);
        addFeaturesToSource("edit", features);
      }
    } else {
      if (visible) {
        // hvis laget IKKE satt inn og skal være synlig, sett inn i layer
        // og sett at det er satt inn
        const layerId = editing ? "edit" : layerIdByGrenseType[type];

        addFeaturesToSource(layerId, features);

        setInserted(true);
      }
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
