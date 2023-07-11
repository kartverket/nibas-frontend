import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Skeleton,
} from "@kvib/react";
import { EndringsloggGrunnkretsendringer } from "./EndringsloggGrunnkretsendringer";
import { EndringsloggStemmekretsendringer } from "./EndringsloggStemmekretsendringer";
import { useUtkastEndringer } from "./hooks/useUtkastEndringer";
import { UtkastResponse } from "types/api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  utkast: UtkastResponse;
};

const EndringsloggModal = ({ isOpen, onClose, utkast }: Props) => {
  const { harEndringer, laster, stemmekretsendringer, grunnkretsendringer } =
    useUtkastEndringer(utkast);

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
export default EndringsloggModal;
