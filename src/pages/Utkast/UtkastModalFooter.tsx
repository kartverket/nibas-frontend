import { useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { ModalFooter, ButtonGroup, Button, useToast } from "@kvib/react";
import { publishUtkast, deleteUtkast } from "api/utkast";
import UtkastConflicts from "components/UtkastPanel/UtkastList/UtkastConflictModal/UtkastConflicts";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { getDateInFriendlyString } from "pages/Kart/OverlayPanels/MetadataPanel/utils";
import { useSWRConfig } from "swr";
import {
  FramtidigVersjonConflict,
  ConflictResponseWrapper,
  ApiErrorResponse,
  UtkastResponse,
} from "types/api";
import { statusCode } from "utils/api";
import { createSuccessToast } from "utils/components/toast";

type Props = {
  utkast: UtkastResponse;
  type: "Publiser" | "Slett" | null;
  onClose: () => void;
};

const UtkastModalFooter = ({ type, onClose, utkast }: Props) => {
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
    <ModalFooter>
      <ButtonGroup>
        <Button variant="outline" onClick={onClose} colorScheme="gray">
          Avbryt
        </Button>
        <Button
          isLoading={isLoading}
          colorScheme={type === "Slett" ? "red" : "blue"}
          onClick={() => {
            if (type === "Slett") {
              slettUtkast();
            } else if (type === "Publiser") {
              publiserUtkast();
            }
          }}
        >
          {type}
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
  );
};
export default UtkastModalFooter;
