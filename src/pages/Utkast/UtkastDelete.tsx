import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  ButtonGroup,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@kvib/react";
import Icon from "components/Icon";
import { ApiErrorResponse, UtkastResponse } from "types/api";
import styled from "styled-components";
import { useState } from "react";
import { deleteUtkast } from "api/utkast";
import { statusCode } from "utils/api";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { mutate } from "swr";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { EndringsloggAccordion } from "./UtkastEndringslogg";

type Props = {
  utkast: UtkastResponse;
};

const UtkastDelete = ({ utkast }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { setError } = useErrorHandling();

  const slettUtkast = async () => {
    setIsLoading(true);
    const response = await deleteUtkast(utkast.id, tokenHolderFunc()?.token);
    setIsLoading(false);

    if (statusCode.isSuccessful(response.status)) {
      await mutate(["/v1/utkast", tokenHolderFunc()?.token]);
    } else if (statusCode.isError(response.status)) {
      const wrapper = (await response.json()) as ApiErrorResponse;
      setError({ ...wrapper.errorDescription, errorCode: wrapper.errorCode });
    }
  };

  return (
    <>
      <MenuItem
        icon={<Icon icon="delete" />}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        Slett
      </MenuItem>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Slett utkast</ModalHeader>
          <ModalCloseButton />
          <Body>
            <Alert status="warning">
              <AlertIcon />
              <div>
                <AlertTitle>
                  Ved å slette utkastet mister du alle endringene som er gjort i
                  utkastet.
                </AlertTitle>
                <AlertDescription>
                  Denne handlingen kan ikke angres.
                </AlertDescription>
              </div>
            </Alert>
            <EndringsloggAccordion utkast={utkast} />
          </Body>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="outline" onClick={onClose} colorScheme="gray">
                Avbryt
              </Button>
              <Button
                colorScheme="red"
                isLoading={isLoading}
                onClick={slettUtkast}
              >
                Slett utkast
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const Body = styled(ModalBody)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export default UtkastDelete;
