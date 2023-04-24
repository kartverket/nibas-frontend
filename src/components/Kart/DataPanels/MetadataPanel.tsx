// TODO: trenger en modal med litt innhold
// start med å bare lage et panel, også kan vi trekke ting ut etterhvert

// TODO: kommer sikkert også til å trenge en "DataPanels"-fil

import { Panel, PanelHeader, PanelProps } from "./Panel";

const MetadataPanel = ({ isOpen, className, onClose }: PanelProps) => {
  return (
    <Panel isOpen={isOpen} className={className}>
      <PanelHeader onClose={onClose}>Metadata for grense</PanelHeader>
      mettadatta
    </Panel>
  );
};

export default MetadataPanel;
