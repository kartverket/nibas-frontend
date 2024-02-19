import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import KartlagInner from "./KartlagInner";
import KartlagOuter from "./KartlagOuter";
import { styled } from "styled-components";
import { IconButton } from "@kvib/react";
import { MappedLayer } from "utils/getLayersFromWMS";

type Props = {
  index: number;
  mappedLayer: MappedLayer;
  maxIndex: number;
};

const Kartlag = ({ mappedLayer, index, maxIndex }: Props) => {
  const { moveLayer } = useKartlag();

  return (
    <Container>
      <ArrowButtons>
        <IconButton
          variant="secondary"
          size="sm"
          icon="arrow_upward"
          aria-label="Flytt kartlag opp"
          onClick={() => moveLayer("up", mappedLayer.sourceId)}
          isDisabled={index === 0}
        />
        <IconButton
          variant="secondary"
          size="sm"
          icon="arrow_downward"
          aria-label="Flytt kartlag ned"
          onClick={() => moveLayer("down", mappedLayer.sourceId)}
          isDisabled={index === maxIndex}
        />
      </ArrowButtons>
      {mappedLayer.layers.length > 0 ? (
        <KartlagOuter mappedLayer={mappedLayer} />
      ) : (
        <KartlagInner mappedLayer={mappedLayer} isMainLayer />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ArrowButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export default Kartlag;
