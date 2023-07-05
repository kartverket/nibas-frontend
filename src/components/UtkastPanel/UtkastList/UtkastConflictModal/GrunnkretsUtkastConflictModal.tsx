import Input from "components/Input";
import { ButtonCell } from "pages/Kart/OverlayPanels/Flatedata/KretsTable";
import {
  FramtidigVersjonConflict,
  GrunnkretsRequest,
  UtkastResponse,
} from "types/api";
import useGrunnkretsConflictModal from "./useGrunnkretsConflictModal";
import UtkastConflictModal, { ConflictTableRow } from "./UtkastConflictModal";
import { Checkbox } from "@kvib/react";

type Props = {
  conflictResponse: FramtidigVersjonConflict;
  current: GrunnkretsRequest;
  utkast: UtkastResponse;
  onNext: () => void;
  onCancel: () => void;
};

const GrunnkretsUtkastConflictModal = ({
  conflictResponse,
  current,
  utkast,
  onNext,
  onCancel,
}: Props) => {
  const { fields, getIsConfirmed, register, submit } =
    useGrunnkretsConflictModal({
      conflictResponse,
      grunnkrets: current,
      utkast,
      onNext,
    });

  const currentRow = [
    current.grunnkretsnummer,
    current.navn,
    utkast.endringstype,
    utkast.gyldigFra,
  ];

  const columns = [
    "Grunnkretsnummer",
    "Grunnkrets",
    "Endringstype",
    "Gyldig fra",
  ];

  return (
    <UtkastConflictModal
      currentRow={currentRow}
      columns={columns}
      onCancel={onCancel}
      submit={submit}
    >
      <tbody>
        {fields.map((field, index) => (
          <ConflictTableRow
            key={field.id}
            confirmed={getIsConfirmed(index)}
            numColumns={columns.length}
          >
            <td>
              <Input {...register(`grunnkretser.${index}.grunnkretsnummer`)} />
            </td>
            <td>
              <Input {...register(`grunnkretser.${index}.navn`)} />
            </td>
            <td>{field.endringstype}</td>
            <td>{field.gyldigFra}</td>
            <ButtonCell>
              <Checkbox
                {...register(`grunnkretser.${index}.confirmed`)}
                aria-label={`Bekreft grunnkrets ${index + 1}`}
              >
                Bekreft
              </Checkbox>
            </ButtonCell>
          </ConflictTableRow>
        ))}
      </tbody>
    </UtkastConflictModal>
  );
};

export default GrunnkretsUtkastConflictModal;
