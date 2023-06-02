import { SelectedPoint, useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, AbsolutePanel } from "./Panel";
import Input from "components/form/Input/Input";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import Button from "components/form/Button/Button";
import LineString from "ol/geom/LineString";
import { useEffect } from "react";
import { HistoryChange, useToolbarSaving } from "contexts/ToolbarContext";

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
  gap: 16px;
`;

const KoordinaterPanel = ({ isOpen, className }: PanelProps) => {
  const { closeOverlayPanel, selectedPoint } = useOverlayPanel();
  const { addEntry } = useToolbarSaving();

  const defaultValues = (koordinater: SelectedPoint) => ({
    east: koordinater ? koordinater.coordinates[0] : undefined,
    north: koordinater ? koordinater.coordinates[1] : undefined,
  });

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
  }, [selectedPoint, reset]);

  const movePoint = () => {
    if (selectedPoint) {
      // getValues skal returnere et tall, men den returnerer string for en eller annen grunn
      const newCoordinates: [number, number] = [
        +getValues("east"),
        +getValues("north"),
      ];

      const changes: HistoryChange<number[][]>[] = [];

      for (const feature of selectedPoint.features) {
        const featureId = feature.getId() as string;
        const geometry = feature.getGeometry() as LineString;
        const coordinates = geometry.getCoordinates();

        // Siden OL-objekter er mutable og vi trenger dette til senere:
        const originalCoordinates = [...coordinates];

        const nearestVertexIndex = coordinates.findIndex(
          (v) =>
            v[0] === selectedPoint.coordinates[0] &&
            v[1] === selectedPoint.coordinates[1]
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

      addEntry({
        type: "grense",
        changes,
      });
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
        <Button type="submit" disabled={!isDirty}>
          Flytt punkt til koordinater
        </Button>
        <Button
          variant="tertiary"
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
