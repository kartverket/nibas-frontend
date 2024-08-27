import { styled } from "styled-components";
import {
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
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { useForm } from "react-hook-form";
import { format, parseISO } from "date-fns";
import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { resetMapView } from "utils/map/map-utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type FormType = {
  dato: Date | undefined;
};

const VelgVisningsdatoModal = ({ isOpen, onClose }: Props) => {
  const { gyldighetsdato, setGyldighetsdato } = useValgtGyldighetsdato();
  const { resetKartlag } = useKartlag();
  const { clearInndelingerAndSources } = useInndelinger();

  const defeaultDato = gyldighetsdato != null ? new Date(gyldighetsdato) : undefined;
  const { setValue, handleSubmit } = useForm<FormType>({
    defaultValues: {
      dato: defeaultDato,
    },
  });

  const onBekreft = (data: FormType) => {
    const valgtDato = data.dato ?? new Date();
    const valgtDatoAsString = format(valgtDato, "yyyy-MM-dd");
    setGyldighetsdato(valgtDatoAsString);
    clearInndelingerAndSources();
    resetKartlag();
    resetMapView();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onBekreft)}>
          <ModalHeader>Velg visningsdato</ModalHeader>
          <ModalCloseButton />
          <Body>
            <div>
              <DatepickerHeading>Gyldig fra-dato</DatepickerHeading>
              <Datepickerlabel htmlFor="datepicker">
                Kun grenser gyldig på datoen du velger vil være synlige i kartet.
              </Datepickerlabel>
              <Datepicker
                id="datepicker"
                fromDate={parseISO("2023-11-07")}
                defaultSelected={defeaultDato}
                onChange={(e) => setValue("dato", new Date(e.target.value))}
              />
            </div>
          </Body>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="tertiary" onClick={onClose}>
                Avbryt
              </Button>
              <Button type="submit" colorScheme="blue">
                Bekreft dato
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

export default VelgVisningsdatoModal;
