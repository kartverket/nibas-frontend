import { Alert, AlertIcon, Button, FormControl, FormErrorMessage, FormLabel, Select, useToast } from "@kvib/react";
import Input from "components/Input";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { SelectedPoint } from "contexts/FeatureStyleContext/types";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { GrenseEntry, HistoryChange, HistoryDirection, MinimalGrense } from "contexts/HistoryContext/types";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { useToolbar } from "contexts/ToolbarContext";
import { editSource } from "hooks/layers/constants";
import useNibasApi from "hooks/useNibasApi";
import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import { useCallback, useEffect, useState } from "react";
import { ChangeHandler, useForm } from "react-hook-form";
import { styled } from "styled-components";
import { EPSGCode, mapProjectionEPSGCode, projectionDefinitions } from "utils/map/projections";
import { getLabelsFromProjection } from "../Kartinformasjon";
import {
  decimalCoordinatePattern,
  dmsCoordinatePattern,
  isPointInsideMultiPolygon,
  transformCoordinatesToProjection,
} from "./NavigasjonPanel/koordinater-utils";
import { AbsolutePanel, PanelHeader, SidePanel } from "./Panel";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";

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

const SpacedFormControl = styled(FormControl)`
  display: flex;
  flex-direction: column;
`;

const CoordinatesAlert = styled(Alert)`
  margin-top: 8px;
`;

const InputRow = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;
  margin: 16px 0 0;
`;

const ButtonRow = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;
  justify-content: flex-end;
`;

const FlyttKoordinaterPanel = () => {
  const { closeOverlayPanel } = useOverlayPanel();
  const { selectedPoint, selectedFeatures, selectPointOnFeature } = useFeatureStyle();
  const { resetTool } = useToolbar();
  const { addHistoryEntry } = useHistory();
  const toast = useToast();
  const [projectionOfCoordinates, setProjectionOfCoordinates] = useState<EPSGCode>(mapProjectionEPSGCode);

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
    clearErrors,
    formState: { isDirty, errors: formErrors },
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
  // TODO: Dette burde ikke være en useEffect. Burde bruke events eller callbacks
  // At dette er en useEffect fører til flere rerenders enn nødvendig. I till
  useEffect(() => {
    reset(defaultValues(selectedPoint));
    setProjectionOfCoordinates(mapProjectionEPSGCode);
  }, [selectedPoint, reset, selectedFeatures]);

  const movePoint = (newCoordinates: [number, number]) => {
    if (selectedPoint) {
      // getValues skal returnere et tall, men den returnerer string for en eller annen grunn
      // Transformerer gitte koordinater til det kartet bruker
      const oldGeometry = selectedPoint.getGeometry() as Point;
      const oldCoordinates = oldGeometry.getCoordinates();

      const changes: HistoryChange<MinimalGrense>[] = [];

      for (const feature of selectedFeatures) {
        const featureId = feature.getId()?.toString();
        const geometry = feature.getGeometry() as LineString;
        const coordinates = geometry.getCoordinates();

        if (featureId == null) {
          continue;
        }

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
    setGlobalFormError(null);
    reset();
    resetTool();
  };

  const { gyldighetsdato } = useValgtGyldighetsdato();
  const { data: nasjon, isLoading, error: nasjonFetchError } = useNibasApi("/v1/nasjon/", { gyldighetsdato });
  const [globalFormError, setGlobalFormError] = useState<string | null>();

  const movePointToCoordinates = () => {
    setGlobalFormError(null);
    const [east, north] = [getValues("east"), getValues("north")];
    const transformedCoordinates = transformCoordinatesToProjection(
      east,
      north,
      projectionOfCoordinates,
      mapProjectionEPSGCode,
    );
    if (transformedCoordinates != null) {
      if (nasjonFetchError != null) {
        movePoint([transformedCoordinates[0], transformedCoordinates[1]]);
      } else if (
        isLoading === false &&
        nasjon?.omraade?.coordinates != null &&
        isPointInsideMultiPolygon(transformedCoordinates[0], transformedCoordinates[1], nasjon?.omraade?.coordinates)
      ) {
        movePoint([transformedCoordinates[0], transformedCoordinates[1]]);
      } else {
        setGlobalFormError("Koordinatene må være innenfor Norge sine grenser");
      }
    } else {
      setGlobalFormError(
        "Koordinatene er ikke på samme format. Benytt enten desimaltall eller DMS-format (00°00'00\")",
      );
    }
  };

  const coordinateFieldValidator = {
    required: `Du må skrive inn et koordinat`,
    pattern: {
      value: new RegExp(`(${decimalCoordinatePattern.source})|(${dmsCoordinatePattern.source})`),
      message:
        "Koordinatet er ikke skrevet på et gyldig format. Benytt enten desimaltall eller DMS-format (00°00'00\")",
    },
  };

  const registerWithClearErrorsOnChange = (field: keyof KoordinaterFormData) => {
    const { onChange, ...rest } = register(field, coordinateFieldValidator);
    const handleOnChange: ChangeHandler = (value) => {
      clearErrors(field);
      setGlobalFormError(null);
      return onChange(value);
    };

    return {
      onChange: handleOnChange,
      ...rest,
    };
  };

  return (
    <SidePanel>
      <PanelHeader onClose={onKoordinaterPanelClose} isSmall>
        Flytt punkt med koordinater
      </PanelHeader>
      <Form onSubmit={handleSubmit(movePointToCoordinates)}>
        <SpacedFormControl isInvalid={globalFormError != null && formErrors != null}>
          <FormLabel>Koordinatsystem</FormLabel>
          <Select
            isInvalid={false}
            value={projectionOfCoordinates}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setProjectionOfCoordinates(e.target.value as EPSGCode)
            }
          >
            {projectionDefinitions.map((projection) => (
              <option value={projection.epsgCode} key={projection.epsgCode}>
                {projection.name}
              </option>
            ))}
          </Select>
          {projectionOfCoordinates !== mapProjectionEPSGCode && (
            <CoordinatesAlert>
              <AlertIcon />
              Du har valgt et annet koordinatsystem enn hva kartet bruker. Koordinatene du har skrevet inn blir derfor
              transformert til kartet sitt koordinatsystem.
            </CoordinatesAlert>
          )}
          <InputRow>
            <Input
              type="text"
              label={getLabelsFromProjection(projectionOfCoordinates).x ?? ""}
              {...registerWithClearErrorsOnChange("east")}
              validationError={{
                showError: !!formErrors.east,
                message: formErrors.east?.message ?? "",
              }}
            />
            <Input
              type="text"
              label={getLabelsFromProjection(projectionOfCoordinates).y ?? ""}
              {...registerWithClearErrorsOnChange("north")}
              validationError={{
                showError: !!formErrors.north,
                message: formErrors.north?.message ?? "",
              }}
            />
          </InputRow>
          {globalFormError != null && <FormErrorMessage>{globalFormError}</FormErrorMessage>}
        </SpacedFormControl>
        <ButtonRow>
          <Button variant="tertiary" onClick={onKoordinaterPanelClose}>
            Avbryt
          </Button>
          <Button type="submit" isDisabled={!isDirty}>
            Flytt punkt til koordinater
          </Button>
        </ButtonRow>
      </Form>
    </SidePanel>
  );
};

export default FlyttKoordinaterPanel;
