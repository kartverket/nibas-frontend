import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
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
  useToast,
} from "@kvib/react";
import { publishUtkast } from "api/utkast";
import Icon from "components/Icon";
import UtkastConflicts from "components/UtkastConflictModal/UtkastConflicts";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { getDateInFriendlyString } from "pages/Kart/OverlayPanels/MetadataPanel/utils";
import { useState } from "react";
import styled from "styled-components";
import { useSWRConfig } from "swr";
import {
  ApiErrorResponse,
  ConflictResponseWrapper,
  FramtidigVersjonConflict,
  UtkastResponse,
} from "types/api";
import { statusCode } from "utils/api";
import { createSuccessToast } from "utils/components/toast";
import { EndringsloggAccordion } from "./UtkastEndringslogg";

type Props = {
  utkast: UtkastResponse;
};

const UtkastPubliser = ({ utkast }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { setError } = useErrorHandling();
  const { mutate } = useSWRConfig();
  const [conflictResponse, setConflictResponse] =
    useState<FramtidigVersjonConflict | null>(null);

  const cleanUpUtkast = () => {
    mutate(["/v1/utkast", tokenHolderFunc()?.token]);
  };

  const publiserUtkast = async () => {
    setIsLoading(true);
    const response = await publishUtkast(
      utkast.id,
      utkast,
      tokenHolderFunc()?.token
    );
    setIsLoading(false);

    const publishDateText =
      new Date(utkast.gyldigFra).getDay === new Date().getDay
        ? "umiddelbart"
        : getDateInFriendlyString(utkast.gyldigFra);

    if (statusCode.isSuccessful(response.status)) {
      toast(
        createSuccessToast(
          "Utkast publisert",
          `Endringene trer i kraft ${publishDateText}.`
        )
      );
      cleanUpUtkast();
    } else if (statusCode.isConflict(response.status)) {
      const wrapper = (await response.json()) as ConflictResponseWrapper;

      if (wrapper.framtidigVersjonConflict) {
        setConflictResponse(wrapper.framtidigVersjonConflict);
      } else {
        setError({
          title: "Utkastet er utdatert",
          description:
            "Du har gjort endringer på en gammel versjon av en krets. Du må gjennomføre endringene på nytt i et nytt utkast.",
        });
      }
    } else {
      try {
        const wrapper = (await response.json()) as ApiErrorResponse;
        setError({ ...wrapper.errorDescription, errorCode: wrapper.errorCode });
      } catch {
        // Dette kan skje om feilmeldingen av en eller annen grunn ikke er gyldig JSON eller ikke har nødvendige felter
        // F.eks. fordi feilen ikke er håndtert riktig på backend eller kommer fra en proxy eller annet mellom klienten og backenden
        setError({
          title: "Ukjent serverfeil",
          description:
            "En ukjent feil skjedde ved publisering av utkastet. Vennligst forsøk igjen, om problemet fortsetter er det fint om du tar kontakt med Kartverket.",
        });
      }
    }
  };

  return (
    <>
      <MenuItem
        icon={<Icon icon="publish" />}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        Publiser
      </MenuItem>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Publiser utkast</ModalHeader>
          <ModalCloseButton />
          <Body>
            <Alert status="info">
              <AlertIcon />
              <div>
                <AlertTitle>Du er i ferd med å publisere et utkast</AlertTitle>
                <AlertDescription>
                  Endringene i utkastet vil bli tilgjengelig for alle etter
                  publisering.
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
              <Button isLoading={isLoading} onClick={publiserUtkast}>
                Publiser utkast
              </Button>
              {conflictResponse && (
                <UtkastConflicts
                  utkastId={utkast.id}
                  conflictResponse={conflictResponse}
                  onCancel={() => setConflictResponse(null)}
                  close={() => setConflictResponse(null)}
                  onResolved={cleanUpUtkast}
                />
              )}
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

export default UtkastPubliser;
