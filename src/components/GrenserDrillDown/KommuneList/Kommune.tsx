import VectorLayer from "ol/layer/Vector";
import styled from "styled-components";
import { SimpleKommune } from "../types";
import { ObjectValue } from "../useEditGrenser";
import { fetchKommuneById } from "api/kommuner";
import { LayerId } from "hooks/layers/types";
import { GeometryVectorSource } from "hooks/sources/types";
import { geoJsonToSource } from "utils/map/geoJson";
import { getLayerById } from "utils/map/layers";
import {
  addFeaturesToSource,
  removeFeaturesFromSource,
} from "utils/map/source";

const addKommuneToLayer = async (layerId: LayerId, kommune: SimpleKommune) => {
  const json = await fetchKommuneById(kommune.id);
  const features = geoJsonToSource(json).getFeatures();

  addFeaturesToSource(layerId, features);
};

const removeKommuneFromLayer = async (
  layerId: LayerId,
  kommune: SimpleKommune
) => {
  const kommuneLayer = getLayerById(
    layerId
  ) as VectorLayer<GeometryVectorSource>;
  const source = kommuneLayer.getSource();

  // om ingenting er satt inn i laget kan vi ikke fjerne noe fra det
  if (!source) return;

  const featuresInLayer = source.getFeatures();
  const kommuneFeatures = featuresInLayer.filter(
    (feature) =>
      feature.getProperties().administrativEnhet.nummer ===
      kommune.kommunenummer
  );

  removeFeaturesFromSource(layerId, kommuneFeatures);
};

type Props = {
  kommune: SimpleKommune;
  setKommuneValue: (kommune: string, value: ObjectValue) => void;
  objectValue: ObjectValue | undefined;
};

const Kommune = ({ kommune, setKommuneValue, objectValue = {} }: Props) => {
  const { visible = false, selected = false } = objectValue;

  const handleVisibleClick = async () => {
    if (visible) {
      if (selected) {
        removeKommuneFromLayer("edit", kommune);
      } else {
        removeKommuneFromLayer("kommuner", kommune);
      }
    } else {
      if (selected) {
        addKommuneToLayer("edit", kommune);
      } else {
        addKommuneToLayer("kommuner", kommune);
      }
    }

    setKommuneValue(kommune.kommunenavn, {
      ...objectValue,
      visible: !objectValue?.visible,
    });
  };

  // edit kan se om kommunen er hentet allerede
  // om finnes, hent features og legg til i laget
  // ellers, hent dem og legg til
  // kan ikke være i både kommuner og edit lag på samme tid, må flyttes
  const handleOnChange = async () => {
    const newObjectValue = { ...objectValue };

    if (selected) {
      removeKommuneFromLayer("edit", kommune);

      if (visible) {
        newObjectValue.visible = false;
      }
    } else {
      addKommuneToLayer("edit", kommune);

      if (visible) {
        removeKommuneFromLayer("kommuner", kommune);
      } else {
        newObjectValue.visible = true;
      }
    }

    newObjectValue.selected = !newObjectValue.selected;

    setKommuneValue(kommune.kommunenavn, newObjectValue);
  };

  const openInfo = () => {
    // todo
  };

  return (
    <KommuneWrapper key={kommune.kommunenummer}>
      <button onClick={() => handleVisibleClick()}>
        {visible ? "Skjul" : "Vis"}
      </button>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => handleOnChange()}
      />
      <span>{kommune.kommunenavn}</span>
      <button onClick={() => openInfo()}>Metadata</button>
    </KommuneWrapper>
  );
};

const KommuneWrapper = styled.div`
  display: flex;

  > span {
    flex: 1;
  }
`;

export default Kommune;
