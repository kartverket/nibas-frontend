import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Stack,
} from "@kvib/react";
import { FeatureProperties } from "types/api";
import { useFlateForm } from "../hooks/useFlateForm";
import { Flatedata } from "contexts/OverlayPanelContext";
import useFylker from "hooks/inndelinger/useFylker";

const FlateOpprettelseAlert = () => {
  return (
    <Alert>
      <AlertIcon />
      <div>
        <AlertTitle>Flate og grense må være av samme type</AlertTitle>
        <AlertDescription>
          Du kan kun opprette en ny flate tilsvarende grensen du redigerer.
          Ønsker du å opprette en annen type flate må du redigere en annen type
          grense.
        </AlertDescription>
      </div>
    </Alert>
  );
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  featureProps: FeatureProperties;
  flatedata: Flatedata;
}

export const FlateFormModal = ({
  isOpen,
  onClose,
  featureProps,
  flatedata,
}: Props) => {
  const { type, flateRegisters, reset, isDirty, updateDraftFromFeature } =
    useFlateForm(featureProps);

  const { fylker } = useFylker();

  const resetAndCloseModal = () => {
    reset();
    onClose();
  };

  const getTypeNavnFormatted = (
    typeString: "GRUNNKRETS" | "STEMMEKRETS" | null,
    capitalized?: boolean,
    singularForm?: boolean,
    suffix?: string,
  ) => {
    if (typeString) {
      let formattedType = typeString.toLowerCase();

      if (capitalized) {
        formattedType =
          formattedType.charAt(0).toUpperCase() + formattedType.slice(1);
      }

      if (singularForm) {
        formattedType += "en";
      }

      if (suffix) {
        formattedType += suffix;
      }

      return formattedType;
    }
    return "";
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndCloseModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Opprett ny {getTypeNavnFormatted(type)}
          flate
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={6}>
            <FlateOpprettelseAlert />
            <Card variant="filled">
              <CardBody>
                <Stack spacing={6}>
                  <Heading size="sm">
                    {getTypeNavnFormatted(type, true, true)} vil bli en del av:
                  </Heading>
                  <Text>{`Kommune: ${
                    flatedata?.navn[0].navn ?? "Ukjent"
                  }`}</Text>
                  <Text>{`Fylke: ${
                    fylker?.find(
                      (fylke) =>
                        fylke.fylkesnummer.kodeverdi ===
                        flatedata?.kommunenummer.kodeverdi.slice(0, 2),
                    )?.navn[0].navn ?? "Ukjent"
                  }`}</Text>
                </Stack>
              </CardBody>
            </Card>
            <FormControl>
              <FormLabel>
                {getTypeNavnFormatted(type, true, false, "navn")}
              </FormLabel>
              <Input
                placeholder={`Navnet til den nye ${getTypeNavnFormatted(
                  type,
                  false,
                  true,
                )}`}
                size="md"
                variant="outline"
                {...flateRegisters.navn}
              />
              <FormErrorMessage>
                Du må skrive et navn for den nye{" "}
                {getTypeNavnFormatted(type, false, true)}
              </FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>
                {getTypeNavnFormatted(type, true, false, "nummer")}
              </FormLabel>
              <InputGroup>
                {type === "GRUNNKRETS" && (
                  <InputLeftAddon>
                    {flatedata?.kommunenummer.kodeverdi ?? "Ukjent prefiks"}
                  </InputLeftAddon>
                )}
                <Input
                  placeholder={`Nummeret til den nye ${getTypeNavnFormatted(
                    type,
                    false,
                    true,
                  )}`}
                  size="md"
                  variant="outline"
                  {...flateRegisters.nummer}
                />
              </InputGroup>
              <FormErrorMessage>
                Du må skrive et nummer for den nye{" "}
                {getTypeNavnFormatted(type, false, true)}
              </FormErrorMessage>
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="ghost" onClick={resetAndCloseModal}>
              Avbryt
            </Button>
            <Button
              disabled={!isDirty}
              colorScheme="blue"
              mr={3}
              onClick={() => updateDraftFromFeature()}
            >
              Opprett flate
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
