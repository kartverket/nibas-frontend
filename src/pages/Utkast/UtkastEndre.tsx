import {
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
} from "@kvib/react";
import Icon from "components/Icon";
import { useHistory } from "contexts/HistoryContext";
import { UtkastRequestWithoutOperations } from "contexts/UtkastContext/types";
import { endringstyper } from "pages/Kart/constants";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { UtkastResponse } from "types/api";

type UtkastFormData = {
  navn: string;
  endringstype: string;
};

type Props = {
  utkast: UtkastResponse;
};

const fromFormToRequest = (
  form: UtkastFormData,
  utkast: UtkastResponse
): UtkastRequestWithoutOperations => ({
  ...utkast,
  navn: form.navn,
  endringstype: form.endringstype,
  version: utkast.version,
});

const UtkastEndre = ({ utkast }: Props) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
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
    <>
      <MenuItem
        icon={<Icon icon="edit" />}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        TODO: Endre detaljer
      </MenuItem>
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
              <Section>
                <FormLabel>Type utkast</FormLabel>
                <Select {...register("endringstype")}>
                  {endringstyper.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
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
    </>
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

export default UtkastEndre;
