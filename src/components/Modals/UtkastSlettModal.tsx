import { styled } from "styled-components";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@kvib/react";
import { ApiErrorResponse, UtkastResponse } from "types/api";
import { EndringsloggAccordion } from "pages/Utkast/UtkastEndringslogg";
import { deleteUtkast } from "api/utkast";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { useState } from "react";
import { statusCode } from "utils/api";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { useMatch, useNavigate } from "react-router-dom";
import { routes } from "utils/routes";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useUtkasts } from "hooks/inndelinger/useUtkasts";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  utkast: UtkastResponse;
};

const UtkastSlettModal = ({ isOpen, onClose, utkast }: Props) => {
  const { closeUtkast } = useUtkast();
  const { mutate } = useUtkasts();
  const [isLoading, setIsLoading] = useState(false);
  const { setError } = useErrorHandling();
  const navigate = useNavigate();
  const utkastPathMatch = useMatch(`${routes.utkast}/${routes.utkastId}`);

  const { clearInndelingerAndSources } = useInndelinger();

  const slettUtkast = async () => {
    setIsLoading(true);
    const response = await deleteUtkast(utkast.id);
    setIsLoading(false);

    if (statusCode.isSuccessful(response.status)) {
      await mutate();
      closeUtkast();
      clearInndelingerAndSources();

      if (utkastPathMatch) {
        navigate(routes.utkast);
      }
    } else if (statusCode.isError(response.status)) {
      const wrapper = (await response.json()) as ApiErrorResponse;
      setError({
        title: wrapper.errorDescription.title,
        description: wrapper.errorDescription.description,
        additionalInfo: wrapper.errorDescription.additionalInfo ?? undefined,
        errorCode: wrapper.errorCode,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Slett utkast</ModalHeader>
        <ModalCloseButton />
        <Body>
          <Alert status="warning">
            <AlertIcon />
            <div>
              <AlertTitle>Er du sikker på at du vil slette utkastet?</AlertTitle>
              <AlertDescription>
                Alle endringene som er gjort i utkastet vil forsvinne. Denne handlingen kan ikke angres.
              </AlertDescription>
            </div>
          </Alert>
          <EndringsloggAccordion utkast={utkast} isOpen={isOpen} />
        </Body>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="tertiary" onClick={onClose}>
              Avbryt
            </Button>
            <Button colorScheme="red" isLoading={isLoading} onClick={slettUtkast}>
              Slett utkast
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Body = styled(ModalBody)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export default UtkastSlettModal;
