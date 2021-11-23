import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import VectorLayer from "ol/layer/Vector";
import styled from "styled-components";
import { Grense } from "./types";
import { ObjectValue, EditingType } from "./useEditGrenser";
import { LayerId } from "hooks/layers/types";
import { GeometryVectorSource } from "hooks/sources/types";
import { getLayerById } from "utils/map/layers";
import {
  addFeaturesToSource,
  removeFeaturesFromSource,
} from "utils/map/source";

const layerIdByGrenseType: Record<EditingType, LayerId> = {
  fylke: "fylker",
  kommune: "kommuner",
};

type Props<T extends Grense> = {
  grense: T;
  setObjectValue: (objectKey: string, value: ObjectValue) => void;
  objectValue: ObjectValue | undefined;
  title: string;
  type: EditingType;
  canSelect: boolean;
  getFeaturesToAdd: (grense: T) => Promise<Feature<Geometry>[]>;
  getFeaturesToRemove: (
    grense: T,
    layerFeatures: Feature<Geometry>[]
  ) => Feature<Geometry>[];
};

const ToggleableGrense = <T extends Grense>({
  grense,
  setObjectValue,
  objectValue = {},
  title,
  type,
  canSelect,
  getFeaturesToAdd,
  getFeaturesToRemove,
}: Props<T>) => {
  const { visible = false, selected = false } = objectValue;

  const addGrenseToLayer = async (layerId: LayerId) => {
    const featuresToAdd = await getFeaturesToAdd(grense);

    addFeaturesToSource(layerId, featuresToAdd);
  };

  const removeGrenseFromLayer = async (layerId: LayerId) => {
    const grenseLayer = getLayerById(
      layerId
    ) as VectorLayer<GeometryVectorSource>;
    const source = grenseLayer.getSource();

    // om ingenting er satt inn i laget kan vi ikke fjerne noe fra det
    if (!source) return;

    const featuresInLayer = source.getFeatures();
    const grenseFeatures = getFeaturesToRemove(grense, featuresInLayer);

    removeFeaturesFromSource(layerId, grenseFeatures);
  };

  const handleVisibleClick = async () => {
    const layerId = layerIdByGrenseType[type];

    if (visible) {
      if (selected) {
        removeGrenseFromLayer("edit");
      } else {
        removeGrenseFromLayer(layerId);
      }
    } else {
      if (selected) {
        addGrenseToLayer("edit");
      } else {
        addGrenseToLayer(layerId);
      }
    }

    setObjectValue(title, {
      ...objectValue,
      visible: !objectValue?.visible,
    });
  };

  const handleOnChange = async () => {
    const layerId = layerIdByGrenseType[type];
    const newObjectValue = { ...objectValue };

    if (selected) {
      removeGrenseFromLayer("edit");

      if (visible) {
        newObjectValue.visible = false;
      }
    } else {
      addGrenseToLayer("edit");

      if (visible) {
        removeGrenseFromLayer(layerId);
      } else {
        newObjectValue.visible = true;
      }
    }

    newObjectValue.selected = !newObjectValue.selected;

    setObjectValue(title, newObjectValue);
  };

  const openInfo = () => {
    // todo
  };

  return (
    <Wrapper>
      <button onClick={handleVisibleClick}>{visible ? "Skjul" : "Vis"}</button>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => handleOnChange()}
        disabled={!canSelect}
        title={!canSelect ? "Kun ett tema kan redigeres på en gang" : ""}
      />
      <span>{title}</span>
      <button onClick={openInfo}>Metadata</button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;

  > span {
    flex: 1;
  }
`;

export default ToggleableGrense;
