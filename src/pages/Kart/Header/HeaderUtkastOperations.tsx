import { styled } from "styled-components";
import HeaderButton from "./HeaderButton";
import { useDisclosure } from "@kvib/react";
import UtkastSlettModal from "components/Modals/UtkastSlettModal";
import UtkastPubliserModal from "components/Modals/UtkastPubliserModal";
import { useUtkastEndringer } from "components/Endringslogg/hooks/useUtkastEndringer";
import { UtkastResponse } from "types/api";

const HeaderUtkastOperations = ({ utkast }: { utkast: UtkastResponse }) => {
  const { harEndringer } = useUtkastEndringer(utkast);
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

  return (
    <Section>
      <HeaderButton
        label="Publiser utkast"
        icon="upload"
        onClick={onPubliserOpen}
        isDisabled={!harEndringer}
        tooltip={{ text: "Publiser alle endringene i dette utkastet" }}
      />
      <HeaderButton
        label="Slett utkast"
        icon="delete"
        onClick={onSlettOpen}
        tooltip={{ text: "Slett utkastet og alle endringene i dette utkastet" }}
      />
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
