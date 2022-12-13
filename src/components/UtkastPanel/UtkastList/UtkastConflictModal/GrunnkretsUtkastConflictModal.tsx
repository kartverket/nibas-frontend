import Checkbox from "components/Checkbox";
import Input from "components/form/Input";
import { ButtonCell } from "components/Kart/OverlayPanels/KretsTable";
import ReactModal from "react-modal";
import {
  FramtidigVersjonConflict,
  GrunnkretsRequest,
  UtkastResponse,
} from "types/api";
import useGrunnkretsConflictModal from "./useGrunnkretsConflictModal";
import UtkastConflictModal, { ConflictTableRow } from "./UtkastConflictModal";

if (process.env.NODE_ENV !== "test") {
  ReactModal.setAppElement("#root");
}

type Props<T> = {
  conflictResponse: FramtidigVersjonConflict;
  current: T;
  utkast: UtkastResponse;
  onNext: () => void;
  onCancel: () => void;
};

const GrunnkretsUtkastConflictModal = <T extends GrunnkretsRequest>({
  conflictResponse,
  current,
  utkast,
  onNext,
  onCancel,
}: Props<T>) => {
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

  const columns = ["Grunnkretsnummer", "Grunnkrets", "Type", "Gyldig fra"];

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
                type="checkbox"
                label="Bekreft"
                {...register(`grunnkretser.${index}.confirmed`)}
                aria-label={`Bekreft grunnkrets ${index + 1}`}
              />
            </ButtonCell>
          </ConflictTableRow>
        ))}
      </tbody>
    </UtkastConflictModal>
  );
};

export default GrunnkretsUtkastConflictModal;
