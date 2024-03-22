import HeaderButton, { HeaderSection } from "./HeaderButton";
import { useDisclosure } from "@kvib/react";
import UtkastSlettModal from "components/Modals/UtkastSlettModal";
import UtkastPubliserModal from "components/Modals/UtkastPubliserModal";
import { useUtkastEndringer } from "components/Endringslogg/hooks/useUtkastEndringer";
import { UtkastResponse } from "types/api";
import { useOverlayPanel } from "contexts/OverlayPanelContext";

const HeaderUtkastOperations = ({ utkast }: { utkast: UtkastResponse }) => {
  const { harEndringer } = useUtkastEndringer(utkast);
  const { isOpen: isPubliserOpen, onClose: onPubliserClose, onOpen: onPubliserOpen } = useDisclosure();
  const { isOpen: isSlettOpen, onClose: onSlettClose, onOpen: onSlettOpen } = useDisclosure();

  const { openOverlayPanel } = useOverlayPanel();

  return (
    <HeaderSection>
      <HeaderButton
        label="Publiser utkast"
        icon="upload"
        onClick={onPubliserOpen}
        isDisabled={!harEndringer}
        tooltip={{ text: "Valider og publiser endringer i utkastet" }}
      />
      <HeaderButton
        label="Valider og publiser utkast"
        icon="checklist"
        onClick={() => openOverlayPanel("validerpubliser")}
        isDisabled={!harEndringer}
        tooltip={{ text: "Valider og publiser endringer i utkastet" }}
      />
      <HeaderButton
        label="Slett utkast"
        icon="delete"
        onClick={onSlettOpen}
        tooltip={{ text: "Slett utkastet og alle endringene i dette utkastet" }}
      />
      <UtkastPubliserModal isOpen={isPubliserOpen} onClose={onPubliserClose} utkast={utkast} />
      <UtkastSlettModal isOpen={isSlettOpen} onClose={onSlettClose} utkast={utkast} />
    </HeaderSection>
  );
};

export default HeaderUtkastOperations;
