import { styled } from "styled-components";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
} from "@kvib/react";
import { useUtkastEndringer } from "./hooks/useUtkastEndringer";
import { UtkastResponse } from "types/api";
import { UnsavedEndringerCollapse } from "./UlagredeEndringer/UnsavedEndringerCollapse";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { EndringerForKommune } from "components/Endringslogg/EndringerForKommune";
import { KontekstType } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  utkast: UtkastResponse;
};

const EndringsloggModal = ({ isOpen, onClose, utkast }: Props) => {
  const { harEndringer, laster, stemmekretsendringer, grunnkretsendringer } = useUtkastEndringer(utkast);
  const { history } = useHistory();
  const harUlagredeEndringer = history.index > 0;
  const harLastetData = !laster || !!stemmekretsendringer || !!grunnkretsendringer;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Endringslogg</ModalHeader>
        <ModalCloseButton aria-label="Lukk" />
        <ModalBody>
          {!harEndringer && !harUlagredeEndringer && harLastetData && (
            <Empty>Det er ingen endringer i dette utkastet</Empty>
          )}
          <Stack spacing={6}>
            <UnsavedEndringerCollapse expandedByDefault={!harEndringer} />
            {!harLastetData && <Spinner size="xl" />}
            <EndringUnstyledList>
              {stemmekretsendringer?.map((endringer) => (
                <EndringerForKommune
                  key={endringer.kommune.id}
                  endringer={endringer}
                  kretstype={KontekstType.STEMMEKRETS}
                />
              ))}
              {grunnkretsendringer?.map((endringer) => (
                <EndringerForKommune
                  key={endringer.kommune.id}
                  endringer={endringer}
                  kretstype={KontekstType.GRUNNKRETS}
                />
              ))}
            </EndringUnstyledList>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const Empty = styled.div`
  margin-bottom: 16px;
`;

const EndringUnstyledList = styled.ul`
  list-style: none;
`;

export default EndringsloggModal;
