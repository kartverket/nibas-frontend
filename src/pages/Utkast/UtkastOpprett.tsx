import {
  Button,
  Modal,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogCloseTrigger,
  ModalBody,
  DialogFooter,
  ButtonGroup,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  useToast,
  FormErrorMessage,
  Datepicker,
} from "@kvib/react";
import { createUtkast } from "api/utkast";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { endringstyper } from "pages/Kart/constants";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { ApiErrorResponse } from "types/api";
import { statusCode } from "utils/api";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { format } from "date-fns";

type UtkastFormData = {
  navn: string;
  endringstype: string;
  gyldigFra: string;
};

const UtkastOpprett = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthentication();
  const toast = useToast();
  const navigate = useNavigate();
  const { setError } = useErrorHandling();

  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
    reset,
    control,
  } = useForm<UtkastFormData>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { navn: "", endringstype: "", gyldigFra: "" },
  });

  const handleCloseModal = () => {
    reset();
    onClose();
  };

  const opprettUtkast = async () => {
    setIsLoading(true);
    const response = await createUtkast(
      {
        navn: getValues("navn"),
        endringstype: getValues("endringstype"),
        gyldigFra: getValues("gyldigFra"),
      },
      token,
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

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl" isCentered>
        <DialogBackdrop />
        <DialogContent>
          <form onSubmit={handleSubmit(opprettUtkast)}>
            <DialogHeader>Opprett et nytt utkast</DialogHeader>
            <DialogCloseTrigger />
            <ModalBody>
              <FormContent>
                <FormSection isInvalid={!!errors.navn}>
                  <FormLabel>Navn på utkastet</FormLabel>
                  <FormHelperText>
                    Velg et beskrivende navn som gjør at andre kan forstå hva utkastet inneholder.
                  </FormHelperText>

                  <Input
                    {...register("navn", { required: "Du må gi utkastet et navn" })}
                    type="text"
                    placeholder="f.eks. Sammenslåing av Rosenborg og Sentrum i Trondheim"
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
                <FormSection isInvalid={!!errors.gyldigFra}>
                  <FormLabel>Gyldig fra-dato</FormLabel>
                  <FormHelperText>Kun grenser gyldige fra datoen du velger vil være synlige i kartet.</FormHelperText>
                  <Controller
                    control={control}
                    rules={{ required: "Du må velge en gyldig fra-dato for utkastet" }}
                    name="gyldigFra"
                    render={({ field: { onChange } }) => {
                      return (
                        <Datepicker
                          fromDate={new Date()}
                          onChange={(e): void => {
                            onChange(format(e.target.value, "yyyy-MM-dd"));
                          }}
                        />
                      );
                    }}
                  />
                  {!!errors.gyldigFra && <FormErrorMessage errorMessage={errors.gyldigFra.message} />}
                </FormSection>
              </FormContent>
            </ModalBody>
            <DialogFooter>
              <ButtonGroup>
                <Button variant="tertiary" onClick={handleCloseModal}>
                  Avbryt
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Opprett utkast
                </Button>
              </ButtonGroup>
            </DialogFooter>
          </form>
        </DialogContent>
      </Modal>
    </>
  );
};

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

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
