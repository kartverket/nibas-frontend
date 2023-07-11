import styled from "styled-components";
import HeaderButton from "./HeaderButton";
import { useDisclosure } from "@kvib/react";
import UtkastSlettModal from "components/Modals/UtkastSlettModal";
import { useUtkast } from "contexts/UtkastContext";
import UtkastPubliserModal from "components/Modals/UtkastPubliserModal";

const HeaderUtkastOperations = () => {
  const { utkast } = useUtkast();
  const {
    isOpen: isPubliserOpen,
    onClose: onPubliserClose,
    onOpen: onPubliserOpen,
  } = useDisclosure();
  const {
    isOpen: isSlettOpen,
    onClose: onSlettClose,
    onOpen: onSlettOpen,
  } = useDisclosure();

  if (!utkast) return null;

  return (
    <Section>
      <HeaderButton
        label="Publiser utkast"
        icon="upload"
        onClick={onPubliserOpen}
      />
      <HeaderButton label="Slett utkast" icon="delete" onClick={onSlettOpen} />
      <UtkastPubliserModal
        isOpen={isPubliserOpen}
        onClose={onPubliserClose}
        utkast={utkast}
      />
      <UtkastSlettModal
        isOpen={isSlettOpen}
        onClose={onSlettClose}
        utkast={utkast}
      />
    </Section>
  );
};

const Section = styled.section`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export default HeaderUtkastOperations;
