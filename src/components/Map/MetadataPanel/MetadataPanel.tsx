import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import { MapInteractable } from "../MapInteractable";

type Props = {
  selectedFeatures: Feature<Geometry>[];
};

const MetadataPanel = ({ selectedFeatures }: Props) => {
  // kun vis metadata hvis én feature er selected
  // det gir ikke mening å vise metadata for flere på en gang
  if (selectedFeatures.length !== 1) return null;

  const singleFeature = selectedFeatures[0];

  return <Panel>{singleFeature.getProperties().administrativEnhet.navn}</Panel>;
};

const Panel = styled(MapInteractable)`
  grid-area: metadata;
`;

export default MetadataPanel;
