import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { GrunnkretsEntry, useToolbarSaving } from "contexts/ToolbarContext";
import useKretsToolbarSync from "contexts/ToolbarContext/useToolbarFormSync";
import { GrunnkretsRequest, GrunnkretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { updateEditFeatureText } from "utils/map/layerStyles";
import { getRepresentasjonspunktId } from "utils/map/source";
import InputCell from "../InputCell";
import { KretsRow } from "../KretsTable";
import EditAndSaveButton from "../EditAndSaveButton";

type GrunnkretsInputs = {
  grunnkretsnavn: string;
  grunnkretsnummer: string;
};

const fromFormToRequest = (
  data: GrunnkretsInputs,
  grunnkrets: GrunnkretsResponse
): GrunnkretsRequest => ({
  identifikasjon: {
    lokalid: getIdFromEntity(grunnkrets),
  },
  version: grunnkrets.version,
  navn: data.grunnkretsnavn,
  grunnkretsnummer: data.grunnkretsnummer,
});

type Props = {
  grunnkrets: GrunnkretsResponse;
  kommuneId: string;
};

const GrunnkretsRow = ({ grunnkrets, kommuneId }: Props) => {
  const grunnkretsId = getIdFromEntity(grunnkrets);
  const { addEntry } = useToolbarSaving();
  const [isEditing, setIsEditing] = useState(false);

  // TODO: se hva stemmekrets bruker som mangler her
  const {
    register,
    getValues,
    setValue,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<GrunnkretsInputs>({
    defaultValues: {
      grunnkretsnummer: grunnkrets.grunnkretsnummer,
      grunnkretsnavn: grunnkrets.navn,
    },
  });
  const previousValues = useRef<GrunnkretsInputs>(getValues());

  useEffect(() => {
    setValue("grunnkretsnavn", grunnkrets.navn);
    setValue("grunnkretsnummer", grunnkrets.grunnkretsnummer);
    previousValues.current = getValues();
  }, [getValues, setValue, grunnkrets]);

  // TODO: Denne er nesten prikk lik stemmekrets, kan den trekkes ut?
  const setFormValues = useCallback(
    (change: GrunnkretsEntry["changes"][number], direction: "to" | "from") => {
      const newName = change[direction]?.navn;
      const newNumber = change[direction]?.grunnkretsnummer;
      setValue("grunnkretsnavn", newName ?? "");
      setValue("grunnkretsnummer", newNumber ?? "");

      previousValues.current = getValues();

      updateEditFeatureText(
        getRepresentasjonspunktId(grunnkretsId),
        newName,
        newNumber
      );
    },
    [getValues, grunnkretsId, setValue]
  );

  useKretsToolbarSync<GrunnkretsEntry>({
    entityId: grunnkretsId,
    redoEventKey: "grunnkretsRedo",
    undoEventKey: "grunnkretsUndo",
    setFormValues,
  });

  // TODO: Denne er nesten prikk lik stemmekrets, kan den trekkes ut?
  const saveAndAddHistoryEntry = () => {
    const newValues = getValues();
    addEntry({
      type: "grunnkrets",
      kommuneId,
      changes: [
        {
          from: fromFormToRequest(previousValues.current, grunnkrets),
          to: fromFormToRequest(newValues, grunnkrets),
          id: grunnkretsId,
        },
      ],
    });
    previousValues.current = newValues;
    updateEditFeatureText(
      getRepresentasjonspunktId(grunnkretsId),
      newValues.grunnkretsnavn,
      newValues.grunnkretsnummer
    );
    toggleEditing();
  };

  const onSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    // TODO: trengs kanskje ikke siden det ikke er en faktisk submit?
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
        data={getValues("grunnkretsnummer")}
        {...register("grunnkretsnummer")}
      />
      <InputCell
        isEditing={isEditing}
        data={getValues("grunnkretsnavn")}
        {...register("grunnkretsnavn")}
      />
      <td>{/* TOOD: hvorfor er det tomt her? */}</td>
      <EditAndSaveButton
        isEditing={isEditing}
        toggleEditing={toggleEditing}
        canSave={isDirty}
        onSubmit={onSubmit}
      />
    </KretsRow>
  );
};

export default GrunnkretsRow;
