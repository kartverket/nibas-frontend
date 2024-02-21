import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  ButtonGroup,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  useToast,
  FormErrorMessage,
} from "@kvib/react";
import { createUtkast } from "api/utkast";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { endringstyper } from "pages/Kart/constants";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { ApiErrorResponse } from "types/api";
import { statusCode } from "utils/api";

type UtkastFormData = {
  navn: string;
  endringstype: string;
};

const UtkastOpprett = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const { tokenHolderFunc } = useAuthenticationFlow();
  const toast = useToast();
  const navigate = useNavigate();
  const { setError } = useErrorHandling();

  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm<UtkastFormData>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { navn: "", endringstype: "" },
  });

  const opprettUtkast = async () => {
    setIsLoading(true);
    const response = await createUtkast(
      {
        navn: getValues("navn"),
        endringstype: getValues("endringstype"),
      },
      tokenHolderFunc()?.token,
    );
    setIsLoading(false);

    if (statusCode.isSuccessful(response.status)) {
      const json = await response.json();
      const utkastId = json.id;
      toast({ title: "Utkast opprettet", status: "success" });
      navigate(utkastId);
    } else if (statusCode.isError(response.status)) {
      const wrapper = (await response.json()) as ApiErrorResponse;
      setError({
        ...wrapper.errorDescription,
        errorCode: wrapper.errorCode,
      });
    }
  };

  return (
    <>
      <Button onClick={onOpen} leftIcon="add">
        Opprett et nytt utkast
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(opprettUtkast)}>
            <ModalHeader>Opprett et nytt utkast</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormContent onSubmit={handleSubmit(opprettUtkast)}>
                <FormSection isInvalid={!!errors.navn}>
                  <FormLabel>Navn på utkastet</FormLabel>
                  <FormHelperText>
                    Velg et beskrivende navn som gjør at andre kan forstå hva utkastet inneholder.
                  </FormHelperText>

                  <Input
                    {...register("navn", { required: "Utkastet må ha et navn" })}
                    type="text"
                    placeholder="f.eks. Sammenslåing av Rosenborg og Sentrum i Trondheim"
                  />
                  {!!errors.navn && <FormErrorMessage errorMessage={errors.navn.message} />}
                </FormSection>
                <FormSection isInvalid={!!errors.endringstype}>
                  <FormLabel>Endringstype</FormLabel>
                  <FormHelperText>Typen påvirker hvilke verktøy som er tilgjengelig under redigeringen.</FormHelperText>
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
                <Button variant="tertiary" onClick={handleSubmit(opprettUtkast)}>
                  Avbryt
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Opprett utkast
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
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

export default UtkastOpprett;
