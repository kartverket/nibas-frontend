import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Input from "components/form/Input";
import { GrunnkretsEntry, useToolbarSaving } from "contexts/ToolbarContext";
import useKretsToolbarSync from "contexts/ToolbarContext/useToolbarFormSync";
import useNibasApi from "hooks/useNibasApi";
import {
  GrunnkretsRef,
  GrunnkretsRequest,
  GrunnkretsResponse,
} from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import useTimer from "hooks/useTimer";
import { getIdFromEntity } from "utils/api";
import { updateEditFeatureText } from "utils/map/layerStyles";
import { getRepresentasjonspunktId } from "utils/map/source";
import InputCell from "../InputCell";
import { KretsRow } from "../KretsTable";
import EditAndSaveButton from "../EditAndSaveButton";

// TODO: ta inn en hel GrunnkretsResponse i stedet, må kanskje lage useGrunnkretser
type Props = {
  grunnkrets: GrunnkretsRef;
  kommuneId: string;
};

type Inputs = {
  navn: string;
  grunnkretsnummer: string;
};

const fromFormToRequest = (
  data: Inputs,
  grunnkrets: GrunnkretsResponse
): GrunnkretsRequest => ({
  identifikasjon: {
    lokalid: getIdFromEntity(grunnkrets),
  },
  version: grunnkrets.version,
  navn: data.navn,
  grunnkretsnummer: data.grunnkretsnummer,
});

const EditRow = ({ grunnkrets, kommuneId }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const grunnkretsId = getIdFromEntity(grunnkrets);

  const { t } = useTranslation();

  // TODO: bytt ut de greiene her antageligvis
  const { data: fullGrunnkrets } = useNibasApi("/v1/grunnkretser/{id}", {
    id: grunnkretsId,
  });
  const { startTimer, clearTimer } = useTimer();

  const { register, getValues, setValue } = useForm<Inputs>({
    defaultValues: {
      grunnkretsnummer: grunnkrets.grunnkretsnummer,
      navn: getNavnInSpraak(grunnkrets.navn, "nor"),
    },
  });

  const previousValues = useRef<Inputs>(getValues());

  const { addEntry } = useToolbarSaving();

  const setFormValues = useCallback(
    (change: GrunnkretsEntry["changes"][number], direction: "to" | "from") => {
      const newName = change[direction]?.navn;
      const newNumber = change[direction]?.grunnkretsnummer;
      setValue("navn", newName ?? "");
      setValue("grunnkretsnummer", newNumber ?? "");
      updateEditFeatureText(
        getRepresentasjonspunktId(grunnkretsId),
        newName,
        newNumber
      );
    },
    [grunnkretsId, setValue]
  );

  useKretsToolbarSync<GrunnkretsEntry>({
    entityId: grunnkretsId,
    redoEventKey: "grunnkretsRedo",
    undoEventKey: "grunnkretsUndo",
    setFormValues,
  });

  const onChange = () => {
    clearTimer();

    if (!fullGrunnkrets) return;

    startTimer(() => {
      const newValues = getValues();
      addEntry({
        type: "grunnkrets",
        kommuneId,
        changes: [
          {
            from: fromFormToRequest(previousValues.current, fullGrunnkrets),
            to: fromFormToRequest(newValues, fullGrunnkrets),
            id: grunnkretsId,
          },
        ],
      });
      previousValues.current = newValues;
      updateEditFeatureText(
        getRepresentasjonspunktId(grunnkretsId),
        newValues.navn,
        newValues.grunnkretsnummer
      );
    }, 700);
  };

  const registerOptions = {
    onChange,
  };

  return (
    <KretsRow>
      <InputCell data={grunnkrets.grunnkretsnummer} isEditing={isEditing}>
        <Input
          label={t("grunnkrets.Grunnkretsnummer")}
          {...register("grunnkretsnummer", registerOptions)}
        />
      </InputCell>
      <InputCell
        data={getNavnInSpraak(grunnkrets.navn, "nor")}
        isEditing={isEditing}
      >
        <Input
          label={t("grunnkrets.Grunnkretsnavn")}
          {...register("navn", registerOptions)}
        />
      </InputCell>
      <td>{/* TOOD: hvorfor er det tomt her? */}</td>
      <EditAndSaveButton isEditing={isEditing} setIsEditing={setIsEditing} />
    </KretsRow>
  );
};

export default EditRow;
