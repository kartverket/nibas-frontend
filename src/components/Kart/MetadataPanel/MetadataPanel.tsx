import { useEffect, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import styled from "styled-components";
import { KartInteractable } from "../KartInteractable";
import MetadataContent from "./MetadataContent";
import Button from "components/form/Button";

type Props = {
  selectedFeatures: Feature<Geometry>[];
};

const MetadataPanel = ({ selectedFeatures }: Props) => {
  const [visible, setVisible] = useState(false);
  const [singleFeature, setSingleFeature] = useState<Feature<Geometry> | null>(
    null
  );

  useEffect(() => {
    if (selectedFeatures.length === 1) {
      setSingleFeature(selectedFeatures[0]);
    } else {
      setSingleFeature(null);
    }
  }, [selectedFeatures]);

  useEffect(() => {
    setVisible(!!singleFeature);
  }, [singleFeature]);

  // kun vis metadata hvis én feature er selected
  // det gir ikke mening å vise metadata for flere på en gang
  if (!visible || !singleFeature) return null;

  return (
    <Panel>
      <h3>Linje metadata</h3>
      <MetadataContent feature={singleFeature} />
      <Button onClick={() => setVisible(false)}>Lukk</Button>
    </Panel>
  );
};

const Panel = styled(KartInteractable)`
  grid-area: metadata;
  border: 1px solid ${({ theme }) => theme.colors.grayLight};
  padding: 16px;
  overflow: auto;

  > h3 {
    margin-top: 0;
    margin-bottom: 16px;
  }
`;

export default MetadataPanel;
