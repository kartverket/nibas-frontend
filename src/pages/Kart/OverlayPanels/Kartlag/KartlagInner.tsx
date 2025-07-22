import { Checkbox, IconButton, Radio } from "@kvib/react";
import { MappedLayer, useKartlag } from "contexts/KartlagContext/KartlagContext";
import { styled } from "styled-components";

type Props = {
  indexPath: number[];
  mappedLayer: MappedLayer;
  onDelete?: () => void;
};

const KartlagInner = ({ indexPath, mappedLayer, onDelete }: Props) => {
  const { toggleKartlag } = useKartlag();

  const handleToggle = () => {
    toggleKartlag(mappedLayer, indexPath);
  };

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
      {onDelete != null && (
        <IconButton colorScheme="red" icon="delete" onClick={onDelete} aria-label={"Slett kartlag"} variant="ghost" />
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: var(--kvib-colors-chakra-body-bg);
  border-radius: 8px;
`;

export default KartlagInner;
