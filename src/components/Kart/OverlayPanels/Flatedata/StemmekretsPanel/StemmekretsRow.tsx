import { KretsRow } from "../KretsTable";
import { StemmekretsRequest, StemmekretsResponse } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { getIdFromEntity } from "utils/api";
import { useCallback, useEffect, useRef, useState } from "react";
import EditAndSaveButton from "../EditAndSaveButton";
import InputCell from "../InputCell";
import Input from "components/form/Input";
import { ValidationError } from "components/form/Input/Input";
import { useToolbarSaving, StemmekretsEntry } from "contexts/ToolbarContext";
import { useForm, RegisterOptions, FieldError } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { updateEditFeatureText } from "utils/map/layerStyles";
import { getRepresentasjonspunktId } from "utils/map/source";
import useKretsToolbarSync from "contexts/ToolbarContext/useToolbarFormSync";

type Props = {
  stemmekrets: StemmekretsResponse;
  kommuneId: string;
};

type Inputs = {
  stemmekretsnavn: string;
  stemmekretsnummer: string;
  tellekretsnavn: string;
  tellekretsnummer: string;
};

const fromFormToRequest = (
  data: Inputs,
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

// TODO: legg til fremtidige endringer igjen
const StemmekretsRow = ({ stemmekrets, kommuneId }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const stemmekretsId = getIdFromEntity(stemmekrets);
  const stemmekretsNavn = getNavnInSpraak(stemmekrets.stemmekretsnavn, "nor");

  const { t } = useTranslation();
  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm<Inputs>();
  const { addEntry } = useToolbarSaving();
  const previousValues = useRef<Inputs>(getValues());

  useEffect(() => {
    if (!stemmekrets) return;

    setValue("stemmekretsnavn", stemmekrets.stemmekretsnavn);
    setValue("stemmekretsnummer", stemmekrets.stemmekretsnummer);
    setValue("tellekretsnavn", stemmekrets.tellekretsnavn ?? "");
    setValue("tellekretsnummer", stemmekrets.tellekretsnummer ?? "");

    previousValues.current = getValues();
  }, [stemmekrets, setValue, getValues]);

  const setFormValues = useCallback(
    (change: StemmekretsEntry["changes"][number], direction: "to" | "from") => {
      const newName = change[direction]?.stemmekretsnavn;
      const newNumber = change[direction]?.stemmekretsnummer;
      setValue("stemmekretsnavn", newName ?? "");
      setValue("stemmekretsnummer", newNumber ?? "");
      setValue("tellekretsnavn", change[direction]?.tellekretsnavn ?? "");
      setValue("tellekretsnummer", change[direction]?.tellekretsnummer ?? "");

      updateEditFeatureText(
        getRepresentasjonspunktId(stemmekretsId),
        newName,
        newNumber
      );
    },
    [setValue, stemmekretsId]
  );

  useKretsToolbarSync<StemmekretsEntry>({
    entityId: stemmekretsId,
    redoEventKey: "stemmekretsRedo",
    undoEventKey: "stemmekretsUndo",
    setFormValues,
  });

  const saveAndAddHistoryEntry = () => {
    if (!stemmekrets) return;

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
  };

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

  // TODO: sjekk at den oppfører seg som tr og form samtidig, kanskje umulig
  //       det er umulig, form må wrappe hele tabellen, men det går kanskje greit?
  //       må bare trekke ut handlesubmit og de greiene der, formcontext hjelper kanskje for å sende info ned hit
  return (
    <KretsRow as="form" onSubmit={handleSubmit(saveAndAddHistoryEntry)}>
      <InputCell data={stemmekrets.stemmekretsnummer} isEditing={isEditing}>
        <Input
          label={t("stemmekrets.Stemmekretsnummer")}
          {...register("stemmekretsnummer", formOptions.stemmekretsnummer)}
          validationError={validationError(errors.stemmekretsnummer)}
        />
      </InputCell>
      <InputCell data={stemmekretsNavn} isEditing={isEditing}>
        <Input
          label={t("tabell.Stemmekretsnavn")}
          {...register("stemmekretsnavn", formOptions.stemmekretsnavn)}
          validationError={validationError(errors.stemmekretsnavn)}
        />
      </InputCell>
      <InputCell data={stemmekrets.tellekretsnavn ?? ""} isEditing={isEditing}>
        <Input
          label={t("stemmekrets.Tellekretsnummer")}
          {...register("tellekretsnummer", formOptions.tellekretsnummer)}
          validationError={validationError(errors.tellekretsnummer)}
        />
      </InputCell>
      <InputCell
        data={stemmekrets.tellekretsnummer ?? ""}
        isEditing={isEditing}
      >
        <Input
          label={t("stemmekrets.Tellekretsnavn")}
          {...register("tellekretsnavn", formOptions.tellekretsnavn)}
          validationError={validationError(errors.tellekretsnavn)}
        />
      </InputCell>
      <InputCell
        data={stemmekrets.valgdistriktsnummer ?? ""}
        isEditing={isEditing}
      >
        <p>TODO</p>
      </InputCell>
      <EditAndSaveButton isEditing={isEditing} setIsEditing={setIsEditing} />
    </KretsRow>
  );
};

export default StemmekretsRow;
