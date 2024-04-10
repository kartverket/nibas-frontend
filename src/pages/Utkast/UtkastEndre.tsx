import { Icon, MenuItem, useDisclosure } from "@kvib/react";
import UtkastEndreModal from "components/Modals/UtkastEndreModal";
import { UtkastResponse } from "types/api";

type Props = {
  utkast: UtkastResponse;
};

const UtkastEndre = ({ utkast }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <MenuItem icon={<Icon icon="edit" />} onClick={onOpen}>
        Endre detaljer
      </MenuItem>
      <UtkastEndreModal isOpen={isOpen} onClose={onClose} utkast={utkast} />
    </>
  );
};

export default UtkastEndre;
