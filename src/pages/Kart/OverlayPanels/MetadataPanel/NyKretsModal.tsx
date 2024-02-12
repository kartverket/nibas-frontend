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

import useFylker from "hooks/inndelinger/useFylker";
import { UseFormSetValue } from "react-hook-form";
import { useNyKretsForm } from "../hooks/useNyKretsForm";
import { KontekstType, Tilhorighet, TilhorighetForm } from "../hooks/tilhorighetUtils";
import { useOverlayPanel } from "contexts/OverlayPanelContext";

const FlateOpprettelseAlert = () => {
  return (
    <Alert>
      <AlertIcon />
      <div>
        <AlertTitle>Flate og grense må være av samme type</AlertTitle>
        <AlertDescription>
          Du kan kun opprette en ny flate tilsvarende grensen du redigerer. Ønsker du å opprette en annen type flate må
          du redigere en annen type grense.
        </AlertDescription>
      </div>
    </Alert>
  );
};

const getTypeNavnFormatted = (
  typeString: KontekstType,
  capitalized?: boolean,
  singularForm?: boolean,
  suffix?: string,
) => {
  if (typeString) {
    let formattedType = typeString.toLowerCase();

    if (capitalized) {
      formattedType = formattedType.charAt(0).toUpperCase() + formattedType.slice(1);
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  kontekstType: KontekstType;
  tilhorighet: Tilhorighet;
  setTilhorighet: (tilhorighet: Tilhorighet, value: string) => void;
}

export const NyKretsModal = ({ isOpen, onClose, kontekstType, tilhorighet, setTilhorighet }: Props) => {
  const { flateRegisters, reset, isDirty, updateDraftFromFeature } = useNyKretsForm(
    kontekstType,
    tilhorighet,
    setTilhorighet,
  );

  const { flatedata } = useOverlayPanel();

  const { fylker } = useFylker();

  const resetAndCloseModal = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndCloseModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Opprett ny {getTypeNavnFormatted(kontekstType)}
          flate
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={6}>
            <FlateOpprettelseAlert />
            <Card variant="filled">
              <CardBody>
                <Stack spacing={6}>
                  <Heading size="sm">{getTypeNavnFormatted(kontekstType, true, true)} vil bli en del av:</Heading>
                  <Text>{`Kommune: ${flatedata?.navn[0].navn ?? "Ukjent"}`}</Text>
                  <Text>{`Fylke: ${
                    fylker?.find(
                      (fylke) => fylke.fylkesnummer.kodeverdi === flatedata?.kommunenummer.kodeverdi.slice(0, 2),
                    )?.navn[0].navn ?? "Ukjent"
                  }`}</Text>
                </Stack>
              </CardBody>
            </Card>
            <FormControl>
              <FormLabel>{getTypeNavnFormatted(kontekstType, true, false, "navn")}</FormLabel>
              <Input
                placeholder={`Navnet til den nye ${getTypeNavnFormatted(kontekstType, false, true)}`}
                size="md"
                variant="outline"
                {...flateRegisters.navn}
              />
              <FormErrorMessage>
                Du må skrive et navn for den nye {getTypeNavnFormatted(kontekstType, false, true)}
              </FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>{getTypeNavnFormatted(kontekstType, true, false, "nummer")}</FormLabel>
              <InputGroup>
                {kontekstType === KontekstType.GRUNNKRETS && (
                  <InputLeftAddon>{flatedata?.kommunenummer.kodeverdi ?? "Ukjent prefiks"}</InputLeftAddon>
                )}
                <Input
                  placeholder={`Nummeret til den nye ${getTypeNavnFormatted(kontekstType, false, true)}`}
                  size="md"
                  variant="outline"
                  {...flateRegisters.nummer}
                />
              </InputGroup>
              <FormErrorMessage>
                Du må skrive et nummer for den nye {getTypeNavnFormatted(kontekstType, false, true)}
              </FormErrorMessage>
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="ghost" onClick={resetAndCloseModal}>
              Avbryt
            </Button>
            <Button disabled={!isDirty} colorScheme="blue" mr={3} onClick={() => updateDraftFromFeature()}>
              Opprett flate
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
