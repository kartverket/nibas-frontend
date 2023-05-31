import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, AbsolutePanel } from "./Panel";
import Input from "components/form/Input/Input";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import Button from "components/form/Button/Button";
import LineString from "ol/geom/LineString";
import { useEffect } from "react";
import { useToolbarSaving } from "contexts/ToolbarContext";

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
  const {
    closeOverlayPanel,
    selectedFeature,
    punktKoordinater,
    setPunktKoordinater,
  } = useOverlayPanel();
  const { addEntry } = useToolbarSaving();

  const defaultValues = (koordinater: number[] | null) => ({
    east: koordinater ? koordinater[0] : undefined,
    north: koordinater ? koordinater[1] : undefined,
  });

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<KoordinaterFormData>({
    defaultValues: defaultValues(punktKoordinater),
  });

  // Tilbakestill defaultverdier når man endrer valgt punkt
  useEffect(() => {
    reset(defaultValues(punktKoordinater));
  }, [punktKoordinater, reset]);

  const movePoint = () => {
    if (selectedFeature && punktKoordinater) {
      const featureId = selectedFeature.getId() as string;
      const geometry = selectedFeature.getGeometry() as LineString;
      const coordinates = geometry.getCoordinates();

      // Siden OL-objekter er mutable og vi trenger dette til senere:
      const originalCoordinates = [...coordinates];

      const nearestVertexIndex = coordinates.findIndex(
        (v) => v[0] === punktKoordinater[0] && v[1] === punktKoordinater[1]
      );
      const headCoordinates = coordinates.slice(0, nearestVertexIndex);
      const tailCoordinates = coordinates.slice(nearestVertexIndex + 1);

      // getValues skal returnere et tall, men den returnerer string for en eller annen grunn
      const newCoordinate: [number, number] = [
        +getValues("east"),
        +getValues("north"),
      ];

      const updatedCoordinates = [
        ...headCoordinates,
        newCoordinate,
        ...tailCoordinates,
      ];
      geometry.setCoordinates(updatedCoordinates);
      selectedFeature.setGeometry(geometry);
      setPunktKoordinater(newCoordinate);

      addEntry({
        type: "grense",
        changes: [
          {
            id: featureId,
            from: originalCoordinates,
            to: updatedCoordinates,
          },
        ],
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
