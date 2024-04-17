import { useCallback, useRef, useState, useEffect } from "react";
import { KretsRow } from "../KretsTable";
import { StemmekretsRequest, StemmekretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import EditAndSaveButton from "../EditAndSaveButton";
import InputCell from "../InputCell";
import { ValidationError } from "components/Input";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { StemmekretsEntry, HistoryDirection } from "contexts/HistoryContext/types";
import { RegisterOptions, FieldError, useForm } from "react-hook-form";
import { updateEditFeatureText } from "utils/map/layerStyles";
import { getRepresentasjonspunktId } from "utils/map/source";
import { useHistoryFormSync } from "contexts/HistoryContext/useHistoryFormSync";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { styled } from "styled-components";

type StemmekretsInputs = {
  navn: string;
  nummer: string;
};

const fromFormToRequest = (data: StemmekretsInputs, stemmekrets: StemmekretsResponse): StemmekretsRequest => ({
  identifikasjon: {
    lokalid: getIdFromEntity(stemmekrets),
  },
  valgdistriktsnummer: stemmekrets.valgdistriktsnummer,
  version: stemmekrets.version,
  navn: data.navn,
  nummer: data.nummer,
});

type Props = {
  stemmekrets: StemmekretsResponse;
  kommuneId: string;
};

const StemmekretsRow = ({ stemmekrets, kommuneId }: Props) => {
  const { utkast } = useUtkast();
  const stemmekretsId = getIdFromEntity(stemmekrets);
  const { addHistoryEntry } = useHistory();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<StemmekretsInputs>({
    defaultValues: {
      navn: stemmekrets.navn,
      nummer: stemmekrets.nummer,
    },
  });
  const previousValues = useRef<StemmekretsInputs>(getValues());

  useEffect(() => {
    setValue("navn", stemmekrets.navn);
    setValue("nummer", stemmekrets.nummer);
    previousValues.current = getValues();
  }, [getValues, setValue, stemmekrets]);

  const setFormValues = useCallback(
    (change: StemmekretsEntry["changes"][number], direction: HistoryDirection) => {
      const newName = change[direction]?.navn;
      const newNumber = change[direction]?.nummer;
      setValue("navn", newName ?? "");
      setValue("nummer", newNumber ?? "");

      previousValues.current = getValues();

      updateEditFeatureText(getRepresentasjonspunktId(stemmekretsId), newName, newNumber);
    },
    [getValues, setValue, stemmekretsId],
  );

  useHistoryFormSync<StemmekretsEntry>({
    entityId: stemmekretsId,
    redoEventKey: "stemmekretsRedo",
    undoEventKey: "stemmekretsUndo",
    setFormValues,
  });

  const isInteger = (s: string) => s.match(/^-?\d+$/) !== null;

  const formOptions: Record<string, RegisterOptions> = {
    nummer: {
      required: "Stemmekretsnummer kan ikke være tomt",
      validate: (nummer: string) => {
        if (!isInteger(nummer) || parseInt(nummer) > 9999) {
          return "Stemmekretsnummer må kun inneholde siffer (maks 4)";
        }
        if (parseInt(nummer) <= 0) {
          return "Stemmekretsnummer kan ikke være 0 eller et negativt tall";
        }
        return true;
      },
    },
    navn: {
      required: "Stemmekretsnavn kan ikke være tomt",
    },
  };

  const validationError = (error: FieldError | undefined | null) => {
    if (error) {
      return {
        showError: true,
        message: error.message,
      } as ValidationError;
    }
  };

  const saveAndAddHistoryEntry = () => {
    const newValues = getValues();
    addHistoryEntry([
      {
        type: "stemmekrets",
        kommuneId,
        changes: [
          {
            from: fromFormToRequest(previousValues.current, stemmekrets),
            to: fromFormToRequest(newValues, stemmekrets),
            id: stemmekretsId,
          },
        ],
      },
    ]);
    previousValues.current = newValues;
    updateEditFeatureText(getRepresentasjonspunktId(stemmekretsId), newValues.navn, newValues.nummer);
    toggleEditing();
  };

  const onSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    handleSubmit(saveAndAddHistoryEntry)(event);
  };

  const toggleEditing = () => {
    reset(previousValues.current);
    if (isEditing) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  return (
    <KretsRow>
      <InputCell
        isEditing={isEditing}
        data={getValues("nummer")}
        validationError={validationError(errors.nummer)}
        {...register("nummer", formOptions.nummer)}
      />
      <InputCell
        isEditing={isEditing}
        data={getValues("navn")}
        validationError={validationError(errors.navn)}
        {...register("navn", formOptions.navn)}
      />
      <td>{stemmekrets.valgdistriktsnummer ?? ""}</td>
      {utkast && (
        <Cell>
          <EditAndSaveButton
            isEditing={isEditing}
            toggleEditing={toggleEditing}
            canSave={isDirty}
            onSubmit={onSubmit}
          />
        </Cell>
      )}
    </KretsRow>
  );
};

const Cell = styled.td`
  display: flex;
  justify-content: end;
  padding: 12px !important;
`;

export default StemmekretsRow;
