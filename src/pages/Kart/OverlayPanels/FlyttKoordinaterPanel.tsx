import { Alert, AlertIcon, Button, Select, Spacer, Text, useToast } from "@kvib/react";
import Input from "components/Input";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { SelectedPoint } from "contexts/FeatureStyleContext/types";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { GrenseEntry, HistoryChange, HistoryDirection, MinimalGrense } from "contexts/HistoryContext/types";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { editSource } from "hooks/layers/constants";
import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import { transform } from "ol/proj";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { styled } from "styled-components";
import { EPSGCode, defaultProjectionEpsgCode, projectionDefinitions } from "utils/map/projections";
import { AbsolutePanel, PanelHeader, PanelProps } from "./Panel";
import { getCurrentProjectionName, isLatLongProjection } from "../Kartinformasjon";

type KoordinaterFormData = {
  north: number;
  east: number;
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
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

  const [coordinatesProjection, setCoordinatesProjection] = useState<EPSGCode>(defaultProjectionEpsgCode);

  // Tilbakestill defaultverdier når man endrer eller oppdaterer valgt punkt
  useEffect(() => {
    reset(defaultValues(selectedPoint));
    setCoordinatesProjection(defaultProjectionEpsgCode);
  }, [selectedPoint, reset, selectedFeatures]);

  const movePoint = () => {
    if (selectedPoint) {
      // getValues skal returnere et tall, men den returnerer string for en eller annen grunn
      // Transformerer gitte koordinater til det kartet bruker
      const newCoordinates = transform(
        [+getValues("east"), +getValues("north")],
        coordinatesProjection,
        defaultProjectionEpsgCode,
      );
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

  return (
    <AbsolutePanel $isOpen={isOpen}>
      <PanelHeader onClose={closeOverlayPanel} isSmall>
        Flytt punkt med koordinater
      </PanelHeader>
      <Form onSubmit={handleSubmit(movePoint)}>
        <Select
          value={coordinatesProjection}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCoordinatesProjection(e.target.value as EPSGCode)}
        >
          {projectionDefinitions.map((projection) => (
            <option value={projection.epsgCode} key={projection.epsgCode}>
              {projection.name}
            </option>
          ))}
        </Select>
        {coordinatesProjection !== defaultProjectionEpsgCode && (
          <Alert>
            <AlertIcon />
            Du har valgt et annet koordinatsystem enn hva kartet bruker. Koordinatene du har skrevet inn blir derfor
            transformert til kartet sitt koordinatsystem.
          </Alert>
        )}
        <Text>
          Nåværende kartprojeksjon er <b>{getCurrentProjectionName(false)}</b>
        </Text>
        <InputRow>
          <Input
            type="text"
            inputMode="decimal"
            pattern={coordinateDecimalPattern.source}
            title={coordinateDecimalPatternHelperText}
            label={isLatLongProjection(coordinatesProjection) === true ? "Lat" : "Øst"}
            {...register("east")}
          />
          <Input
            type="text"
            inputMode="decimal"
            pattern={coordinateDecimalPattern.source}
            title={coordinateDecimalPatternHelperText}
            label={isLatLongProjection(coordinatesProjection) === true ? "Long" : "Nord"}
            {...register("north")}
          />
        </InputRow>
        <InputRow>
          <Spacer />
          <Button
            variant="tertiary"
            onClick={() => {
              reset();
              resetTool();
            }}
          >
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
