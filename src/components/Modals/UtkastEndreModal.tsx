import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormLabel,
  FormHelperText,
  Input,
  ModalFooter,
  ButtonGroup,
  Button,
  FormControl,
} from "@kvib/react";
import { useHistory } from "contexts/HistoryContext";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { UtkastResponse } from "types/api";
import { UtkastRequestWithoutOperations } from "contexts/UtkastContext/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  utkast: UtkastResponse;
};

type UtkastFormData = {
  navn: string;
};

const fromFormToRequest = (
  form: UtkastFormData,
  utkast: UtkastResponse
): UtkastRequestWithoutOperations => ({
  ...utkast,
  navn: form.navn,
  endringstype: utkast.endringstype,
  version: utkast.version,
});

const UtkastEndreModal = ({ isOpen, onClose, utkast }: Props) => {
  const { addHistoryEntry } = useHistory();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { isDirty },
  } = useForm<UtkastFormData>({ defaultValues: { navn: utkast.navn } });

  const previousValues = useRef<UtkastFormData>(getValues());

  // TODO: det her fungerer ikke, vil vi bruke history til det uansett?
  const editUtkast = () => {
    addHistoryEntry({
      type: "utkast",
      changes: [
        {
          from: fromFormToRequest(previousValues.current, utkast),
          to: fromFormToRequest(getValues(), utkast),
          id: utkast.id,
        },
      ],
    });
    previousValues.current = getValues();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Endre detaljer</ModalHeader>
        <ModalCloseButton aria-label="Lukk" />
        <ModalBody>
          <Form onSubmit={handleSubmit(editUtkast)}>
            <Section>
              <FormLabel>Navn på utkastet</FormLabel>
              <FormHelperText>
                Velg et beskrivende navn som gjør at andre kan forstå hva
                utkastet inneholder.
              </FormHelperText>
              <Input
                placeholder="f.eks. Sammenslåing av Rosenborg og Sentrum i Trondheim"
                {...register("navn")}
              />
            </Section>
          </Form>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="outline" colorScheme="gray" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit" isDisabled={!isDirty}>
              Endre detaljer
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Section = styled(FormControl)`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: var(--kvib-fontWeights-bold);
  }

  & > * {
    margin: 0;
  }
`;

export default UtkastEndreModal;
