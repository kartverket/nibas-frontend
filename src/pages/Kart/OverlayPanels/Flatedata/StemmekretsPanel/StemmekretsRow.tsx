import { useCallback, useRef, useState, useEffect } from "react";
import { KretsRow } from "../KretsTable";
import { StemmekretsRequest, StemmekretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import EditAndSaveButton from "../EditAndSaveButton";
import InputCell from "../InputCell";
import { ValidationError } from "components/Input";
import { StemmekretsEntry, useHistory } from "contexts/HistoryContext";
import { RegisterOptions, FieldError, useForm } from "react-hook-form";
import { updateEditFeatureText } from "utils/map/layerStyles";
import { getRepresentasjonspunktId } from "utils/map/source";
import { useHistoryFormSync } from "contexts/HistoryContext/useHistoryFormSync";
import { useUtkast } from "contexts/UtkastContext";
import { styled } from "styled-components";

type StemmekretsInputs = {
  stemmekretsnavn: string;
  stemmekretsnummer: string;
};

const fromFormToRequest = (
  data: StemmekretsInputs,
  stemmekrets: StemmekretsResponse,
): StemmekretsRequest => ({
  identifikasjon: {
    lokalid: getIdFromEntity(stemmekrets),
  },
  valgdistriktsnummer: stemmekrets.valgdistriktsnummer,
  version: stemmekrets.version,
  stemmekretsnavn: data.stemmekretsnavn,
  stemmekretsnummer: data.stemmekretsnummer,
});

type Props = {
  stemmekrets: StemmekretsResponse;
  kommuneId: string;
};

// TODO: legg til fremtidige endringer igjen, sjekk med Erlend for skisser
const StemmekretsRow = ({ stemmekrets, kommuneId }: Props) => {
  const { utkast } = useUtkast();
  const stemmekretsId = getIdFromEntity(stemmekrets);
  const { addHistoryEntry } = useHistory();
  const [isEditing, setIsEditing] = useState(false);
  const [navn, setNavn] = useState("");
  const [nummer, setNummer] = useState("");

  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<StemmekretsInputs>();
  const previousValues = useRef<StemmekretsInputs>(getValues());

  useEffect(() => {
    setValue("stemmekretsnavn", stemmekrets.stemmekretsnavn);
    setValue("stemmekretsnummer", stemmekrets.stemmekretsnummer);
    setNavn(stemmekrets.stemmekretsnavn);
    setNummer(stemmekrets.stemmekretsnummer);
    previousValues.current = getValues();
  }, [getValues, setValue, stemmekrets]);

  const setFormValues = useCallback(
    (change: StemmekretsEntry["changes"][number], direction: "to" | "from") => {
      const newName = change[direction]?.stemmekretsnavn;
      const newNumber = change[direction]?.stemmekretsnummer;
      setValue("stemmekretsnavn", newName ?? "");
      setValue("stemmekretsnummer", newNumber ?? "");
      setNavn(newName ?? "");
      setNummer(newNumber ?? "");

      previousValues.current = getValues();

      updateEditFeatureText(
        getRepresentasjonspunktId(stemmekretsId),
        newName,
        newNumber,
      );
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
    stemmekretsnummer: {
      required: "Stemmekretsnummer kan ikke være tomt",
      validate: (stemmekretsnummer: string) => {
        if (
          !isInteger(stemmekretsnummer) ||
          parseInt(stemmekretsnummer) > 9999
        ) {
          return "Stemmekretsnummer må kun inneholde siffer (maks 4)";
        }
        if (parseInt(stemmekretsnummer) <= 0) {
          return "Stemmekretsnummer kan ikke være 0 eller et negativt tall";
        }
        return true;
      },
    },
    stemmekretsnavn: {
      required: "Stemmekretsnavn kan ikke være tomt",
    },
  };

  const validationError = (error: FieldError | undefined) => {
    if (error) {
      return {
        showError: error !== undefined,
        message: error.message,
      } as ValidationError;
    }
  };

  const saveAndAddHistoryEntry = () => {
    const newValues = getValues();
    addHistoryEntry({
      type: "stemmekrets",
      kommuneId,
      changes: [
        {
          from: fromFormToRequest(previousValues.current, stemmekrets),
          to: fromFormToRequest(newValues, stemmekrets),
          id: stemmekretsId,
        },
      ],
    });
    previousValues.current = newValues;
    updateEditFeatureText(
      getRepresentasjonspunktId(stemmekretsId),
      newValues.stemmekretsnavn,
      newValues.stemmekretsnummer,
    );
    setNavn(newValues.stemmekretsnavn);
    setNummer(newValues.stemmekretsnummer);
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
        data={nummer}
        validationError={validationError(errors.stemmekretsnummer)}
        {...register("stemmekretsnummer", formOptions.stemmekretsnummer)}
      />
      <InputCell
        isEditing={isEditing}
        data={navn}
        validationError={validationError(errors.stemmekretsnavn)}
        {...register("stemmekretsnavn", formOptions.stemmekretsnavn)}
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
