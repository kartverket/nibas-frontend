import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";

export const SplittPanel = ({ isOpen, className }: PanelProps) => {
  const { activeOverlayPanel, closeOverlayPanel } = useOverlayPanel();

  return (
    <SidePanel $isOpen={isOpen} className={className}>
      <PanelHeader
        onClose={closeOverlayPanel}
        subHeading={`Ved å splitte en krets kan du opprette en eller flere nye kretser`}
      >
        Splitt en inndeling
      </PanelHeader>
    </SidePanel>
  );
};
