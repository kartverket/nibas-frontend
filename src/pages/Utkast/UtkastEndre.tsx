import { MenuItem, useDisclosure } from "@kvib/react";
import Icon from "components/Icon";
import UtkastEndreModal from "components/Modals/UtkastEndreModal";
import { UtkastResponse } from "types/api";

type Props = {
  utkast: UtkastResponse;
};

const UtkastEndre = ({ utkast }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <MenuItem
        icon={<Icon icon="edit" />}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        Endre detaljer
      </MenuItem>
      <UtkastEndreModal isOpen={isOpen} onClose={onClose} utkast={utkast} />
    </>
  );
};

export default UtkastEndre;
