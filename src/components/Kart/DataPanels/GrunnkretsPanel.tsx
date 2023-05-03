import GrunnkretserPanel from "../OverlayPanels/GrunnkretserPanel";
import { Panel, PanelProps } from "./Panel";

const GrunnkretsPanel = ({ isOpen, className }: PanelProps) => {
  return (
    <Panel isOpen={isOpen} className={className}>
      <GrunnkretserPanel />
    </Panel>
  );
};

export default GrunnkretsPanel;
