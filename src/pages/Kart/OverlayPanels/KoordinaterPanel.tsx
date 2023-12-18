import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, AbsolutePanel } from "./Panel";
import Input from "components/Input";
import { useForm } from "react-hook-form";
import { styled } from "styled-components";
import LineString from "ol/geom/LineString";
import { useCallback, useEffect } from "react";
import {
  GrenseEntry,
  HistoryChange,
  useHistory,
} from "contexts/HistoryContext";
import { SelectedPoint, useFeatureStyle } from "contexts/FeatureStyleContext";
import Point from "ol/geom/Point";
import { Button, useToast } from "@kvib/react";
import { editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import { useToolbar } from "contexts/ToolbarContext";

type KoordinaterFormData = {
  north: number;
  east: number;
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
`;

const InputRow = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;
`;

const KoordinaterPanel = ({ isOpen, className }: PanelProps) => {
  const { closeOverlayPanel } = useOverlayPanel();
  const { selectedPoint, selectedFeatures, selectPointOnFeature } =
    useFeatureStyle();
  const { resetTool } = useToolbar();
  const { addHistoryEntry } = useHistory();
  const toast = useToast();

  const defaultValues = (punkt: SelectedPoint) => {
    if (!punkt) {
      return {
        east: undefined,
        north: undefined,
      };
    }
    const geometry = punkt?.getGeometry() as Point;
    const coordinates = geometry.getCoordinates();
    return {
      east: coordinates[0],
      north: coordinates[1],
    };
  };

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<KoordinaterFormData>({
    defaultValues: defaultValues(selectedPoint),
  });

  // Hjelpefunksjon for å gå gjennom en feature og finne punktet som er påvirket av grensejustering
  const getCoordinateFromChange = (
    change: HistoryChange<number[][]>,
    direction: "to" | "from",
  ) => {
    for (let index = 0; index < change.from.length; index++) {
      const fromCoord = change.from[index];
      const toCoord = change.to[index];
      if (fromCoord[0] !== toCoord[0] || fromCoord[1] !== toCoord[1]) {
        return change[direction][index];
      }
    }
  };

  const setFormValues = useCallback(
    (e: CustomEvent, direction: "to" | "from") => {
      // Dette skal bare kjøres dersom et punkt er valgt, ikke ved alle grensendringer
      if (selectedPoint) {
        const entry = e.detail.entry as GrenseEntry;

        // Dersom en valgt feature blir endret ved history må vi oppdatere valgt punkt
        const selectedChange = entry.changes.find((c) =>
          selectedFeatures.some((f) => f.getId() === c.id),
        );

        if (selectedChange) {
          const coordinate = getCoordinateFromChange(selectedChange, direction);
          if (coordinate) {
            const features = [];
            for (const change of entry.changes) {
              features.push(
                editSource.getFeatureById(change.id) as Feature<LineString>,
              );
            }
            selectPointOnFeature(coordinate, features);
          }
        }
      }
    },
    [selectPointOnFeature, selectedFeatures, selectedPoint],
  );

  // Når man bruker undo og redo må koordinatpanelet oppdateres
  useEffect(() => {
    const undo = ((e: CustomEvent) => {
      setFormValues(e, "from");
    }) as EventListener;

    const redo = ((e: CustomEvent) => {
      setFormValues(e, "to");
    }) as EventListener;

    // Utløses av undo og redo i HistoryContext
    document.addEventListener("grenseUndo", undo);
    document.addEventListener("grenseRedo", redo);

    return () => {
      document.removeEventListener("grenseUndo", undo);
      document.removeEventListener("grenseRedo", redo);
    };
  }, [setFormValues]);

  // Tilbakestill defaultverdier når man endrer eller oppdaterer valgt punkt
  useEffect(() => {
    reset(defaultValues(selectedPoint));
  }, [selectedPoint, reset, selectedFeatures]);

  const movePoint = () => {
    if (selectedPoint) {
      // getValues skal returnere et tall, men den returnerer string for en eller annen grunn
      const newCoordinates = [+getValues("east"), +getValues("north")];
      const oldGeometry = selectedPoint.getGeometry() as Point;
      const oldCoordinates = oldGeometry.getCoordinates();

      const changes: HistoryChange<number[][]>[] = [];

      for (const feature of selectedFeatures) {
        const featureId = feature.getId() as string;
        const geometry = feature.getGeometry() as LineString;
        const coordinates = geometry.getCoordinates();

        // Siden OL-objekter er mutable og vi trenger dette til senere:
        const originalCoordinates = [...coordinates];

        const nearestVertexIndex = coordinates.findIndex(
          (v) => v[0] === oldCoordinates[0] && v[1] === oldCoordinates[1],
        );
        const headCoordinates = coordinates.slice(0, nearestVertexIndex);
        const tailCoordinates = coordinates.slice(nearestVertexIndex + 1);

        const updatedCoordinates = [
          ...headCoordinates,
          newCoordinates,
          ...tailCoordinates,
        ];
        geometry.setCoordinates(updatedCoordinates);
        feature.setGeometry(geometry);

        changes.push({
          id: featureId,
          from: originalCoordinates,
          to: updatedCoordinates,
        });
      }

      addHistoryEntry({
        type: "grense",
        changes,
      });

      const highlightGeometry = selectedPoint.getGeometry() as Point;
      highlightGeometry.setCoordinates(newCoordinates);
      reset(undefined, { keepValues: true });
      toast({ status: "success", title: "Punktet ble flyttet" });
    }
  };

  return (
    <AbsolutePanel $isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlayPanel} size="sm">
        Flytt punkt med koordinater
      </PanelHeader>
      <Form onSubmit={handleSubmit(movePoint)}>
        <InputRow>
          <Input label="Nord" {...register("north")} />
          <Input label="Øst" {...register("east")} />
        </InputRow>
        <Button type="submit" isDisabled={!isDirty}>
          Flytt punkt til koordinater
        </Button>
        <Button
          variant="tertiary"
          onClick={() => {
            reset();
            resetTool();
          }}
        >
          Avbryt
        </Button>
      </Form>
    </AbsolutePanel>
  );
};

export default KoordinaterPanel;
