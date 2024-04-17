import { styled } from "styled-components";
import {
  useToast,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  ModalFooter,
  ButtonGroup,
  Button,
  Datepicker,
  FormLabel,
} from "@kvib/react";
import { publishUtkast } from "api/utkast";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { datestringToFormattedDatestring } from "pages/Kart/OverlayPanels/GrenseinformasjonPanel/grenseinformasjon-utils";
import { EndringsloggAccordion } from "pages/Utkast/UtkastEndringslogg";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { isToday, format } from "date-fns";
import { ApiErrorResponse, UtkastResponse } from "types/api";
import { statusCode } from "utils/api";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { useMatch, useNavigate } from "react-router-dom";
import { routes } from "utils/routes";
import { isAdministrativGrense } from "utils/grenser";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { isGrenseType } from "utils/type-utils";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  utkast: UtkastResponse;
};

const UtkastPubliserModal = ({ isOpen, onClose, utkast }: Props) => {
  const toast = useToast();
  const { closeUtkast } = useUtkast();
  const [publiseringsdato, setPubliseringsdato] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthentication();
  const { setError } = useErrorHandling();
  const { mutate } = useSWRConfig();
  const navigate = useNavigate();
  const utkastPathMatch = useMatch(`${routes.utkast}/${routes.utkastId}`);

  const { clearInndelingerAndSources } = useInndelinger();

  const cleanUpUtkast = () => {
    mutate(["/v1/utkast", token]);

    // Mutate alle grense-ressurser som kan ha vært endret
    // revalidate: false gjør at grensedata er satt til undefined når man forsøker å hente grensene på nytt igjen
    mutate(
      (key) =>
        Array.isArray(key) &&
        typeof key[0] === "string" &&
        (key[0].endsWith("/grenser") ||
          key[0].endsWith("/stemmekretsgrenser") ||
          key[0].endsWith("/grunnkretsgrenser")),
      undefined,
      { revalidate: false },
    );
  };

  const publiserUtkast = async () => {
    setIsLoading(true);
    const publiseringDateString = format(publiseringsdato, "yyyy-MM-dd");

    const response = await publishUtkast(utkast.id, publiseringDateString, token);
    setIsLoading(false);

    const publishDateText = isToday(publiseringsdato)
      ? "umiddelbart"
      : datestringToFormattedDatestring(publiseringDateString);

    if (statusCode.isSuccessful(response.status)) {
      toast({
        status: "success",
        title: "Utkast publisert",
        description: `Endringene trer i kraft ${publishDateText}.`,
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

  const utkastHarEndringAdministrativeGrenser = (): boolean => {
    const endredeFeatures = utkast.operasjoner.grenseendringer.endredeFeatures;

    return Object.values(endredeFeatures).some(
      (feature) => isGrenseType(feature.properties.type) && isAdministrativGrense(feature.properties.type),
    );
  };

  return (
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
                Endringene i utkastet vil bli tilgjengelig for alle etter den valgte publiseringsdatoen.
              </AlertDescription>
            </div>
          </Alert>

          {
            // TODO Fjern når vi har delt geometri?
            utkastHarEndringAdministrativeGrenser() && (
              <Alert status="warning">
                <AlertIcon />
                <div>
                  <AlertTitle>Utkastet ditt inneholder endringer på administrative grenser</AlertTitle>
                  <AlertDescription>
                    Pass på at du er sikker på endringene dine, og husk å gjøre tilsvarende endring for både
                    grunnkretsgrense og stemmekretsgrense.
                  </AlertDescription>
                </div>
              </Alert>
            )
          }
          <EndringsloggAccordion utkast={utkast} />
          <Datepickerlabel>
            Fra hvilken dato skal endringene utkastet tre i kraft?
            <Datepicker
              fromDate={new Date()}
              defaultSelected={new Date()}
              onChange={(event) => setPubliseringsdato(new Date(event.target.value))}
            />
          </Datepickerlabel>
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

const Datepickerlabel = styled(FormLabel)`
  margin-bottom: 16px;
`;

export default UtkastPubliserModal;
