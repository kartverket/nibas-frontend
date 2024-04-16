import { styled } from "styled-components";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Skeleton,
  Stack,
} from "@kvib/react";
import { EndringsloggGrunnkretsendringer } from "./EndringsloggGrunnkretsendringer";
import { EndringsloggStemmekretsendringer } from "./EndringsloggStemmekretsendringer";
import { useUtkastEndringer } from "./hooks/useUtkastEndringer";
import { UtkastResponse } from "types/api";
import { UlagredeEndringer } from "./UlagredeEndringer";
import { useHistory } from "contexts/HistoryContext/HistoryContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  utkast: UtkastResponse;
};

const EndringsloggModal = ({ isOpen, onClose, utkast }: Props) => {
  const { harEndringer, laster, stemmekretsendringer, grunnkretsendringer } = useUtkastEndringer(utkast);
  const { history } = useHistory();
  const harUlagredeEndringer = history.entries.length > 0;
  const harLastetData = !laster || !!stemmekretsendringer || !!grunnkretsendringer;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <WideModalContent>
        <ModalHeader>Endringer i dette utkastet</ModalHeader>
        <ModalCloseButton aria-label="Lukk" />
        <ModalBody>
          {!harEndringer && !harUlagredeEndringer && <Empty>Det er ingen endringer i dette utkastet</Empty>}
          <Stack spacing={6}>
            <UlagredeEndringer history={history} harLagredeEndringer={harEndringer} />
            {stemmekretsendringer?.map((endringer) => (
              <Skeleton key={endringer.kommune.id} isLoaded={harLastetData}>
                <EndringsloggStemmekretsendringer endringer={endringer} />
              </Skeleton>
            ))}
            {grunnkretsendringer?.map((endringer) => (
              <Skeleton key={endringer.kommune.id} isLoaded={harLastetData}>
                <EndringsloggGrunnkretsendringer endringer={endringer} />
              </Skeleton>
            ))}
          </Stack>
        </ModalBody>
      </WideModalContent>
    </Modal>
  );
};

const Empty = styled.div`
  margin-bottom: 16px;
`;

const WideModalContent = styled(ModalContent)`
  max-width: 800px;
`;

export default EndringsloggModal;
