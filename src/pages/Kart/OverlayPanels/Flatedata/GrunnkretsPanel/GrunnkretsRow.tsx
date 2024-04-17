import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { GrunnkretsEntry, HistoryDirection } from "contexts/HistoryContext/types";
import { useHistoryFormSync } from "contexts/HistoryContext/useHistoryFormSync";
import { GrunnkretsRequest, GrunnkretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import { updateEditFeatureText } from "utils/map/layerStyles";
import { getRepresentasjonspunktId } from "utils/map/source";
import InputCell from "../InputCell";
import { KretsRow } from "../KretsTable";
import EditAndSaveButton from "../EditAndSaveButton";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { styled } from "styled-components";

type GrunnkretsInputs = {
  navn: string;
  nummer: string;
};

const fromFormToRequest = (data: GrunnkretsInputs, grunnkrets: GrunnkretsResponse): GrunnkretsRequest => ({
  identifikasjon: {
    lokalid: getIdFromEntity(grunnkrets),
  },
  version: grunnkrets.version,
  navn: data.navn,
  nummer: data.nummer,
});

type Props = {
  grunnkrets: GrunnkretsResponse;
  kommuneId: string;
};

const GrunnkretsRow = ({ grunnkrets, kommuneId }: Props) => {
  const { utkast } = useUtkast();
  const grunnkretsId = getIdFromEntity(grunnkrets);
  const { addHistoryEntry } = useHistory();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    getValues,
    setValue,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<GrunnkretsInputs>({
    defaultValues: {
      nummer: grunnkrets.nummer,
      navn: grunnkrets.navn,
    },
  });
  const previousValues = useRef<GrunnkretsInputs>(getValues());

  useEffect(() => {
    setValue("navn", grunnkrets.navn);
    setValue("nummer", grunnkrets.nummer);
    previousValues.current = getValues();
  }, [getValues, setValue, grunnkrets]);

  const setFormValues = useCallback(
    (change: GrunnkretsEntry["changes"][number], direction: HistoryDirection) => {
      const newName = change[direction]?.navn;
      const newNumber = change[direction]?.nummer;
      setValue("navn", newName ?? "");
      setValue("nummer", newNumber ?? "");

      previousValues.current = getValues();

      updateEditFeatureText(getRepresentasjonspunktId(grunnkretsId), newName, newNumber);
    },
    [getValues, grunnkretsId, setValue],
  );

  useHistoryFormSync<GrunnkretsEntry>({
    entityId: grunnkretsId,
    redoEventKey: "grunnkretsRedo",
    undoEventKey: "grunnkretsUndo",
    setFormValues,
  });

  const saveAndAddHistoryEntry = () => {
    const newValues = getValues();
    addHistoryEntry([
      {
        type: "grunnkrets",
        kommuneId,
        changes: [
          {
            from: fromFormToRequest(previousValues.current, grunnkrets),
            to: fromFormToRequest(newValues, grunnkrets),
            id: grunnkretsId,
          },
        ],
      },
    ]);
    previousValues.current = newValues;
    updateEditFeatureText(getRepresentasjonspunktId(grunnkretsId), newValues.navn, newValues.nummer);
    toggleEditing();
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
      <InputCell isEditing={isEditing} data={getValues("nummer")} {...register("nummer")} />
      <InputCell isEditing={isEditing} data={getValues("navn")} {...register("navn")} />
      <td>{/* Tom plass for mellomrom */}</td>
      {utkast && (
        <Cell>
          <EditAndSaveButton
            isEditing={isEditing}
            toggleEditing={toggleEditing}
            canSave={isDirty}
            onSubmit={(event) => handleSubmit(saveAndAddHistoryEntry)(event)}
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

export default GrunnkretsRow;
