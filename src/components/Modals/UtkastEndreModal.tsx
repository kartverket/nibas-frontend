import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
} from "@kvib/react";
import { endringstyper } from "pages/Kart/constants";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { styled } from "styled-components";
import { UtkastResponse } from "types/api";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { useUtkasts } from "hooks/inndelinger/useUtkasts";
import { statusCode } from "utils/api";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  utkast: UtkastResponse;
};

type UtkastFormData = {
  navn: string;
  endringstype: string;
};

const UtkastEndreModal = ({ isOpen, onClose, utkast }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<UtkastFormData>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { navn: utkast.navn, endringstype: utkast.endringstype },
  });
  const { updateUtkast } = useUtkast();

  const { mutate } = useUtkasts();

  const handleCloseModal = () => {
    reset();
    onClose();
  };

  const editUtkast = async () => {
    setIsLoading(true);
    const updatedUtkastStatusCode = await updateUtkast(
      utkast.id,
      { ...utkast, navn: getValues("navn"), endringstype: getValues("endringstype") },
      false,
    );

    const isUpdateSuccessfull = updatedUtkastStatusCode != null && statusCode.isSuccessful(updatedUtkastStatusCode);
    setIsLoading(false);
    if (isUpdateSuccessfull === true) {
      mutate();
      reset(getValues());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} isCentered size="2xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(editUtkast)}>
          <ModalHeader>Endre detaljer</ModalHeader>
          <ModalCloseButton aria-label="Lukk" />
          <ModalBody>
            <FormContent>
              <FormSection isInvalid={!!errors.navn}>
                <FormLabel>Navn på utkastet</FormLabel>
                <FormHelperText>
                  Velg et beskrivende navn som gjør at andre kan forstå hva utkastet inneholder.
                </FormHelperText>
                <Input
                  aria-label="utkast navn"
                  placeholder="f.eks. Sammenslåing av Rosenborg og Sentrum i Trondheim"
                  {...register("navn", { required: "Utkastet må ha et navn" })}
                />
                {!!errors.navn && <FormErrorMessage errorMessage={errors.navn.message} />}
              </FormSection>
              <FormSection isInvalid={!!errors.endringstype}>
                <FormLabel>Endringstype</FormLabel>
                <FormHelperText>
                  Velg en passende endringstype. Prøv å begrense endringene i hvert utkast til den valgte typen.
                </FormHelperText>
                <Select
                  placeholder="Velg en endringstype fra listen"
                  {...register("endringstype", { required: "Du må velge en endringstype for utkastet" })}
                >
                  {endringstyper.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                {!!errors.endringstype && <FormErrorMessage errorMessage={errors.endringstype.message} />}
              </FormSection>
            </FormContent>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="tertiary" onClick={handleCloseModal}>
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

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

// TODO: kvib har ikke 500-variant av mulish, bruker bold i mellomtiden
const FormSection = styled(FormControl)`
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
