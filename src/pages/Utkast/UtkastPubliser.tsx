import { Icon, MenuItem, useDisclosure } from "@kvib/react";
import { UtkastResponse } from "types/api";
import UtkastPubliserModal from "components/Modals/UtkastPubliserModal";
import { useUtkastEndringer } from "components/Endringslogg/hooks/useUtkastEndringer";

type Props = {
  utkast: UtkastResponse;
};

const UtkastPubliser = ({ utkast }: Props) => {
  const { harEndringer } = useUtkastEndringer(utkast);
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <MenuItem icon={<Icon icon="publish" />} onClick={onOpen} isDisabled={!harEndringer}>
        Publiser
      </MenuItem>
      <UtkastPubliserModal isOpen={isOpen} onClose={onClose} utkast={utkast} />
    </>
  );
};

export default UtkastPubliser;
