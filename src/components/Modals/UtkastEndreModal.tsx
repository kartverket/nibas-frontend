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
  useToast,
} from "@kvib/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { styled } from "styled-components";
import { UtkastResponse } from "types/api";
import { useUtkast } from "contexts/UtkastContext";
import { useUtkasts } from "hooks/inndelinger/useUtkasts";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  utkast: UtkastResponse;
};

type UtkastFormData = {
  navn: string;
};

const UtkastEndreModal = ({ isOpen, onClose, utkast }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { isDirty },
  } = useForm<UtkastFormData>({ defaultValues: { navn: utkast.navn } });
  const { updateUtkast, getUpdateUtkastRequestFromHistory } = useUtkast();
  const toast = useToast();
  const { mutate } = useUtkasts();

  const previousValues = useRef<UtkastFormData>(getValues());

  const editUtkast = async () => {
    const currentUtkastWithHistory = getUpdateUtkastRequestFromHistory(); // returnerer null hvis det ikke er et utkast i utkastprovider
    if (currentUtkastWithHistory) {
      setIsLoading(true);
      const updatedUtkast = { ...currentUtkastWithHistory, navn: getValues("navn") };
      await updateUtkast(utkast.id, updatedUtkast);
      setIsLoading(false);
      onClose();
      previousValues.current = getValues();
      mutate();
    } else
      toast({
        status: "error",
        title: "Oppdatering av utkast feilet",
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(editUtkast)}>
          <ModalHeader>Endre detaljer</ModalHeader>
          <ModalCloseButton aria-label="Lukk" />
          <ModalBody>
            <Section>
              <FormLabel>Navn på utkastet</FormLabel>
              <FormHelperText>
                Velg et beskrivende navn som gjør at andre kan forstå hva utkastet inneholder.
              </FormHelperText>
              <Input placeholder="f.eks. Sammenslåing av Rosenborg og Sentrum i Trondheim" {...register("navn")} />
            </Section>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="tertiary" onClick={onClose}>
                Avbryt
              </Button>
              <Button type="submit" isDisabled={!isDirty} isLoading={isLoading}>
                Endre detaljer
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

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
