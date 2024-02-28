import { Checkbox, Radio } from "@kvib/react";
import { MappedLayer, useKartlag } from "contexts/KartlagContext/KartlagContext";
import { styled } from "styled-components";

type Props = {
  indexPath: number[];
  mappedLayer: MappedLayer;
};

// TODO: denne må kanskje også ha en opacity-slider hvis det er et mainlayer?
const KartlagInner = ({ indexPath, mappedLayer }: Props) => {
  const { toggleLayer } = useKartlag();

  const handleToggle = () => {
    toggleLayer(mappedLayer, indexPath);
  };

  // TODO: WMTS-lag skal ha radio button, ikke checkbox, selvsagt.
  return (
    <Container>
      {mappedLayer.type === "wmts" ? (
        <Radio isChecked={mappedLayer.isVisible} onChange={handleToggle}>
          {mappedLayer.title}
        </Radio>
      ) : (
        <Checkbox isChecked={mappedLayer.isVisible} onChange={handleToggle}>
          {mappedLayer.title}
        </Checkbox>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 16px;
  background: var(--kvib-colors-chakra-body-bg);
  border-radius: 8px;
`;

export default KartlagInner;
