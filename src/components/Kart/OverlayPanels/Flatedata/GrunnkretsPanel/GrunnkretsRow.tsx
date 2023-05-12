import { useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { GrunnkretsEntry, useToolbarSaving } from "contexts/ToolbarContext";
import useKretsToolbarSync from "contexts/ToolbarContext/useToolbarFormSync";
import { GrunnkretsRequest, GrunnkretsResponse } from "types/api";
import { getNavnInSpraak } from "utils/language/language";
import { getIdFromEntity } from "utils/api";
import { updateEditFeatureText } from "utils/map/layerStyles";
import { getRepresentasjonspunktId } from "utils/map/source";
import InputCell from "../InputCell";
import { KretsRow } from "../KretsTable";
import EditAndSaveButton from "../EditAndSaveButton";

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

// TODO: ta inn en hel GrunnkretsResponse i stedet, må kanskje lage useGrunnkretser
type Props = {
  grunnkrets: GrunnkretsResponse;
  kommuneId: string;
  isEditing: boolean;
  setActiveEditingGrunnkrets: (
    activeEditingGrunnkrets: GrunnkretsResponse | null
  ) => void;
};

const GrunnkretsRow = ({
  grunnkrets,
  kommuneId,
  isEditing,
  setActiveEditingGrunnkrets,
}: Props) => {
  const grunnkretsId = getIdFromEntity(grunnkrets);
  const { addEntry } = useToolbarSaving();

  const { register, getValues, setValue } = useForm<Inputs>({
    defaultValues: {
      grunnkretsnummer: grunnkrets.grunnkretsnummer,
      navn: getNavnInSpraak(grunnkrets.navn, "nor"),
    },
  });

  const previousValues = useRef<Inputs>(getValues());
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
      newValues.navn,
      newValues.grunnkretsnummer
    );
  };

  const toggleEditing = () => {
    if (isEditing) {
      setActiveEditingGrunnkrets(null);
    } else {
      setActiveEditingGrunnkrets(grunnkrets);
    }
  };

  return (
    <KretsRow>
      <InputCell
        isEditing={isEditing}
        data={grunnkrets.grunnkretsnummer}
        {...register("grunnkretsnummer")}
      />
      <InputCell
        isEditing={isEditing}
        data={getNavnInSpraak(grunnkrets.navn, "nor")}
        {...register("navn")}
      />
      <td>{/* TOOD: hvorfor er det tomt her? */}</td>
      <EditAndSaveButton
        isEditing={isEditing}
        toggleEditing={toggleEditing}
        onSubmit={() => console.log("TODO")}
      />
    </KretsRow>
  );
};

export default GrunnkretsRow;
