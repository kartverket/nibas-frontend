import styled from "styled-components";
import RecursiveLayer from "./RecursiveLayer";
import { MapInteractable } from "components/Map/MapInteractable";
import { MainMappedLayer } from "utils/getLayersFromWMS";

type Props = {
  editingLayer: MainMappedLayer;
  closeMenu: () => void;
};

const BakgrunnskartOptions = ({ editingLayer, closeMenu }: Props) => {
  const mainLayerSourceId = editingLayer.sourceId;

  return (
    <BakgrunnslagOptions>
      <button onClick={closeMenu}>Lukk</button>
      <RecursiveLayer
        mappedLayer={editingLayer}
        indent={0}
        mainLayerSourceId={mainLayerSourceId}
      />
    </BakgrunnslagOptions>
  );
};

const BakgrunnslagOptions = styled(MapInteractable)`
  height: 500px;
  width: 300px;
  overflow: auto;
`;

export default BakgrunnskartOptions;
