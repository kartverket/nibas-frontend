import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, AbsolutePanel } from "./Panel";
import Input from "components/Input";
import { useForm } from "react-hook-form";
import { styled } from "styled-components";
import LineString from "ol/geom/LineString";
import { useCallback, useEffect, useState } from "react";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { HistoryChange, MinimalGrense, HistoryDirection, GrenseEntry } from "contexts/HistoryContext/types";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { SelectedPoint } from "contexts/FeatureStyleContext/types";
import Point from "ol/geom/Point";
import { Button, FormControl, FormErrorMessage, Spacer, useToast } from "@kvib/react";
import { editSource } from "hooks/layers/constants";
import { useToolbar } from "contexts/ToolbarContext";
import { Feature } from "ol";
import useNibasApi from "hooks/useNibasApi";
import { isPointInsideMultiPolygon } from "./NavigasjonPanel/koordinater-utils";

type KoordinaterFormData = {
  north: number;
  east: number;
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding-bottom: 16px;
`;

const InputRow = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;
`;

export const coordinateDecimalPattern = /^-?\d+(\.\d+)?$/;
export const coordinateDecimalPatternHelperText = "Koordinatet ditt må være et tall med eventuell punktum-separator";

const FlyttKoordinaterPanel = ({ isOpen }: PanelProps) => {
  const { closeOverlayPanel } = useOverlayPanel();
  const { selectedPoint, selectedFeatures, selectPointOnFeature } = useFeatureStyle();
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
  const getCoordinateFromChange = (change: HistoryChange<MinimalGrense>, direction: HistoryDirection) => {
    for (let index = 0; index < change.from.coordinates.length; index++) {
      const fromCoord = change.from.coordinates[index];
      const toCoord = change.to.coordinates[index];
      if (fromCoord[0] !== toCoord[0] || fromCoord[1] !== toCoord[1]) {
        return change[direction].coordinates[index];
      }
    }
  };

  const setFormValues = useCallback(
    (e: CustomEvent, direction: HistoryDirection) => {
      // Dette skal bare kjøres dersom et punkt er valgt, ikke ved alle grensendringer
      if (selectedPoint) {
        const entry = e.detail.entry as GrenseEntry;

        // Dersom en valgt feature blir endret ved history må vi oppdatere valgt punkt
        const selectedChange = entry.changes.find((c) => selectedFeatures.some((f) => f.getId() === c.id));

        if (selectedChange) {
          const coordinate = getCoordinateFromChange(selectedChange, direction);
          if (coordinate) {
            const features = [];
            for (const change of entry.changes) {
              const editFeature = editSource.getFeatureById(change.id) as Feature<LineString> | null;
              if (editFeature) {
                features.push(editFeature);
              }
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

      const changes: HistoryChange<MinimalGrense>[] = [];

      for (const feature of selectedFeatures) {
        const featureId = feature.getId()?.toString();
        const geometry = feature.getGeometry() as LineString;
        const coordinates = geometry.getCoordinates();

        if (featureId == null) continue;

        // Siden OL-objekter er mutable og vi trenger dette til senere:
        const originalCoordinates = [...coordinates];

        const nearestVertexIndex = coordinates.findIndex(
          (v) => v[0] === oldCoordinates[0] && v[1] === oldCoordinates[1],
        );
        const headCoordinates = coordinates.slice(0, nearestVertexIndex);
        const tailCoordinates = coordinates.slice(nearestVertexIndex + 1);

        const updatedCoordinates = [...headCoordinates, newCoordinates, ...tailCoordinates];
        geometry.setCoordinates(updatedCoordinates);
        feature.setGeometry(geometry);

        changes.push({
          id: featureId,
          from: {
            coordinates: originalCoordinates,
          },
          to: {
            coordinates: updatedCoordinates,
          },
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

  const onKoordinaterPanelClose = () => {
    closeOverlayPanel();
    setError(null);
    reset();
    resetTool();
  };

  const { data: nasjon, isLoading, error: nasjonFetchError } = useNibasApi("/v1/nasjon/");
  const [error, setError] = useState<string | null>();

  const moveToCoordinate = () => {
    if (nasjonFetchError != null) {
      movePoint();
    } else if (
      isLoading === false &&
      nasjon?.omraade?.coordinates != null &&
      isPointInsideMultiPolygon(getValues("east"), getValues("north"), nasjon?.omraade?.coordinates)
    ) {
      setError(null);
      movePoint();
    } else {
      setError("Koordinatene må være innenfor Norge sine grenser");
    }
  };

  return (
    <AbsolutePanel $isOpen={isOpen}>
      <PanelHeader onClose={onKoordinaterPanelClose} isSmall>
        Flytt punkt med koordinater
      </PanelHeader>
      <Form onSubmit={handleSubmit(moveToCoordinate)}>
        <FormControl isInvalid={error != null}>
          <InputRow>
            <Input
              type="text"
              inputMode="decimal"
              pattern={coordinateDecimalPattern.source}
              title={coordinateDecimalPatternHelperText}
              label="Nord"
              {...register("north")}
            />
            <Input
              type="text"
              inputMode="decimal"
              pattern={coordinateDecimalPattern.source}
              title={coordinateDecimalPatternHelperText}
              label="Øst"
              {...register("east")}
            />
          </InputRow>
          {error != null && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
        <InputRow>
          <Spacer />
          <Button variant="tertiary" onClick={onKoordinaterPanelClose}>
            Avbryt
          </Button>
          <Button type="submit" isDisabled={!isDirty}>
            Flytt punkt til koordinater
          </Button>
        </InputRow>
      </Form>
    </AbsolutePanel>
  );
};

export default FlyttKoordinaterPanel;
