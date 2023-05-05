import StemmekretserPanel from "../OverlayPanels/StemmekretserPanel";
import { Panel, PanelHeader, PanelProps } from "./Panel";

const StemmekretsPanel = ({ isOpen, className, onClose }: PanelProps) => {
  return (
    <Panel isOpen={isOpen} className={className}>
      <PanelHeader onClose={onClose}>Endre kretsdetaljer</PanelHeader>
      <StemmekretserPanel />
    </Panel>
  );
};

export default StemmekretsPanel;
