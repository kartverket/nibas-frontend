import { CustomModalWrapper, ModalOverlay } from "components/Feedback/Feedback";
import Button from "components/form/Button";
import Input from "components/form/Input";
import Heading from "components/typography/Heading";
import useNibasApi from "hooks/useNibasApi";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import ReactModal from "react-modal";
import styled from "styled-components";
import {
  ConflictResponse,
  FramtidigVersjonConflict,
  GrunnkretsRequest,
  GrunnkretsResponse,
  TypedConflictResponse,
  UtkastResponse,
} from "types/api";

ReactModal.setAppElement("#root");

type Inputs = {
  grunnkretser: {
    grunnkretsnummer: string;
    navn: string;
    endringstype: string;
    gyldigFra: string;
  }[];
};

type Props<T> = {
  conflictResponse: FramtidigVersjonConflict;
  current: T;
  utkast: UtkastResponse;
  onNext: () => void;
  onCancel: () => void;
};

const UtkastConflictModal = <T extends GrunnkretsRequest>({
  conflictResponse,
  current,
  utkast,
  onNext,
  onCancel,
}: Props<T>) => {
  const { data: futureVersions, error } = useNibasApi(
    "/v1/grunnkretser/{lokalid}/framtidigeversjoner",
    {
      lokalid: current.identifikasjon.lokalid,
    }
  );

  const { control, register, setValue, handleSubmit } = useForm<Inputs>({
    defaultValues: {
      grunnkretser: [],
    },
  });
  const { fields } = useFieldArray({
    control,
    name: "grunnkretser",
  });

  const submit = handleSubmit((data) => {
    console.log(data);
  });

  useEffect(() => {
    const futureVersionsFromGyldigFra = futureVersions?.filter(
      (futureVersion) =>
        new Date(futureVersion.gyldighet.gyldigFra) > new Date(utkast.gyldigFra)
    );

    if (!futureVersionsFromGyldigFra) return;

    setValue(
      "grunnkretser",
      futureVersionsFromGyldigFra.map((futureVersion) => ({
        grunnkretsnummer: futureVersion.grunnkretsnummer,
        navn: futureVersion.navn,
        endringstype: futureVersion.endringstype,
        gyldigFra: futureVersion.gyldighet.gyldigFra,
      }))
    );
  }, [futureVersions, setValue, utkast.gyldigFra]);

  console.log(conflictResponse);
  console.log("futureVersions", futureVersions);

  return (
    <ReactModal
      isOpen
      overlayElement={(props, overlayChildren) => (
        <ModalOverlay {...props}>{overlayChildren}</ModalOverlay>
      )}
      contentElement={(props, contentChildren) => (
        <ModalWrapper {...props}>{contentChildren}</ModalWrapper>
      )}
      className="_"
      overlayClassName="_"
    >
      <Heading tag="h2" size="xs">
        Konflikt mellom fremtidige endringer
      </Heading>
      <p>
        Endringer du gjorde i dette utkastet har ført til at en annen publisert
        endring må dobbelsjekkes.
      </p>
      <p>Dobbeltsjekk feltene i endringen nedenfor før du publiserer.</p>
      <Heading tag="h2" size="xs">
        Endringer i dette utkastet
      </Heading>
      <table>
        <thead>
          <tr>
            <th>Grunnkretsnummer</th>
            <th>Grunnkrets</th>
            <th>Type</th>
            <th>Gyldig fra</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{current.grunnkretsnummer}</td>
            <td>{current.navn}</td>
            <td>{utkast.endringstype}</td>
            <td>{utkast.gyldigFra}</td>
          </tr>
        </tbody>
      </table>
      <Heading tag="h2" size="xs">
        Fremtidig endring i konflikt
      </Heading>
      <table>
        <thead>
          <tr>
            <th>Grunnkretsnummer</th>
            <th>Grunnkrets</th>
            <th>Type</th>
            <th>Gyldig fra</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={field.id}>
              <td>
                <Input
                  {...register(`grunnkretser.${index}.grunnkretsnummer`)}
                />
              </td>
              <td>
                <Input {...register(`grunnkretser.${index}.navn`)} />
              </td>
              <td>{field.endringstype}</td>
              <td>{field.gyldigFra}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Buttons>
        <Button variant="secondary" onClick={onCancel}>
          Avbryt
        </Button>
        <Button onClick={submit}>Publiser</Button>
      </Buttons>
    </ReactModal>
  );
};

const ModalWrapper = styled(CustomModalWrapper)`
  max-width: 90%;
  padding: 40px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;

  button {
    margin-left: 8px;
  }
`;

export default UtkastConflictModal;
