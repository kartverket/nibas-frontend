import StemmekretserPanel from "../OverlayPanels/StemmekretserPanel";
import { Panel, PanelProps } from "./Panel";

const StemmekretsPanel = ({ isOpen, className }: PanelProps) => {
  return (
    <Panel isOpen={isOpen} className={className}>
      <StemmekretserPanel />
    </Panel>
  );
};

export default StemmekretsPanel;
