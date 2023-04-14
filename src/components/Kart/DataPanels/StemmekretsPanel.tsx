import { Panel, PanelProps } from "./Panel";

const StemmekretsPanel = ({ isOpen, className }: PanelProps) => {
  return (
    <Panel isOpen={isOpen} className={className}>
      StemmekretsPanel
    </Panel>
  );
};

export default StemmekretsPanel;
