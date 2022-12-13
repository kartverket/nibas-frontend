import Checkbox from "components/Checkbox";
import Input from "components/form/Input";
import { ButtonCell } from "components/Kart/OverlayPanels/KretsTable";
import {
  FramtidigVersjonConflict,
  StemmekretsRequest,
  UtkastResponse,
} from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import useStemmekretsConflictModal from "./useStemmekretsConflictModal";
import UtkastConflictModal, { ConflictTableRow } from "./UtkastConflictModal";

const columns = [
  "Stemmekrets",
  "Stemmekretsnummer",
  "Valgdistriktsnummer",
  "Tellekretsnavn",
  "Tellekretsnummer",
  "Endringstype",
  "Gyldig fra",
];

type Props = {
  conflictResponse: FramtidigVersjonConflict;
  current: StemmekretsRequest;
  utkast: UtkastResponse;
  onNext: () => void;
  onCancel: () => void;
};

const StemmekretsUtkastConflictModal = ({
  conflictResponse,
  current,
  utkast,
  onNext,
  onCancel,
}: Props) => {
  const { fields, getIsConfirmed, register, submit } =
    useStemmekretsConflictModal({
      conflictResponse,
      stemmekrets: current,
      utkast,
      onNext,
    });

  const currentRow = [
    getNavnInSpraak(current.stemmekretsnavn, "nor") ?? "---",
    current.stemmekretsnummer ?? "---",
    current.valgdistriktsnummer ?? "---",
    current.tellekretsnavn ?? "---",
    current.tellekretsnummer ?? "---",
    utkast.endringstype,
    utkast.gyldigFra,
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
              <Input {...register(`stemmekretser.${index}.stemmekretsnavn`)} />
            </td>
            <td>
              <Input
                {...register(`stemmekretser.${index}.stemmekretsnummer`)}
              />
            </td>
            <td>
              <Input
                {...register(`stemmekretser.${index}.valgdistriktsnummer`)}
              />
            </td>
            <td>
              <Input {...register(`stemmekretser.${index}.tellekretsnavn`)} />
            </td>
            <td>
              <Input {...register(`stemmekretser.${index}.tellekretsnummer`)} />
            </td>
            <td>{field.endringstype}</td>
            <td>{field.gyldigFra}</td>
            <ButtonCell>
              <Checkbox
                type="checkbox"
                label="Bekreft"
                {...register(`stemmekretser.${index}.confirmed`)}
                aria-label={`Bekreft grunnkrets ${index + 1}`}
              />
            </ButtonCell>
          </ConflictTableRow>
        ))}
      </tbody>
    </UtkastConflictModal>
  );
};

export default StemmekretsUtkastConflictModal;
