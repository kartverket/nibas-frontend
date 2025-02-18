import { Icon, MenuItem, useDisclosure } from "@kvib/react";
import { UtkastResponse } from "types/api";
import UtkastSlettModal from "components/Modals/UtkastSlettModal";

type Props = {
  utkast: UtkastResponse;
};

const UtkastSlett = ({ utkast }: Props) => {
  const { open, onClose, onOpen } = useDisclosure();

  return (
    <>
      <MenuItem icon={<Icon icon="delete" />} onClick={onOpen}>
        Slett
      </MenuItem>
      <UtkastSlettModal isOpen={open} onClose={onClose} utkast={utkast} />
    </>
  );
};

export default UtkastSlett;
