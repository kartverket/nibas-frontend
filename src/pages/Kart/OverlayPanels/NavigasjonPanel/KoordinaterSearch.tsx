import { Button, InputGroup, InputRightAddon } from "@kvib/react";
import { useForm } from "react-hook-form";
import { coordinateDecimalPattern, coordinateDecimalPatternHelperText } from "../FlyttKoordinaterPanel";
import { NavigasjonProps } from "./NavigasjonPanel";
import { styled } from "styled-components";
import { norwayExtent } from "pages/Kart/constants";
import Input from "components/Input";

const Form = styled.form`
  display: grid;
  grid-template-columns: 256px 256px min-content;
  justify-content: space-between;
  gap: 16px;
`;

export const KoordinaterSearch = ({ onSelect: centerOnCoordinate }: NavigasjonProps) => {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<{ north: number | null; east: number | null }>({
    defaultValues: { north: null, east: null },
  });

  return (
    <Form
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
          {...register("north", {
            validate: (value: number | null) =>
              (value !== null && value > norwayExtent[1] && value < norwayExtent[3]) ||
              "Koordinatet må være innenfor Norges lengde",
          })}
          validationError={{
            showError: !!errors.north,
            message: errors.north?.message ?? "",
          }}
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
          {...register("east", {
            validate: (value: number | null) =>
              (value !== null && value > norwayExtent[0] && value < norwayExtent[2]) ||
              "Koordinatet må være innenfor Norges bredde",
          })}
          validationError={{
            showError: !!errors.east,
            message: errors.east?.message ?? "",
          }}
        />
        <InputRightAddon>Ø</InputRightAddon>
      </InputGroup>
      <Button type="submit" isDisabled={!isDirty}>
        Gå til koordinater
      </Button>
    </Form>
  );
};
