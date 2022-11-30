import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { resolveUtkastConflict } from "api/utkast";
import Checkbox from "components/Checkbox";
import { CustomModalWrapper, ModalOverlay } from "components/Feedback/Feedback";
import Button from "components/form/Button";
import Input from "components/form/Input";
import { ButtonCell } from "components/Kart/OverlayPanels/KretsTable";
import Heading from "components/typography/Heading";
import useNibasApi from "hooks/useNibasApi";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import ReactModal from "react-modal";
import styled from "styled-components";
import {
  ConflictResolved,
  FramtidigVersjonConflict,
  GrunnkretsRequest,
  GrunnkretsResponse,
  UtkastResponse,
} from "types/api";

if (process.env.NODE_ENV !== "test") {
  ReactModal.setAppElement("#root");
}

type GrunnkretsFormData = {
  grunnkretsnummer: string;
  navn: string;
  endringstype: string;
  gyldigFra: string;
  confirmed: boolean;
};

type Inputs = {
  grunnkretser: GrunnkretsFormData[];
};

const getGrunnkretsRequest = (
  grunnkretsFormData: GrunnkretsFormData,
  futureVersions: GrunnkretsResponse[],
  current: GrunnkretsRequest
) => {
  const futureVersion = futureVersions?.find(
    (fv) => fv.gyldighet.gyldigFra === grunnkretsFormData.gyldigFra
  );

  return {
    identifikasjon: {
      lokalid: current.identifikasjon.lokalid,
    },
    grunnkretsnummer: grunnkretsFormData.grunnkretsnummer,
    version: futureVersion?.version,
    navn: grunnkretsFormData.navn,
    endringstype: grunnkretsFormData.endringstype,
    gyldigFra: grunnkretsFormData.gyldigFra,
  } as GrunnkretsRequest;
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
  const { data: futureVersions } = useNibasApi(
    "/v1/grunnkretser/{lokalid}/framtidigeversjoner",
    {
      lokalid: current.identifikasjon.lokalid,
    }
  );

  const conflictedFutureVersions = useMemo(
    () =>
      futureVersions?.filter((fv) =>
        conflictResponse.affectedIds.some(
          (id) => id.gyldigFra === fv.gyldighet.gyldigFra
        )
      ),
    [futureVersions, conflictResponse.affectedIds]
  );

  const { tokenHolderFunc } = useAuthenticationFlow();

  const { control, register, setValue, handleSubmit, watch } = useForm<Inputs>({
    defaultValues: {
      grunnkretser: [],
    },
  });
  const { fields } = useFieldArray({
    control,
    name: "grunnkretser",
  });

  const submit = handleSubmit(async (data) => {
    if (!conflictedFutureVersions) return;

    const resolvedConflict: ConflictResolved = {
      lokalid: {
        value: current.identifikasjon.lokalid,
      },
      grunnkretsRequests: data.grunnkretser
        .map((g) => ({
          endringstype: g.endringstype,
          gyldigFra: g.gyldigFra,
          grunnkretsRequest: getGrunnkretsRequest(
            g,
            conflictedFutureVersions,
            current
          ),
        }))
        .concat({
          endringstype: utkast.endringstype,
          gyldigFra: utkast.gyldigFra,
          grunnkretsRequest: current,
        }),
    };

    await resolveUtkastConflict(
      utkast.id,
      resolvedConflict,
      tokenHolderFunc()?.token
    );

    onNext();
  });

  useEffect(() => {
    const futureVersionsFromGyldigFra = conflictedFutureVersions?.filter(
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
        confirmed: false,
      }))
    );
  }, [conflictedFutureVersions, setValue, utkast.gyldigFra]);

  const getIsConfirmed = (index: number) =>
    watch(`grunnkretser.${index}.confirmed`);

  const getIsAllConfirmed = () =>
    watch("grunnkretser").every((grunnkrets) => grunnkrets.confirmed);

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
      <Table>
        <thead>
          <tr>
            <th>Grunnkretsnummer</th>
            <th>Grunnkrets</th>
            <th>Type</th>
            <th>Gyldig fra</th>
          </tr>
        </thead>
        <tbody>
          <Row>
            <td>{current.grunnkretsnummer}</td>
            <td>{current.navn}</td>
            <td>{utkast.endringstype}</td>
            <td>{utkast.gyldigFra}</td>
          </Row>
        </tbody>
      </Table>
      <Heading tag="h2" size="xs">
        Fremtidig endring i konflikt
      </Heading>
      <Table cellSpacing={0}>
        <thead>
          <tr>
            <th>Grunnkretsnummer</th>
            <th>Grunnkrets</th>
            <th>Type</th>
            <th>Gyldig fra</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <Row key={field.id} confirmed={getIsConfirmed(index)}>
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
              <ButtonCell>
                <Checkbox
                  type="checkbox"
                  label="Bekreft"
                  {...register(`grunnkretser.${index}.confirmed`)}
                />
              </ButtonCell>
            </Row>
          ))}
        </tbody>
      </Table>

      <Buttons>
        <Button variant="secondary" onClick={onCancel}>
          Avbryt
        </Button>
        <Button onClick={submit} disabled={!getIsAllConfirmed()}>
          Publiser
        </Button>
      </Buttons>
    </ReactModal>
  );
};

const ModalWrapper = styled(CustomModalWrapper)`
  min-width: 900px;
  max-width: 1200px;
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

const Row = styled.tr<{ confirmed?: boolean }>`
  background-color: ${(props) =>
    props.confirmed ? props.theme.colors.greenLight : "transparent"};
  transition: background-color 0.2s ease-in-out;

  td {
    padding: 16px;
    border-bottom: 1px solid ${(props) => props.theme.colors.grayLight};
  }

  label {
    margin-bottom: 0;
    margin-right: 0;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 8px 16px;
  }
`;

export default UtkastConflictModal;
