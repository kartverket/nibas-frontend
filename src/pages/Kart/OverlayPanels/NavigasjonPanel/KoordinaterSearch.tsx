import { Button, FormControl, FormErrorMessage, InputGroup, InputRightAddon } from "@kvib/react";
import Input from "components/Input";
import useNibasApi from "hooks/useNibasApi";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { styled } from "styled-components";
import { coordinateDecimalPattern, coordinateDecimalPatternHelperText } from "../FlyttKoordinaterPanel";
import { NavigasjonProps } from "./NavigasjonPanel";
import { isPointInsideMultiPolygon } from "./koordinater-utils";

const StyledFormControl = styled(FormControl)`
  display: grid;
  grid-template-columns: 256px 256px min-content;
  justify-content: space-between;
`;

const StyledFormErrorMessage = styled(FormErrorMessage)`
  grid-column: 1 / -2;
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
  const { data: nasjon } = useNibasApi("/v1/nasjon/");
  const [error, setError] = useState<string | null>();

  return (
    <form
      onSubmit={handleSubmit(() => {
        const [east, north] = [getValues("east"), getValues("north")];
        if (
          east !== null &&
          north !== null &&
          nasjon?.omraade?.coordinates != null &&
          isPointInsideMultiPolygon(east, north, nasjon?.omraade?.coordinates)
        ) {
          setError(null);
          centerOnCoordinate(north, east);
          reset();
        } else {
          setError("Koordinatene må være innenfor Norge sine grenser");
        }
      })}
    >
      <StyledFormControl isInvalid={error != null}>
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

        <Button type="submit" disabled={!isDirty}>
          Gå til koordinater
        </Button>
        {error != null && <StyledFormErrorMessage>{error}</StyledFormErrorMessage>}
      </StyledFormControl>
    </form>
  );
};
