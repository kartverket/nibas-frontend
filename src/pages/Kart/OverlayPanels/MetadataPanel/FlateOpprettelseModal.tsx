import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
} from "@kvib/react";
import { FeatureProperties } from "types/api";

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
}

export const FlateOpprettelseModal = ({
  isOpen,
  onClose,
  featureProps,
}: Props) => {
  const flateType = featureProps.type.replace("grense", "");
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Opprett ny {flateType.toLowerCase()}
          flate
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={6}>
            <FlateOpprettelseAlert />
            <Card variant="filled">
              <CardHeader>
                <Heading size="sm">
                  Hvilken kommune skal {flateType.toLowerCase()}en tilhøre?
                </Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={6}>
                  <FormControl>
                    <FormLabel>Fylke</FormLabel>
                    <Select>
                      <option>Velg et fylke fra listen ...</option>
                    </Select>
                    <FormErrorMessage>Du må velge et fylke</FormErrorMessage>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Kommune</FormLabel>
                    <Select>
                      <option>Velg en kommune fra listen ...</option>
                    </Select>
                    <FormErrorMessage>Du må velge en kommune</FormErrorMessage>
                  </FormControl>
                </Stack>
              </CardBody>
            </Card>
            <FormControl>
              <FormLabel>{`${flateType}navn`}</FormLabel>

              <Input placeholder="Eksempel" size="md" variant="outline" />
              <FormErrorMessage>
                Du må skrive et navn for den nye {flateType}flaten
              </FormErrorMessage>
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <ButtonGroup>
            <Button variant="ghost" onClick={onClose}>
              Avbryt
            </Button>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Opprett flate
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
