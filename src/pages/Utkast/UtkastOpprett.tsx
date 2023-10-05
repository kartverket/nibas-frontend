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
  Alert,
  AlertIcon,
  AlertDescription,
} from "@kvib/react";
import { createUtkast } from "api/utkast";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { useHistory } from "contexts/HistoryContext";
import { historyToUtkastOperations } from "contexts/UtkastContext/utils";
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
  const { history } = useHistory();
  const toast = useToast();
  const navigate = useNavigate();
  const { setError } = useErrorHandling();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { isDirty },
  } = useForm<UtkastFormData>();

  const opprettUtkast = async () => {
    setIsLoading(true);
    const response = await createUtkast(
      {
        navn: getValues("navn"),
        endringstype: getValues("endringstype"),
        operasjoner: historyToUtkastOperations(history),
      },
      tokenHolderFunc()?.token
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
          <ModalHeader>Opprett et nytt utkast</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Form onSubmit={handleSubmit(opprettUtkast)}>
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
              <Section>
                <FormLabel>Endringstype</FormLabel>
                <FormHelperText>
                  Typen påvirker hvilke verktøy som er tilgjengelig under
                  redigeringen.
                </FormHelperText>
                <Select
                  placeholder="Velg en endringstype fra listen"
                  {...register("endringstype")}
                >
                  {endringstyper.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </Section>
              <Section>
                <FormLabel>Gyldig fra-dato</FormLabel>
                <FormHelperText>
                  Når skal endringene tre i kraft (etter publisering)?
                </FormHelperText>
                <Input isDisabled placeholder="TODO" />
                <Alert>
                  <AlertIcon />
                  <AlertDescription>
                    Inndelingsbasen gjør det mulig å publisere endringer som
                    trer i kraft fram i tid. Datoen du velger her vil kun gjelde
                    dersom du publiserer utkastet. Vi vil aldri publisere en
                    endring automatisk.
                  </AlertDescription>
                </Alert>
              </Section>
            </Form>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant="tertiary" onClick={onClose}>
                Avbryt
              </Button>
              <Button
                type="submit"
                onClick={opprettUtkast}
                isLoading={isLoading}
                isDisabled={!isDirty}
              >
                Opprett utkast
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

// TODO: kvib har ikke 500-variant av mulish, bruker bold i mellomtiden
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

export default UtkastOpprett;
