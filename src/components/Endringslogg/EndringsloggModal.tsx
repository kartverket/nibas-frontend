import { Modal, ModalContent } from "components/Modal";
import { styled } from "styled-components";
import { useUtkastEndringer } from "./hooks/useUtkastEndringer";
import { EndringsloggGrunnkretsendringer } from "./EndringsloggGrunnkretsendringer";
import { EndringsloggStemmekretsendringer } from "./EndringsloggStemmekretsendringer";
import CloseButton from "../form/CloseButton";
import { Skeleton } from "@kvib/react";

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
      onRequestClose={onClose}
      modalElement={ModalWrapper}
      aria={{
        labelledby: "utkast-endringer-modal-header",
        describedby: "utkast-endringer-modal-description",
      }}
    >
      <ModalHeader>
        <ModalTittel id="utkast-endringer-modal-header">
          Endringer i dette utkastet
        </ModalTittel>
        <CloseButton onClick={onClose} aria-label="Lukk" />
      </ModalHeader>

      {!harEndringer && <div>Det er ingen endringer i dette utkastet</div>}

      <ScrollableContent>
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
      </ScrollableContent>
    </Modal>
  );
};

const ModalWrapper = styled(ModalContent)`
  max-width: 700px;
  padding: 40px;
  border-radius: 15px;
  background: var(--white);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.15);
`;

const ScrollableContent = styled.section`
  max-height: 70vh;
  overflow-y: auto;
`;

const ModalTittel = styled.h2`
  margin: 0;
  font-size: 18px;
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;
