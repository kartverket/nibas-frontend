import { styled } from "styled-components";
import {
  Alert,
  AlertDialogBody,
  AlertIcon,
  Button,
  ButtonGroup,
  Datepicker,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@kvib/react";
import { useValgtGyldighetsdato } from "../../../contexts/GyldighetsdatoContext";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gyldigTilDate: string) => void;
  gyldigTilDate?: string;
};

type FormType = {
  gyldigTilDate: Date;
};

const HistoriskeGrenserDatoModal = ({ isOpen, onClose, onSubmit, gyldigTilDate }: Props) => {
  const { gyldighetsdato } = useValgtGyldighetsdato();
  const defaultGyldigTilDate =
    gyldigTilDate != null ? new Date(gyldigTilDate) : gyldighetsdato != null ? new Date(gyldighetsdato) : new Date();
  const { setValue, handleSubmit } = useForm<FormType>({
    defaultValues: {
      gyldigTilDate: defaultGyldigTilDate,
    },
  });

  const onBekreft = (data: FormType) => {
    const valgtGyldigTilDate = data.gyldigTilDate ?? new Date();
    const valgtGyldigTilDateAsString = format(valgtGyldigTilDate, "yyyy-MM-dd");
    onSubmit(valgtGyldigTilDateAsString);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onBekreft)}>
          <ModalHeader>Vis grenser med gyldig-til dato</ModalHeader>
          <ModalCloseButton />
          <Body>
            <Alert>
              <AlertIcon />
              <AlertDialogBody>
                Velg samme dato som grensene du ønsker å hente inn utgikk. For eksempel, dersom de historiske grensene
                ble arkivert 01.01.2020, velg samme dato. Det er kun grensene med samme gyldig til-dato som vil vises.
              </AlertDialogBody>
            </Alert>
            <div>
              <DatepickerHeading>Velg gyldig til-dato</DatepickerHeading>
              <Datepickerlabel htmlFor="datepicker">
                Kun grenser gyldig på datoen du velger vil være synlige i kartet.
              </Datepickerlabel>
              <Datepicker
                id="datepicker"
                defaultSelected={defaultGyldigTilDate}
                onChange={(e) => setValue("gyldigTilDate", new Date(e.target.value))}
              />
            </div>
          </Body>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="tertiary" onClick={onClose}>
                Avbryt
              </Button>
              <Button type="submit" colorScheme="blue">
                Hent og vis grenser
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

const Body = styled(ModalBody)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DatepickerHeading = styled.p`
  font-size: 17px;
  font-weight: 900;
  margin-top: 12px;
  margin-bottom: 8px;
`;

const Datepickerlabel = styled(FormLabel)`
  margin-bottom: 8px;
  color: var(--kvib-colors-gray-500);
  font-weight: 600;
  display: block;
  width: 100%;
`;

export default HistoriskeGrenserDatoModal;
