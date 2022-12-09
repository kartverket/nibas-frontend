import Checkbox from "components/Checkbox";
import Input from "components/form/Input";
import { ButtonCell } from "components/Kart/OverlayPanels/KretsTable";
import ReactModal from "react-modal";
import styled from "styled-components";
import {
  FramtidigVersjonConflict,
  GrunnkretsRequest,
  UtkastResponse,
} from "types/api";
import useGrunnkretsConflictModal from "./useGrunnkretsConflictModal";
import UtkastConflictModal from "./UtkastConflictModal";

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

  const currentItem = {
    Grunnkretsnummer: current.grunnkretsnummer,
    Grunnkrets: current.navn,
    Type: utkast.endringstype,
    "Gyldig fra": utkast.gyldigFra,
  };

  const columns = Object.keys(currentItem);

  return (
    <UtkastConflictModal
      current={currentItem}
      columns={columns}
      onCancel={onCancel}
      submit={submit}
    >
      <tbody>
        {fields.map((field, index) => (
          <Row key={field.id} confirmed={getIsConfirmed(index)}>
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
          </Row>
        ))}
      </tbody>
    </UtkastConflictModal>
  );
};

const Row = styled.tr<{ confirmed?: boolean }>`
  background-color: ${(props) =>
    props.confirmed ? props.theme.colors.greenLight : "transparent"};
  transition: background-color 0.2s ease-in-out;

  td {
    padding: 16px;
    border-bottom: 1px solid ${(props) => props.theme.colors.grayLight};
    // de blir ikke faktisk 200px, men de blir like på tvers av tabeller 🤷‍♀️
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }

  label {
    margin-bottom: 0;
    margin-right: 0;
  }
`;

export default GrunnkretsUtkastConflictModal;
