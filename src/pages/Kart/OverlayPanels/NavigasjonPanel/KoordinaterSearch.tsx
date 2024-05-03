import { Button, FormControl, FormErrorMessage, InputGroup, InputRightAddon } from "@kvib/react";
import Input from "components/Input";
import useNibasApi from "hooks/useNibasApi";
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

type KoordinaterForm = {
  north: number | null;
  east: number | null;
  insideMultiPolygon: null;
};

export const KoordinaterSearch = ({ onSelect: centerOnCoordinate }: NavigasjonProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { isDirty, errors: formErrors },
  } = useForm<KoordinaterForm>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: { north: null, east: null, insideMultiPolygon: null },
  });

  const { data: nasjon, isLoading, error: nasjonFetchError } = useNibasApi("/v1/nasjon/");

  const validatePointInsideMultiPolygon = (north: number | null, east: number | null) => {
    if (nasjonFetchError != null || isLoading) {
      return true;
    }
    return (
      !isLoading &&
      east !== null &&
      north !== null &&
      nasjon?.omraade?.coordinates != null &&
      isPointInsideMultiPolygon(east, north, nasjon?.omraade?.coordinates)
    );
  };

  const onFormSubmit = ({ north, east }: KoordinaterForm) => {
    if (validatePointInsideMultiPolygon(north, east)) {
      centerOnCoordinate(north, east);
      reset();
      return true;
    }
    setError("insideMultiPolygon", { message: "Koordinatene må være innenfor Norge sine grenser" });
    return false;
  };

  const numericFieldValidator = {
    required: `Du må skrive inn et koordinat`,
    pattern: {
      value: coordinateDecimalPattern,
      message: `Koordinatet må være et gyldig heltall med punktum som desimaltallseparator.`,
    },
  };

  const clearErrorsOnChange = (field: keyof KoordinaterForm) => () => {
    clearErrors(field);
    clearErrors("insideMultiPolygon");
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <StyledFormControl isInvalid={formErrors.insideMultiPolygon != null}>
        <FormControl isInvalid={formErrors.north != null}>
          <InputGroup>
            <Input
              isInvalid={formErrors.north != null}
              type="text"
              inputMode="decimal"
              title={coordinateDecimalPatternHelperText}
              placeholder="Fyll inn koordinat ..."
              {...register("north", numericFieldValidator)}
              onChange={clearErrorsOnChange("north")}
            />
            <InputRightAddon>N</InputRightAddon>
          </InputGroup>
          {formErrors.north != null && <StyledFormErrorMessage>{formErrors.north.message}</StyledFormErrorMessage>}
        </FormControl>

        <FormControl isInvalid={formErrors.east != null}>
          <InputGroup>
            <Input
              isInvalid={formErrors.east != null}
              type="text"
              inputMode="decimal"
              title={coordinateDecimalPatternHelperText}
              placeholder="Fyll inn koordinat ..."
              {...register("east", numericFieldValidator)}
              onChange={clearErrorsOnChange("east")}
            />
            <InputRightAddon>Ø</InputRightAddon>
          </InputGroup>
          {formErrors.east != null && <StyledFormErrorMessage>{formErrors.east.message}</StyledFormErrorMessage>}
        </FormControl>

        <Button type="submit" disabled={!isDirty}>
          Gå til koordinater
        </Button>
        {formErrors.insideMultiPolygon != null && (
          <StyledFormErrorMessage>{formErrors.insideMultiPolygon.message}</StyledFormErrorMessage>
        )}
      </StyledFormControl>
    </form>
  );
};
