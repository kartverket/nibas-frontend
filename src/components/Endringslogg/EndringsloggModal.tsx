import { styled } from "styled-components";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  Spinner,
} from "@kvib/react";
import { useUtkastEndringer } from "./hooks/useUtkastEndringer";
import { UtkastResponse } from "types/api";
import { UnsavedEndringerCollapse } from "./UlagredeEndringer/UnsavedEndringerCollapse";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { EndringerForKommune } from "components/Endringslogg/EndringerForKommune";
import { EndringList } from "components/Endringslogg/EndringerList";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  utkast: UtkastResponse;
};

const EndringsloggModal = ({ isOpen, onClose, utkast }: Props) => {
  const { harEndringer, laster, stemmekretsendringer, grunnkretsendringer } = useUtkastEndringer(utkast);
  const { history } = useHistory();
  const harUlagredeEndringer = history.index > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Endringslogg</ModalHeader>
        <ModalCloseButton aria-label="Lukk" />
        <ModalBody>
          {!harEndringer && !harUlagredeEndringer && <Empty>Det er ingen endringer i dette utkastet</Empty>}
          <Stack spacing={6}>
            <UnsavedEndringerCollapse expandedByDefault={!harEndringer} />
            {laster && <Spinner size="xl" />}
            <EndringList>
              {stemmekretsendringer?.map((endringer) => (
                <EndringerForKommune key={endringer.kommune.id} endringer={endringer} kretstype="STEMMEKRETS" />
              ))}
              {grunnkretsendringer?.map((endringer) => (
                <EndringerForKommune key={endringer.kommune.id} endringer={endringer} kretstype="GRUNNKRETS" />
              ))}
            </EndringList>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const Empty = styled.div`
  margin-bottom: 16px;
`;

export default EndringsloggModal;
