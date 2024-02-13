import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import { SplitForm } from "./SplitForm";

export const SplittPanel = ({ isOpen, className }: PanelProps) => {
  const { closeOverlayPanel } = useOverlayPanel();

  return (
    <SidePanel $isOpen={isOpen} className={className}>
      <PanelHeader
        onClose={closeOverlayPanel}
        subHeading={`Ved å splitte en flate kan du opprette en eller flere nye flater`}
      >
        Splitt en flate
      </PanelHeader>
      <SplitForm />
    </SidePanel>
  );
};
