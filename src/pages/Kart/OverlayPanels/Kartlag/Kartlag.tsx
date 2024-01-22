import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import { KartlagId } from "hooks/layers/types";
import { Icon, Text } from "@kvib/react";
import { styled } from "styled-components";

type Props = {
  layerId: KartlagId;
};

const Kartlag = ({ layerId }: Props) => {
  const { mappedLayers } = useKartlag();
  const mappedLayer = mappedLayers.find((ml) => ml.sourceId === layerId);
  if (!mappedLayer) {
    return null;
  }

  const subLayers = mappedLayer.layers;
  if (!subLayers) {
    return null;
  }

  return (
    <KartlagContainer>
      {subLayers.length > 1 ? (
        <div>
          <KartlagHeader>
            <Text>{mappedLayer.title}</Text>
            <Icon icon="arrow_drop_down"></Icon>
          </KartlagHeader>
          {subLayers.map((layer) => (
            <KartlagLayer key={layer.id}>{layer.title}</KartlagLayer>
          ))}
        </div>
      ) : (
        <KartlagHeader>
          <Text>Solo: {mappedLayer.title}</Text>
          <Icon icon="arrow_drop_down"></Icon>
        </KartlagHeader>
      )}
    </KartlagContainer>
  );
};

const KartlagContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(228, 241, 248, 1);
  padding: 8px;
  font-weight: bold;
  border-radius: 8px;
`;

const KartlagHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
`;

const KartlagLayer = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
`;

export default Kartlag;
