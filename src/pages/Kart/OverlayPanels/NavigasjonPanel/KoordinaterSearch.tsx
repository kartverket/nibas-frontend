import { Button, Input, InputGroup, InputRightAddon } from "@kvib/react";
import { useForm } from "react-hook-form";
import { coordinateDecimalPattern, coordinateDecimalPatternHelperText } from "../FlyttKoordinaterPanel";
import { NavigasjonProps } from "./NavigasjonPanel";
import { styled } from "styled-components";

const Form = styled.form`
  display: grid;
  grid-template-columns: 256px 256px min-content;
  gap: 16px;
`;

export const KoordinaterSearch = ({ onSelect: centerOnCoordinate }: NavigasjonProps) => {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<{ north: number | null; east: number | null }>({
    defaultValues: { north: null, east: null },
  });

  return (
    <SpacedForm
      onSubmit={handleSubmit(() => {
        centerOnCoordinate(getValues("north"), getValues("east"));
        reset();
      })}
    >
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
    </SpacedForm>
  );
};

const SpacedForm = styled(Form)`
  justify-content: space-between;
`;
