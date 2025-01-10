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
  useToast,
} from "@kvib/react";
import { publishUtkast } from "api/utkast";
import { useAuthRenewError } from "components/Authentication/AuthRenewError";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { UnsavedEndringerCollapse } from "components/Endringslogg/UlagredeEndringer/UnsavedEndringerCollapse";
import { useUnsavedEndringer } from "components/Endringslogg/hooks/useUnsavedEndringer";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { format, isBefore, isSameDay } from "date-fns";
import { EndringsloggAccordion } from "pages/Utkast/UtkastEndringslogg";
import { useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { useSWRConfig } from "swr";
import { ApiErrorResponse, UtkastResponse } from "types/api";
import { statusCode } from "utils/api";
import { routes } from "utils/routes";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  utkast: UtkastResponse;
};

const UtkastPubliserModal = ({ isOpen, onClose, utkast }: Props) => {
  const toast = useToast();
  const { closeUtkast } = useUtkast();
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthentication();
  const { setError } = useErrorHandling();
  const { mutate } = useSWRConfig();
  const navigate = useNavigate();
  const utkastPathMatch = useMatch(`${routes.utkast}/${routes.utkastId}`);
  const { antallEndringer } = useUnsavedEndringer();
  const { setAuthRenewError } = useAuthRenewError();

  const { clearInndelingerAndSources } = useInndelinger();

  const cleanUpUtkast = () => {
    mutate(["/v1/utkast", token]);

    // Mutate alle ressurser som kan ha vært endret
    // revalidate: false gjør at grensedata er satt til undefined når man forsøker å hente grensene på nytt igjen
    mutate(() => true, undefined, { revalidate: false });
  };

  const isUtkastGyldigFraPast = isBefore(utkast.gyldigFra, format(new Date(), "yyyy-MM-dd"));

  const publiserUtkast = async () => {
    setIsLoading(true);

    const response = await publishUtkast(utkast.id, token);
    setIsLoading(false);

    if (statusCode.isSuccessful(response.status)) {
      toast({
        status: "success",
        title: "Utkast publisert",
        //Backend publiserer med dagens dato hvis utkastet sin gyldigFra-dato har passert.
        description: `Endringene trer i kraft ${isUtkastGyldigFraPast || isSameDay(utkast.gyldigFra, new Date()) ? "umiddelbart" : format(utkast.gyldigFra, "dd.MM.yyyy")}.`,
      });
      cleanUpUtkast();
      closeUtkast();
      clearInndelingerAndSources();

      if (utkastPathMatch) {
        navigate(routes.utkast);
      }
    } else if (statusCode.isConflict(response.status)) {
      setError({
        title: "Publisering av utkastet feilet",
        description:
          "Det oppstod en konflikt ved publisering av utkastet. Dette kan oppstå om to eller flere personer har jobbet samtidig på det samme utkastet, eller om utkastet allerede er publisert.\n\n Vennligst oppdater siden og forsøk publiseringen på nytt.",
      });
    } else if (statusCode.isForbidden(response.status)) {
      // antakelse om utløpt token
      setAuthRenewError(true);
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
            "En ukjent feil skjedde ved publisering av utkastet. Hvis feilen vedvarer, vennligst kontakt Kartverket.",
        });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Publiser utkast</ModalHeader>
        <ModalCloseButton />
        <Body>
          <Alert status={isUtkastGyldigFraPast ? "warning" : "info"}>
            <AlertIcon />
            <div>
              <AlertTitle>
                {`Endringene vil gjelde fra ${format(isUtkastGyldigFraPast ? new Date() : utkast.gyldigFra, "dd.MM.yyyy")}`}
              </AlertTitle>
              <AlertDescription>
                {isUtkastGyldigFraPast
                  ? `Datoen du satte på utkastet da du opprettet det har nå passert. Opprinnelig dato var satt som ${format(utkast.gyldigFra, "dd.MM.yyyy")}. Datoen er derfor blitt endret til dagens dato.`
                  : `Dersom du ikke ønsker at endringene skal tre i kraft på denne datoen, må du slette utkastet og opprette et nytt et med riktig dato. Endringene du har gjort i utkastet må dermed gjøres på nytt.`}
              </AlertDescription>
            </div>
          </Alert>

          {antallEndringer > 0 && <UnsavedEndringerCollapse />}
          <EndringsloggAccordion utkast={utkast} />
        </Body>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="tertiary" onClick={onClose}>
              Avbryt
            </Button>
            <Button isLoading={isLoading} onClick={publiserUtkast}>
              Publiser utkast
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
  gap: 24px;
`;

export default UtkastPubliserModal;
