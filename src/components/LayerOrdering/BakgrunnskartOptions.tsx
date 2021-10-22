import styled from "styled-components";
import { MapInteractable } from "components/Map/MapInteractable";
import { MappedLayer } from "utils/getLayersFromWMS";

type Props = {
  editingLayer: MappedLayer;
  closeMenu: () => void;
};

const BakgrunnskartOptions = ({ editingLayer, closeMenu }: Props) => {
  return (
    <BakgrunnslagOptions>
      <button onClick={closeMenu}>Lukk</button>
      <RecursiveLayer mappedLayer={editingLayer} indent={0} />
    </BakgrunnslagOptions>
  );
};

const BakgrunnslagOptions = styled(MapInteractable)`
  height: 500px;
  width: 300px;
  overflow: auto;
`;

type RecursiveLayerProps = {
  mappedLayer: MappedLayer;
  indent: number;
};

const RecursiveLayer = ({ mappedLayer, indent }: RecursiveLayerProps) => {
  return (
    <div style={{ marginLeft: indent * 8 }}>
      <p>{mappedLayer.title}</p>
      {mappedLayer.layers.map((subMappedLayer, i) => (
        <RecursiveLayer
          key={`${mappedLayer.title}-${i}`}
          mappedLayer={subMappedLayer}
          indent={indent + 1}
        />
      ))}
    </div>
  );
};

export default BakgrunnskartOptions;
