import { useUtkastEndringer } from "./hooks/useUtkastEndringer";
import { EndringsloggGrunnkretsendringer } from "./EndringsloggGrunnkretsendringer";
import { EndringsloggStemmekretsendringer } from "./EndringsloggStemmekretsendringer";
import { Skeleton } from "@kvib/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

type EndringsloggModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const EndringsloggModal = ({
  isOpen,
  onClose,
}: EndringsloggModalProps) => {
  const { harEndringer, laster, stemmekretsendringer, grunnkretsendringer } =
    useUtkastEndringer();

  const harLastetData =
    !laster || !!stemmekretsendringer || !!grunnkretsendringer;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Endringer i dette utkastet</ModalHeader>
        <ModalCloseButton aria-label="Lukk" />
        <ModalBody>
          {!harEndringer && <div>Det er ingen endringer i dette utkastet</div>}

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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
