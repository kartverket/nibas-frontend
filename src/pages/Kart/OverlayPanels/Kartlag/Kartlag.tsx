import { MappedLayer, useKartlag } from "contexts/KartlagContext/KartlagContext";
import KartlagInner from "./KartlagInner";
import KartlagOuter from "./KartlagOuter";
import { styled } from "styled-components";
import { IconButton } from "@kvib/react";

type Props = {
  index: number;
  maxIndex: number;
  mappedLayer: MappedLayer;
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
      {mappedLayer.sublayers.length > 0 ? (
        <KartlagOuter indexPath={[index]} mappedLayer={mappedLayer} />
      ) : (
        <KartlagInner indexPath={[index]} mappedLayer={mappedLayer} />
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
