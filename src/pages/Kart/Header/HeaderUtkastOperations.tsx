import { useDisclosure } from "@kvib/react";
import { useUtkastEndringer } from "components/Endringslogg/hooks/useUtkastEndringer";
import UtkastPubliserModal from "components/Modals/UtkastPubliserModal";
import { UtkastResponse } from "types/api";
import HeaderButton, { HeaderSection } from "./HeaderButton";

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
