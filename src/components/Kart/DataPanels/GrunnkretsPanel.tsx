import GrunnkretserPanel from "../OverlayPanels/GrunnkretserPanel";
import { Panel, PanelHeader, PanelProps } from "./Panel";

const GrunnkretsPanel = ({ isOpen, className, onClose }: PanelProps) => {
  return (
    <Panel isOpen={isOpen} className={className}>
      <PanelHeader onClose={onClose}>Endre kretsdetaljer</PanelHeader>
      <GrunnkretserPanel />
    </Panel>
  );
};

export default GrunnkretsPanel;
