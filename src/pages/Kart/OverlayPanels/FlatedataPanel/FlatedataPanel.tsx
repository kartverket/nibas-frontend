import { Modal, ModalContent, ModalOverlay } from "@kvib/react";
import { ModalPanel, PanelHeader, PanelProps } from "../Panel";
import { useOverlayPanel } from "contexts/OverlayPanelContext";

const FlatedataPanel = ({ isOpen }: PanelProps) => {
  const { closeOverlayModal } = useOverlayPanel();
  return (
    <Modal isOpen={isOpen} onClose={closeOverlayModal} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent as={ModalPanel} $isOpen={isOpen}>
        <PanelHeader onClose={closeOverlayModal}>TODO Flateinformasjon TODO</PanelHeader>
        <p>Empty state? Loader?</p>
      </ModalContent>
    </Modal>
  );
};

export default FlatedataPanel;
