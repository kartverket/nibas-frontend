import { useCallback, useRef, useState, useEffect } from "react";
import { KretsRow } from "../KretsTable";
import { StemmekretsRequest, StemmekretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import EditAndSaveButton from "../EditAndSaveButton";
import InputCell from "../InputCell";
import { ValidationError } from "components/form/Input/Input";
import { StemmekretsEntry, useToolbarSaving } from "contexts/ToolbarContext";
import { RegisterOptions, FieldError, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { updateEditFeatureText } from "utils/map/layerStyles";
import { getRepresentasjonspunktId } from "utils/map/source";
import useKretsToolbarSync from "contexts/ToolbarContext/useToolbarFormSync";

type StemmekretsInputs = {
  stemmekretsnavn: string;
  stemmekretsnummer: string;
  tellekretsnavn: string;
  tellekretsnummer: string;
};

const fromFormToRequest = (
  data: StemmekretsInputs,
  stemmekrets: StemmekretsResponse
): StemmekretsRequest => ({
  identifikasjon: {
    lokalid: getIdFromEntity(stemmekrets),
  },
  valgdistriktsnummer: stemmekrets.valgdistriktsnummer,
  version: stemmekrets.version,
  stemmekretsnavn: data.stemmekretsnavn,
  stemmekretsnummer: data.stemmekretsnummer,
  tellekretsnavn: data.tellekretsnavn,
  tellekretsnummer: data.tellekretsnummer,
});

type Props = {
  stemmekrets: StemmekretsResponse;
  kommuneId: string;
};

// TODO: legg til fremtidige endringer igjen
const StemmekretsRow = ({ stemmekrets, kommuneId }: Props) => {
  const { t } = useTranslation();
  const stemmekretsId = getIdFromEntity(stemmekrets);
  const { addEntry } = useToolbarSaving();
  const [isEditing, setIsEditing] = useState(false);

  // TODO: bør denne ta inn defaultValues, kan vi fjerne litt kluss da?
  const {
    register,
    setValue,
    getValues,
    trigger,
    handleSubmit,
    reset,
    formState: { errors, isSubmitted, isDirty },
  } = useForm<StemmekretsInputs>();
  const previousValues = useRef<StemmekretsInputs>(getValues());

  useEffect(() => {
    setValue("stemmekretsnavn", stemmekrets.stemmekretsnavn);
    setValue("stemmekretsnummer", stemmekrets.stemmekretsnummer);
    setValue("tellekretsnavn", stemmekrets.tellekretsnavn ?? "");
    setValue("tellekretsnummer", stemmekrets.tellekretsnummer ?? "");
    previousValues.current = getValues();
  }, [getValues, setValue, stemmekrets]);

  const setFormValues = useCallback(
    (change: StemmekretsEntry["changes"][number], direction: "to" | "from") => {
      const newName = change[direction]?.stemmekretsnavn;
      const newNumber = change[direction]?.stemmekretsnummer;
      setValue("stemmekretsnavn", newName ?? "");
      setValue("stemmekretsnummer", newNumber ?? "");
      setValue("tellekretsnavn", change[direction]?.tellekretsnavn ?? "");
      setValue("tellekretsnummer", change[direction]?.tellekretsnummer ?? "");

      previousValues.current = getValues();

      updateEditFeatureText(
        getRepresentasjonspunktId(stemmekretsId),
        newName,
        newNumber
      );
    },
    [getValues, setValue, stemmekretsId]
  );

  useKretsToolbarSync<StemmekretsEntry>({
    entityId: stemmekretsId,
    redoEventKey: "stemmekretsRedo",
    undoEventKey: "stemmekretsUndo",
    setFormValues,
  });

  // Denne skal oppføre seg som en XNOR, enten har begge feltene innhold, eller ingen av dem
  const isTellekretsSynced = (navn: string, nummer: string) => {
    return !navn.length === !nummer.length;
  };

  const isInteger = (s: string) => s.match(/^-?\d+$/) !== null;

  const tellekretsValidateOnChange = () => {
    if (isSubmitted) {
      trigger();
    }
  };

  const formOptions: Record<string, RegisterOptions> = {
    stemmekretsnummer: {
      required: t("stemmekrets.validering.stemmekretsnummer.ikke-tomt"),
      validate: (stemmekretsnummer: string) => {
        if (
          !isInteger(stemmekretsnummer) ||
          parseInt(stemmekretsnummer) > 9999
        ) {
          return t("stemmekrets.validering.stemmekretsnummer.kun-siffer");
        }
        if (parseInt(stemmekretsnummer) <= 0) {
          return t("stemmekrets.validering.stemmekretsnummer.kun-positiv");
        }
        return true;
      },
    },
    stemmekretsnavn: {
      required: t("stemmekrets.validering.stemmekretsnavn.ikke-tomt"),
    },
    tellekretsnummer: {
      validate: (tellekretsnummer: string) => {
        const tellekretsnavn = getValues("tellekretsnavn");

        const isTellekretsEmpty =
          tellekretsnummer.length === 0 && tellekretsnavn.length === 0;

        if (!isTellekretsSynced(tellekretsnavn, tellekretsnummer)) {
          return t("stemmekrets.validering.tellekretsnummer.både-eller-ingen");
        }
        if (!isTellekretsEmpty && !isInteger(tellekretsnummer)) {
          return t("stemmekrets.validering.tellekretsnummer.kun-tall");
        }
        if (!isTellekretsEmpty && parseInt(tellekretsnummer) <= 0) {
          return t("stemmekrets.validering.tellekretsnummer.kun-positiv");
        }
        return true;
      },
      onChange: tellekretsValidateOnChange,
    },
    tellekretsnavn: {
      validate: (tellekretsnavn: string) => {
        const tellekretsnummer = getValues("tellekretsnummer");
        if (!isTellekretsSynced(tellekretsnavn, tellekretsnummer)) {
          return t("stemmekrets.validering.tellekretsnummer.både-eller-ingen");
        }
        return true;
      },
      onChange: tellekretsValidateOnChange,
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
    addEntry({
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
      newValues.stemmekretsnummer
    );
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
        data={getValues("stemmekretsnummer")}
        validationError={validationError(errors.stemmekretsnummer)}
        {...register("stemmekretsnummer", formOptions.stemmekretsnummer)}
      />
      <InputCell
        isEditing={isEditing}
        data={getValues("stemmekretsnavn")}
        validationError={validationError(errors.stemmekretsnavn)}
        {...register("stemmekretsnavn", formOptions.stemmekretsnavn)}
      />
      <InputCell
        isEditing={isEditing}
        data={getValues("tellekretsnavn")}
        validationError={validationError(errors.tellekretsnavn)}
        {...register("tellekretsnavn", formOptions.tellekretsnavn)}
      />
      <InputCell
        isEditing={isEditing}
        data={getValues("tellekretsnummer")}
        validationError={validationError(errors.tellekretsnummer)}
        {...register("tellekretsnummer", formOptions.tellekretsnummer)}
      />
      <td>{stemmekrets.valgdistriktsnummer ?? ""}</td>
      <EditAndSaveButton
        isEditing={isEditing}
        toggleEditing={toggleEditing}
        canSave={isDirty}
        onSubmit={onSubmit}
      />
    </KretsRow>
  );
};

export default StemmekretsRow;
