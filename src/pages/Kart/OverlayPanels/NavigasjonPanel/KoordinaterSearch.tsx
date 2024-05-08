import { Alert, AlertIcon, Button, FormErrorMessage, InputGroup, Select, Text } from "@kvib/react";
import Input from "components/Input";
import useNibasApi from "hooks/useNibasApi";
import { transform } from "ol/proj";
import { getCurrentProjectionName, isLatLongProjection } from "pages/Kart/Kartinformasjon";
import { useState } from "react";
import { ChangeHandler, useForm } from "react-hook-form";
import { styled } from "styled-components";
import { EPSGCode, defaultProjectionEpsgCode, projectionDefinitions } from "utils/map/projections";
import { coordinateDecimalPattern, coordinateDecimalPatternHelperText } from "../FlyttKoordinaterPanel";
import { NavigasjonProps } from "./NavigasjonPanel";
import { isPointInsideMultiPolygon } from "./koordinater-utils";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  row-gap: 16px;
`;
const InputContainer = styled.div`
  display: flex;
  column-gap: 16px;
`;

const SpacedRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  // dette er projeksjonen brukeren sier at de gir koordinatene på
  const [coordinatesProjection, setCoordinatesProjection] = useState<EPSGCode>(defaultProjectionEpsgCode);
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

  const submitCoordinates = (north: number | null, east: number | null) => {
    if (north != null && east != null) {
      const parsedNorth = parseFloat(north.toString());
      const parsedEast = parseFloat(east.toString());
      if (!isNaN(parsedNorth) && !isNaN(parsedEast) && isFinite(parsedNorth) && isFinite(parsedEast)) {
        const transformedCoordinates = transform(
          [parsedEast, parsedNorth],
          coordinatesProjection,
          defaultProjectionEpsgCode,
        );
        centerOnCoordinate(transformedCoordinates[1], transformedCoordinates[0]);
        reset();
      }
    }
  };

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
      submitCoordinates(north, east);
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

  const registerWithClearErrorsOnChange = (field: keyof KoordinaterForm) => {
    const { onChange, ...rest } = register(field, numericFieldValidator);
    const handleOnChange: ChangeHandler = (value) => {
      clearErrors(field);
      clearErrors("insideMultiPolygon");
      return onChange(value);
    };

    return {
      onChange: handleOnChange,
      ...rest,
    };
  };

  return (
    <Form onSubmit={handleSubmit(onFormSubmit)}>
      <InputContainer>
        <InputGroup>
          <Input
            type="text"
            inputMode="decimal"
            pattern={coordinateDecimalPattern.source}
            title={coordinateDecimalPatternHelperText}
            placeholder="Fyll inn koordinat ..."
            label={isLatLongProjection(coordinatesProjection) === true ? "Breddegrad" : "Øst"}
            isRequired
            {...registerWithClearErrorsOnChange("east")}
            validationError={{
              showError: !!formErrors.east,
              message: formErrors.east?.message ?? "",
            }}
          />
        </InputGroup>
        {formErrors.east != null && <StyledFormErrorMessage>{formErrors.east.message}</StyledFormErrorMessage>}

        <InputGroup>
          <Input
            type="text"
            inputMode="decimal"
            pattern={coordinateDecimalPattern.source}
            title={coordinateDecimalPatternHelperText}
            placeholder="Fyll inn koordinat ..."
            label={isLatLongProjection(coordinatesProjection) === true ? "Lengdegrad" : "Nord"}
            isRequired
            {...registerWithClearErrorsOnChange("north")}
            validationError={{
              showError: !!formErrors.north,
              message: formErrors.north?.message ?? "",
            }}
          />
        </InputGroup>
        {formErrors.north != null && <StyledFormErrorMessage>{formErrors.north.message}</StyledFormErrorMessage>}
      </InputContainer>
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
      <SpacedRow>
        <Text>
          Nåværende kartprojeksjon er <b>{getCurrentProjectionName(false)}</b>
        </Text>
        <Button type="submit" isDisabled={!isDirty}>
          Gå til koordinater
        </Button>
        {formErrors.insideMultiPolygon != null && (
          <StyledFormErrorMessage>{formErrors.insideMultiPolygon.message}</StyledFormErrorMessage>
        )}
      </SpacedRow>
    </Form>
  );
};
