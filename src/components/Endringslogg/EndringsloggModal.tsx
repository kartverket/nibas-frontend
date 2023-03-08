import { Modal, ModalContent } from "components/Modal";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { EndringsloggStemmekretsendringer } from "components/Endringslogg/EndringsloggStemmekretsendringer";
import { useUtkastEndringer } from "./hooks/useUtkastEndringer";

type EndringsloggModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const EndringsloggModal = ({
  isOpen,
  onClose,
}: EndringsloggModalProps) => {
  const { t } = useTranslation();
  const { harEndringer, stemmekretsendringer } = useUtkastEndringer();

  // TODO: Blir endret i PR fra Anders
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      modalElement={ModalElement}
      aria={{
        labelledby: "utkast-endringer-modal-header",
        describedby: "utkast-endringer-modal-description",
      }}
    >
      <ModalHeader id="utkast-endringer-modal-header">
        {t("utkast.endringslogg.header")}
      </ModalHeader>
      {!harEndringer && <IngenEndringerMelding />}
      {stemmekretsendringer?.map((endringer) => (
        <EndringsloggStemmekretsendringer
          endringer={endringer}
          key={endringer.kommune.id}
        />
      ))}
    </Modal>
  );
};

const IngenEndringerMelding = () => {
  const { t } = useTranslation();

  return <div>{t("utkast.endringslogg.ingenEndringer")}</div>;
};

const ModalElement = styled(ModalContent)`
  min-width: 800px;
  max-width: 1000px;
  padding: 40px;
  border-radius: 15px;
  background: var(--white);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.h2`
  margin: 0;
  font-size: 18px;
`;
