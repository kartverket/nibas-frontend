import Modal from "components/Modal";
import { useTranslation } from "react-i18next";
import { ModalOverlay, CustomModalWrapper } from "components/Modal/Modal";
import styled from "styled-components";
import { EndringsloggStemmekretsendringer } from "components/Endringslogg/EndringsloggStemmekretsendringer";
import { useUtkastEndringer } from "./hooks/useUtkastEndringer";
import { EndringsloggGrunnkretsendringer } from "./EndringsloggGrunnkretsendringer";

type EndringsloggModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const EndringsloggModal = ({
  isOpen,
  onClose,
}: EndringsloggModalProps) => {
  const { t } = useTranslation();
  const { harEndringer, stemmekretsendringer, grunnkretsendringer } =
    useUtkastEndringer();

  // TODO: Blir endret i PR fra Anders
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayElement={(props, overlayChildren) => (
        <ModalOverlay {...props}>{overlayChildren}</ModalOverlay>
      )}
      contentElement={(props, contentChildren) => (
        <ModalWrapper {...props}>{contentChildren}</ModalWrapper>
      )}
      className="_"
      overlayClassName="_"
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

      {grunnkretsendringer?.map((endringer) => (
        <EndringsloggGrunnkretsendringer
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

const ModalWrapper = styled(CustomModalWrapper)`
  min-width: 800px;
  max-width: 1000px;
  padding: 40px;
  border-radius: 15px;
`;

const ModalHeader = styled.h2`
  margin: 0;
  font-size: 18px;
`;
