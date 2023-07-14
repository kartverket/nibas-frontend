import { MenuItem, useDisclosure } from "@kvib/react";
import Icon from "components/Icon";
import { UtkastResponse } from "types/api";
import UtkastPubliserModal from "components/Modals/UtkastPubliserModal";

type Props = {
  utkast: UtkastResponse;
};

const UtkastPubliser = ({ utkast }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <MenuItem
        icon={<Icon icon="publish" />}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        Publiser
      </MenuItem>
      <UtkastPubliserModal isOpen={isOpen} onClose={onClose} utkast={utkast} />
    </>
  );
};

export default UtkastPubliser;
