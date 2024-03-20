import { AbsolutePanel, PanelProps } from "./Panel";
import { Button, Input, InputGroup, InputRightAddon } from "@kvib/react";
import { useForm } from "react-hook-form";
import { map } from "../constants";
import { coordinateDecimalPattern, coordinateDecimalPatternHelperText } from "./KoordinaterPanel";
import { keyframes, styled } from "styled-components";
import { useOverlayPanel } from "contexts/OverlayPanelContext";

const NavigasjonPanel = ({ isOpen, className }: PanelProps) => {
  const { closeOverlayModal } = useOverlayPanel();
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<{ north: number | null; east: number | null }>({
    defaultValues: { north: null, east: null },
  });

  const centerOnCoordinate = () => {
    const { north, east } = getValues();
    if (north !== null && east !== null) {
      const view = map.getView();
      view.animate({ duration: 250, center: [east, north] });
      reset();
      closeOverlayModal();
    }
  };

  return (
    <Container $isOpen={isOpen} className={className}>
      <Form onSubmit={handleSubmit(centerOnCoordinate)}>
        <InputGroup>
          <Input
            type="text"
            inputMode="decimal"
            pattern={coordinateDecimalPattern.source}
            title={coordinateDecimalPatternHelperText}
            placeholder="Fyll inn koordinat ..."
            isRequired
            {...register("north")}
          />
          <InputRightAddon>N</InputRightAddon>
        </InputGroup>
        <InputGroup>
          <Input
            type="text"
            inputMode="decimal"
            pattern={coordinateDecimalPattern.source}
            title={coordinateDecimalPatternHelperText}
            placeholder="Fyll inn koordinat ..."
            isRequired
            {...register("east")}
          />
          <InputRightAddon>Ø</InputRightAddon>
        </InputGroup>
        <Button type="submit" isDisabled={!isDirty}>
          Gå til koordinater
        </Button>
      </Form>
    </Container>
  );
};

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -10%);
  }
  to {
    opacity: 1;
    transform: translateX(-50%);
  }
`;

const Container = styled(AbsolutePanel)`
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  max-width: unset;
  width: fit-content;
  padding: 24px;
  animation: ${fadeIn} 0.25s ease-in-out;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 256px 256px min-content;
  gap: 16px;
`;

export default NavigasjonPanel;
