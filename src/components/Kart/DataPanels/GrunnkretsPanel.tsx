import { Panel, PanelProps } from "./Panel";

const GrunnkretsPanel = ({ isOpen, className }: PanelProps) => {
  return (
    <Panel isOpen={isOpen} className={className}>
      GrunnkretsPanel
    </Panel>
  );
};

export default GrunnkretsPanel;
