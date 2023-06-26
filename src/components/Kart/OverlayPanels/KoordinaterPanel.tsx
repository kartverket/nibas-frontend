import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, AbsolutePanel } from "./Panel";
import Input from "components/form/Input/Input";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import LineString from "ol/geom/LineString";
import { useEffect } from "react";
import { HistoryChange, useHistory } from "contexts/HistoryContext";
import { SelectedPoint, useFeatureStyle } from "contexts/FeatureStyleContext";
import Point from "ol/geom/Point";
import { Button } from "@kvib/react";

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
  const { selectedPoint, selectedFeatures } = useFeatureStyle();
  const { addHistoryEntry } = useHistory();

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

  // Tilbakestill defaultverdier når man endrer valgt punkt
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
          (v) => v[0] === oldCoordinates[0] && v[1] === oldCoordinates[1]
        );
        const headCoordinates = coordinates.slice(0, nearestVertexIndex);
        const tailCoordinates = coordinates.slice(nearestVertexIndex + 1);

        const updatedCoordinates = [
          ...headCoordinates,
          newCoordinates,
          ...tailCoordinates,
        ];
        geometry.setCoordinates(updatedCoordinates);

        // TODO: trengs denne?
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
    }
  };

  return (
    <AbsolutePanel isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlayPanel}>
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
          variant="ghost"
          onClick={() => {
            reset();
            closeOverlayPanel();
          }}
        >
          Avbryt
        </Button>
      </Form>
    </AbsolutePanel>
  );
};

export default KoordinaterPanel;
