import HeaderButton, { HeaderSection } from "./HeaderButton";
import { useDisclosure } from "@kvib/react";
import UtkastSlettModal from "components/Modals/UtkastSlettModal";
import UtkastPubliserModal from "components/Modals/UtkastPubliserModal";
import { useUtkastEndringer } from "components/Endringslogg/hooks/useUtkastEndringer";
import { UtkastResponse } from "types/api";

const HeaderUtkastOperations = ({ utkast }: { utkast: UtkastResponse }) => {
  const { harEndringer } = useUtkastEndringer(utkast);
  const { isOpen: isPubliserOpen, onClose: onPubliserClose, onOpen: onPubliserOpen } = useDisclosure();

  return (
    <HeaderSection>
      <HeaderButton
        label="Publiser endringer"
        onClick={onPubliserOpen}
        isDisabled={!harEndringer}
        variant="primary"
        tooltip={{ text: "Publiser alle endringene i dette utkastet" }}
      />
      <UtkastPubliserModal isOpen={isPubliserOpen} onClose={onPubliserClose} utkast={utkast} />
    </HeaderSection>
  );
};

export default HeaderUtkastOperations;
