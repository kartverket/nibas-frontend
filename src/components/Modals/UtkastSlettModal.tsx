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
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { deleteUtkast } from "api/utkast";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { useState } from "react";
import { mutate } from "swr";
import { statusCode } from "utils/api";
import { useUtkast } from "contexts/UtkastContext";
import { useMatch, useNavigate } from "react-router-dom";
import { routes } from "utils/routes";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    utkast: UtkastResponse;
};

const UtkastSlettModal = ({ isOpen, onClose, utkast }: Props) => {
    const { closeUtkast } = useUtkast();
    const [isLoading, setIsLoading] = useState(false);
    const { tokenHolderFunc } = useAuthenticationFlow();
    const { setError } = useErrorHandling();
    const navigate = useNavigate();
    const utkastPathMatch = useMatch(`${routes.utkast}/${routes.utkastId}`);

    const slettUtkast = async () => {
        setIsLoading(true);
        const response = await deleteUtkast(utkast.id, tokenHolderFunc()?.token);
        setIsLoading(false);

        if (statusCode.isSuccessful(response.status)) {
            await mutate(["/v1/utkast", tokenHolderFunc()?.token]);
            closeUtkast();

            if (utkastPathMatch) {
                navigate(routes.utkast);
            }
        } else if (statusCode.isError(response.status)) {
            const wrapper = (await response.json()) as ApiErrorResponse;
            setError({ ...wrapper.errorDescription, errorCode: wrapper.errorCode });
        }
    };

    return (
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
                                Ved å slette utkastet mister du alle endringene som er gjort i utkastet.
                            </AlertTitle>
                            <AlertDescription>Denne handlingen kan ikke angres.</AlertDescription>
                        </div>
                    </Alert>
                    <EndringsloggAccordion utkast={utkast} />
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
